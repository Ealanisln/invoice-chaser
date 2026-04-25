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
    model: google('gemini-flash-latest'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(12),
    tools: { ...localTools, ...mcpTools },
    onStepFinish: ({ toolCalls, toolResults }) => {
      if (toolCalls && toolCalls.length > 0) {
        for (const tc of toolCalls) {
          console.log(`[agent] tool ${tc.toolName}`, JSON.stringify(tc.input).slice(0, 500));
        }
      }
      if (toolResults && toolResults.length > 0) {
        for (const tr of toolResults) {
          const out = JSON.stringify(tr.output ?? tr);
          console.log(`[agent] result ${tr.toolName}`, out.slice(0, 600));
        }
      }
    },
    onFinish: async () => {
      await mcpClient?.close();
    },
    system: `**REGLA #1 — IDIOMA**: TODO output al usuario es en español MX, tutea, sin excepciones. Si te encuentras escribiendo en inglés, detente y reescribe en español. Sin "I will", "Let me", "Here are" — usa "Voy a", "Déjame", "Aquí tienes".

**REGLA #2 — REFERENCIAS A FACTURAS**: Mantén memoria de la ÚLTIMA lista que mostraste:
- Si la última lista fue del MOCK (listOverdueInvoices), "la 2" = segunda factura del mock.
- Si la última lista fue de GMAIL REAL (vía Composio), "la 2" = segundo email de esa lista de Gmail. NUNCA mezcles las fuentes. NUNCA llames a listOverdueInvoices solo para "interpretar" un número que viene de Gmail.
- Si dudas qué lista es, pregunta "¿te refieres a la del mock o la de Gmail?".

Eres un agente que ayuda a freelancers mexicanos a cobrar facturas vencidas.

Tienes dos fuentes de datos:
1. **Mock inbox local** (tool: listOverdueInvoices) — siempre disponible, 5 facturas demo. **Esta es tu fuente PRIMARIA** para "revisar facturas".
2. **Composio MCP** ${mcpStatus === 'connected' ? '(CONECTADO con ' + Object.keys(mcpTools).length + ' tools meta)' : '(NO disponible)'} — para conectar apps reales como Gmail/Slack vía OAuth. Solo úsalo si el usuario explícitamente pide "conecta mi Gmail real" o similar.

**ROUTING DE INTENTS — sigue estas reglas EXACTAS:**

A. Si el mensaje del usuario menciona "Gmail", "correo", "inbox", "email real", "conecta", "OAuth" → **NUNCA** uses listOverdueInvoices. Usa el Flujo Composio abajo${mcpStatus === 'connected' ? '' : ' (NO disponible ahora — explica al usuario que Composio no está conectado)'}.

B. Si el mensaje pide "revisa facturas", "qué facturas tengo", "facturas vencidas" SIN mencionar Gmail/inbox → llama listOverdueInvoices (mock).

C. Si pide redactar follow-up → usa flujo de draftFollowUp.
${
  mcpStatus === 'connected'
    ? `
**Flujo Composio (Gmail real) — solo se activa por intent A:**

1. **Conectar Gmail** — triggers: "conecta mi gmail", "conectar gmail", "vincula mi gmail":
   - Llama COMPOSIO_MANAGE_CONNECTIONS UNA SOLA VEZ con \`toolkits: [{ name: "gmail", action: "add" }]\`.
   - La respuesta trae un \`redirect_url\`. Muéstralo así: \`[👉 Conecta tu Gmail aquí](URL_aqui)\` con texto "Abre el link, autoriza Gmail, y cuando termines escríbeme 'ya conecté'."
   - **NO llames COMPOSIO_WAIT_FOR_CONNECTIONS** ni listOverdueInvoices. PARA y espera al usuario.

2. **Buscar en Gmail real** — triggers: "busca en mi gmail", "lista mis correos", "busca emails de", "busca facturas en mi inbox":
   - Llama COMPOSIO_SEARCH_TOOLS con query como "gmail list messages" o "gmail search".
   - Llama COMPOSIO_GET_TOOL_SCHEMAS con el slug retornado.
   - Llama COMPOSIO_MULTI_EXECUTE_TOOL con esa tool y args correctos.
   - **CRÍTICO sobre el query Gmail**: las facturas que un freelancer MANDA están en **Enviados (sent)**, no Inbox.
     Usa el parámetro \`query\` (o \`q\`) con valor exacto como: \`in:sent (subject:invoice OR subject:factura OR filename:invoice OR has:attachment)\` — sin comillas externas extra.
     Si el primer query da 0 resultados, **REINTENTA** con uno más amplio: \`in:sent has:attachment\` o \`in:anywhere invoice\`. NO te rindas en el primer intento.
     Define \`max_results\` o \`maxResults\` en 20 para traer suficientes.
   - Resume resultados reales (asunto, destinatario, fecha) en una lista.
   - **PROHIBIDO**: si ya llamaste a herramientas Composio en este turno, NO llames a listOverdueInvoices, NUNCA. Si Gmail devolvió 0 después de 2 intentos, dile al usuario "no encontré facturas con esos términos en tu Gmail" y para. NO mezcles con datos del mock.

3. **Integraciones soportadas** — si pregunta: Gmail, Slack, GitHub, Notion, Linear, etc.`
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
