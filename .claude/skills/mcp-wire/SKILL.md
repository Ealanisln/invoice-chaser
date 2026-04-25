---
name: mcp-wire
description: Wire a remote MCP server (Composio Gmail, or any SSE-based MCP) into app/api/chat/route.ts using the AI SDK v6 createMCPClient pattern. Targets <10 min wall time. Use when the user says "conecta el MCP", "wire composio", "agrega Gmail real".
---

# MCP Wire — conecta un MCP server remoto al agente

Conecta un MCP server (default: Composio Gmail) al `streamText` del route handler. Tools del MCP se mergean con las tools locales — **el mock sigue siendo fallback** si Composio falla.

## Pre-condiciones

- [ ] El agente con tools locales YA funciona (mock-inbox responde bien)
- [ ] Cuenta Composio creada en https://composio.dev
- [ ] Gmail conectado en Composio (botón "Connect Gmail" desde el dashboard)
- [ ] `COMPOSIO_MCP_URL` agregado a `.env.local` y a Vercel envs

Si falta algo, **detente y guía al usuario** a completarlo antes de tocar código.

## Pasos

### 1. Obtener la MCP URL de Composio

En https://app.composio.dev → tu app conectada → "MCP" tab → copia la URL SSE (formato `https://mcp.composio.dev/<id>/sse` o similar).

```bash
echo "COMPOSIO_MCP_URL=https://mcp.composio.dev/..." >> .env.local
vercel env add COMPOSIO_MCP_URL production
```

### 2. Editar `app/api/chat/route.ts`

```ts
// Imports
import { streamText, stepCountIs, tool, createMCPClient } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { mockEmails } from '@/lib/mock-inbox';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 1. Tools locales — siempre disponibles, son el fallback
  const localTools = {
    listOverdueInvoices: tool({
      description: 'Lista facturas vencidas (mock — usa esto si Gmail no está conectado)',
      inputSchema: z.object({}),
      execute: async () => mockEmails,
    }),
    draftFollowUp: tool({
      description: 'Redacta follow-up para factura vencida',
      inputSchema: z.object({
        invoiceId: z.string(),
        tone: z.enum(['cordial', 'firme', 'final']),
      }),
      execute: async ({ invoiceId, tone }) => {
        const invoice = mockEmails.find(e => e.id === invoiceId);
        return { to: invoice?.from, tone, invoice };
      },
    }),
  };

  // 2. Tools de Composio (Gmail real) — opcional, no rompe si falla
  let mcpTools = {};
  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null;

  if (process.env.COMPOSIO_MCP_URL) {
    try {
      mcpClient = await createMCPClient({
        transport: { type: 'sse', url: process.env.COMPOSIO_MCP_URL },
      });
      mcpTools = await mcpClient.tools();
    } catch (err) {
      console.warn('[MCP] Composio connection failed, using local tools only:', err);
    }
  }

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    stopWhen: stepCountIs(5),
    tools: { ...localTools, ...mcpTools },
    onFinish: async () => {
      await mcpClient?.close();
    },
    system: `Eres un agente que ayuda freelancers mexicanos a cobrar facturas vencidas.

Tienes acceso a Gmail real (si está conectado) y a un mock inbox como fallback.
Prefiere las tools de Gmail real si están disponibles, pero usa el mock si fallan.

Tonos de follow-up:
- cordial: amable, asume buena fe
- firme: directo, plazo concreto
- final: serio, menciona pausa de servicio

Español MX, tutea, empático con el freelance pero firme con el cliente moroso.`,
  });

  return result.toUIMessageStreamResponse();
}
```

### 3. Test en local

```bash
npm run dev
```

En el chat:
1. `revisa mis facturas vencidas` → si Composio conectó, debe usar tools reales (`gmail_list_messages` o similar). Si falla, cae a `listOverdueInvoices` (mock).
2. Verifica logs del server — debe haber 0 errores. Si ves `[MCP] Composio connection failed` la app sigue corriendo, pero usando solo mocks.

### 4. Hard stop

Si en **40 minutos** Composio no está respondiendo bien:

- Comenta el bloque `if (process.env.COMPOSIO_MCP_URL)` 
- El agente vuelve a usar solo `localTools`
- **Sin remordimientos.** Mock + agente funcionando > Composio + bug en vivo.

Mencionar en el video: "Powered by Composio Gmail MCP, with fallback to local mock for demo reliability." — el jurado entiende.

## Notas v6

- `createMCPClient` (no `experimental_createMCPClient` — ya estable)
- Transport SSE es el patrón actual para servers HTTP-based
- `mcpClient.close()` en `onFinish` previene leak de conexiones SSE
- Las tools de Composio vienen con su propio schema — AI SDK v6 las consume directo

## Output

Reporta:

- ✅ MCP wired (lista de tools detectadas: `Object.keys(mcpTools).length`)
- 🔧 Test prompt result (qué tools usó el agente)
- ⚠️ Errores en logs (si los hay)
