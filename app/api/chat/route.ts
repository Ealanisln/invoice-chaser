import {
  streamText,
  stepCountIs,
  tool,
  convertToModelMessages,
  type UIMessage,
} from 'ai';
import { createMCPClient } from '@ai-sdk/mcp';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { mockEmails } from '@/lib/mock-inbox';

export const maxDuration = 30;

const localTools = {
  listOverdueInvoices: tool({
    description: 'Lista todas las facturas vencidas del inbox del freelancer (mock fallback)',
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
};

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  let mcpTools: Record<string, unknown> = {};
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;
  let mcpStatus: 'connected' | 'disabled' | 'failed' = 'disabled';

  if (process.env.COMPOSIO_MCP_URL && process.env.COMPOSIO_API_KEY) {
    try {
      mcpClient = await createMCPClient({
        transport: {
          type: 'http',
          url: process.env.COMPOSIO_MCP_URL,
          headers: { 'x-consumer-api-key': process.env.COMPOSIO_API_KEY },
        },
      });
      mcpTools = await mcpClient.tools();
      mcpStatus = 'connected';
      console.log(`[MCP] Composio connected, ${Object.keys(mcpTools).length} tools loaded`);
    } catch (err) {
      mcpStatus = 'failed';
      console.warn('[MCP] Composio connection failed, using mock fallback:', err);
    }
  }

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(8),
    tools: { ...localTools, ...mcpTools },
    onFinish: async () => {
      await mcpClient?.close();
    },
    system: `Eres un agente que ayuda a freelancers mexicanos a cobrar facturas vencidas.

Tienes dos fuentes de datos:
1. **Mock inbox local** (tool: listOverdueInvoices) — siempre disponible, 5 facturas demo. **Esta es tu fuente PRIMARIA** para "revisar facturas".
2. **Composio MCP** ${mcpStatus === 'connected' ? '(CONECTADO con ' + Object.keys(mcpTools).length + ' tools meta)' : '(NO disponible)'} — para conectar apps reales como Gmail/Slack vía OAuth. Solo úsalo si el usuario explícitamente pide "conecta mi Gmail real" o similar.

Cuando el usuario pida revisar facturas → siempre llama a listOverdueInvoices (popula el panel UI).
${
  mcpStatus === 'connected'
    ? 'Si pide "conecta mi Gmail" → usa COMPOSIO_MANAGE_CONNECTIONS con toolkit name "gmail" action "add" y muestra el redirect_url al usuario como link markdown.\nSi pregunta qué integraciones soportas → menciona Composio: Gmail, Slack, GitHub, etc.'
    : ''
}

Cuando pida un follow-up y NO conozcas el invoiceId, primero llama a listOverdueInvoices para encontrarlo por nombre del cliente, monto, o servicio. NO le preguntes al usuario el número de factura — tú lo buscas.

Después llama a draftFollowUp con el invoiceId y tono, y escribe el email completo (asunto + cuerpo) en tu respuesta, listo para copiar.

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
