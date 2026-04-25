# CLAUDE.md — Invoice Chaser Agent

Instrucciones para Claude Code al trabajar en este proyecto. Sesión de hackathon de 5h, Track 2 (v0 + MCPs) de "Zero to Agent" de Vercel.

---

## Filosofía del proyecto

Estamos en **modo hackathon**. Cero ceremonia. Estas reglas no son negociables:

- **No auth de usuarios. No DB. No persistencia. No tests. No i18n. No dark mode.**
- **Mock inbox es el plan A**, Composio Gmail real es bonus. El demo no se cae nunca.
- **Si algo no funciona en 20 min → simplifica el feature, no debuguees.**
- **El video se graba aunque la app esté fea. No-video = no-submission.**
- **Deploy desde el minuto 0:30**, no al final.

---

## Stack y versiones críticas

- **Next.js 16** App Router (no `src/` dir, alias `@/*`)
- **AI SDK v6** (`ai` package, última estable v6.0.x)
- **`@ai-sdk/react`** v3 — compatible con v6 server
- **`@ai-sdk/google`** — modelo `gemini-2.5-flash` (barato + rápido)
- **`zod`** para schemas de tools
- **Composio Gmail MCP** vía `createMCPClient` (SSE transport)

---

## ⚠️ Gotchas de AI SDK v6 (NO copiar código viejo de v4/v5)

Si encuentras código en docs/blogs/StackOverflow más viejo, **traduce primero**:

| ❌ Patrón viejo (v4/v5) | ✅ Patrón v6 correcto |
|---|---|
| `maxSteps: 5` | `stopWhen: stepCountIs(5)` (importar de `'ai'`) |
| `result.toDataStreamResponse()` | `result.toUIMessageStreamResponse()` |
| `experimental_createMCPClient` | `createMCPClient` (sin `experimental_`) |
| `parameters: z.object(...)` en `tool()` | `inputSchema: z.object(...)` |
| `message.content` (string) | `message.parts[]` — iterar por `type` (`text`, `tool-call`, `tool-result`) |

**`useChat` en v6**: el `messages` array contiene `UIMessage` con `parts: UIMessagePart[]`. Hay que iterar `parts` y renderizar cada uno según su `type`. v0 puede generar el patrón viejo — siempre revisa eso primero.

---

## Comandos

```bash
# Dev
npm run dev                          # localhost:3000

# Smoke test (después de deploy)
curl https://<deploy>.vercel.app/api/ping

# Test del agente en prod
curl -N https://<deploy>.vercel.app/api/chat \
  -X POST -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"revisa mis facturas vencidas"}]}'

# Build
npm run build

# Deploy
vercel --prod

# Env vars
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
vercel env add COMPOSIO_MCP_URL
```

---

## Reglas de edición

- **NO mover paddings/colores en `app/page.tsx` después de v0.** Cualquier ajuste visual = ediciones quirúrgicas en local, no regenerar con v0.
- **NO crear nuevos archivos fuera de la lista del README.** El proyecto cabe en ~6 archivos de código.
- **NO instalar dependencias adicionales** sin justificarlo en una línea. Cada `npm i` extra = 30s de build cada deploy.
- **Cuando edites `route.ts`, ejecuta el smoke test (curl al endpoint) antes de seguir.**

---

## Idioma

Toda la UI, system prompt, y outputs del agente: **español MX, tutea**, empático con el freelance pero firme con el cliente moroso. README puede ser bilingüe si ayuda al jurado.

---

## Subagents disponibles

Ver `.claude/agents/`:

- `agent-debugger` — depura por qué un tool no se invoca
- `v0-fixer` — adapta código v0 al patrón `parts[]` de v6
- `email-tone-writer` — escribe los 5 mock emails con escenarios variados

## Skills disponibles

Ver `.claude/skills/`:

- `ship-hackathon` — flow de submission completo
- `mcp-wire` — conecta un MCP server remoto al `route.ts`

---

## Cuando termine la sesión

1. README con video URL + deploy URL llenos
2. ROADMAP con sección "Post-hackathon" actualizada
3. Submit: https://community.vercel.com/hackathons/zero-to-agent
