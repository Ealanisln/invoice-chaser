import { streamText, stepCountIs, tool, convertToModelMessages, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { mockEmails } from '@/lib/mock-inbox';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      listOverdueInvoices: tool({
        description: 'Lista todas las facturas vencidas del inbox del freelancer',
        inputSchema: z.object({}),
        execute: async () => mockEmails,
      }),
      draftFollowUp: tool({
        description:
          'Redacta un follow-up para una factura vencida con el tono especificado. Usa siempre después de listOverdueInvoices.',
        inputSchema: z.object({
          invoiceId: z.string().describe('id de la factura del inbox'),
          tone: z
            .enum(['cordial', 'firme', 'final'])
            .describe('tono del mensaje según historial del cliente'),
        }),
        execute: async ({ invoiceId, tone }) => {
          const invoice = mockEmails.find((e) => e.id === invoiceId);
          if (!invoice) {
            return { error: `No encontré la factura con id ${invoiceId}` };
          }
          return {
            to: invoice.from,
            toName: invoice.fromName,
            tone,
            invoice: {
              number: invoice.invoiceNumber,
              amount: invoice.invoiceAmount,
              service: invoice.service,
              daysOverdue: invoice.daysOverdue,
            },
          };
        },
      }),
    },
    system: `Eres un agente que ayuda a freelancers mexicanos a cobrar facturas vencidas.

Flujo:
- Cuando el usuario pida revisar facturas, llama a listOverdueInvoices.
- Cuando pida un follow-up y NO conozcas el invoiceId, primero llama a listOverdueInvoices para encontrarlo por nombre del cliente, monto, o servicio. NO le preguntes al usuario el número de factura — tú lo buscas.
- Después llama a draftFollowUp con el invoiceId y tono, y escribe el email completo (asunto + cuerpo) en tu respuesta, listo para copiar.

Cómo elegir el tono:
- cordial: primer contacto, cliente nuevo, sin historial conflictivo. Amable, asume buena fe, ofrece ayuda.
- firme: cliente que da largas, promesas rotas, 30-60 días vencido. Directo, plazo concreto, pide acción.
- final: 90+ días, silencio total, sin respuesta a recordatorios. Profesional pero serio, menciona pausa de servicio o cobranza formal.

Estilo de escritura:
- Español MX, tutea al cliente.
- Empático con el freelance pero firme con el cliente moroso.
- Sin emojis. Sin formalismos excesivos ("estimado", "atentamente").
- Mensaje breve: asunto + 3-5 oraciones máximo.
- Siempre incluye monto, número de factura y días de vencimiento.`,
  });

  return result.toUIMessageStreamResponse();
}
