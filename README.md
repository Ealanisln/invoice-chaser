# Invoice Chaser Agent

> Tu agente que cobra por ti. Lee tu Gmail, identifica facturas vencidas y redacta 3 follow-ups con tonos escalados. Tú apruebas con un click.

**Hackathon submission**: Vercel "Zero to Agent" — **Track 2 (v0 + MCPs)**.
**Powered by**: v0 + Vercel AI SDK v6 + Composio Gmail MCP + OpenAI `gpt-4o-mini`.

- 🎥 **Demo video**: _(pegar URL Loom/YouTube aquí al final)_
- 🌐 **Live**: _(pegar URL Vercel aquí al final)_

---

## ¿Qué hace?

1. Conecta tu Gmail (vía Composio MCP — OAuth manejado).
2. El agente identifica clientes con facturas vencidas.
3. Redacta 3 versiones de follow-up por factura: **cordial**, **firme**, **aviso final**.
4. Tú apruebas con un click y se envía.

Si Composio no está conectado, cae a un mock inbox con 5 emails de ejemplo — la demo nunca se cae.

---

## Stack

- **Next.js 16** (App Router)
- **AI SDK v6** (`streamText` + `stopWhen: stepCountIs(5)` + `toUIMessageStreamResponse`)
- **`@ai-sdk/react`** v3 (`useChat` con `UIMessage.parts[]`)
- **Composio Gmail MCP** vía `createMCPClient` (transport SSE)
- **shadcn/ui** + Tailwind (UI generada con v0)
- **Vercel** (deploy desde minuto 0:30)

---

## Correr local

```bash
git clone <repo-url> && cd invoice-chaser
npm install
cp .env.example .env.local   # llenar OPENAI_API_KEY, COMPOSIO_MCP_URL
npm run dev
```

Smoke test:

```bash
curl http://localhost:3000/api/ping
# → {"ok":true}
```

Luego en el chat: `revisa qué facturas tengo vencidas`.

---

## Estructura

```
app/
  page.tsx                  # Dashboard (chat + lista de facturas)
  api/
    chat/route.ts           # Agente — streamText + tools + MCP
    ping/route.ts           # Smoke test
lib/
  mock-inbox.ts             # 5 emails mock (plan A real)
.claude/
  agents/                   # Subagents para depurar/escribir
  skills/                   # ship-hackathon, mcp-wire
  settings.json             # Allowlist de comandos
```

---

## Roadmap

Ver [`ROADMAP.md`](./ROADMAP.md) — plan de la sesión de 5h y qué viene post-hackathon (Composio OAuth en vivo, persistencia, multi-tenant, Stripe).

---

## Licencia

MIT.
