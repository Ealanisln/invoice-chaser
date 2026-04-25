# Roadmap — Invoice Chaser Agent

## Context

Plan de ejecución para una sesión de hackathon de 5h (Vercel "Zero to Agent", Track 2: v0 + MCPs, abril 24 – mayo 3 2026). Meta única: **submitir** un agente que detecta facturas vencidas y redacta follow-ups con tonos escalados.

Este doc es el plan minuto a minuto + qué viene después.

---

## Pre-flight (T−15 min)

```bash
# 1. Verificar Gemini key viva
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_GENERATIVE_AI_API_KEY" | head

# 2. composio.dev: cuenta + Gmail conectado
# 3. Login en vercel.com y v0.app, créditos verificados ($30 perk del hackathon)
# 4. Pestañas abiertas:
#    - https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools
#    - https://docs.composio.dev
#    - https://community.vercel.com/hackathons/zero-to-agent
```

---

## Bitácora real de la sesión (lo que efectivamente pasó)

| Bloque | Plan original | Realidad |
|---|---|---|
| Pre-flight | Mock + agent + deploy en 2h | Hecho fuera de sesión: `lib/mock-inbox.ts`, `app/api/{ping,chat}/route.ts`, deploy a `invoice-chaser-eight.vercel.app` |
| 0:30–2:00 (UI) | v0 con 1 generación | v0 MCP directo desde Claude Code, página dark fintech (zinc/emerald) |
| 2:00–3:15 (agente) | mock + tools | Ya existía, solo cambio de modelo OpenAI → `google('gemini-2.5-flash-lite')` |
| 3:15–3:55 (Composio) | SSE transport | Composio usa `streamable-http` (no SSE) + auth `x-consumer-api-key`. Wired con `@ai-sdk/mcp` (paquete separado en v6, no `'ai'` directo). 7 meta-tools cargadas (COMPOSIO_SEARCH_TOOLS, COMPOSIO_MANAGE_CONNECTIONS, etc.) — el agente usa mock por default y Composio bajo demanda explícita |
| Quota issue | — | `gemini-2.5-flash` agotó 20 RPD del free tier. Switch a `gemini-2.5-flash-lite` (1000 RPD) sin perder calidad para el demo |

## Plan minuto a minuto (referencia original)

### **0:00 – 0:30 — Setup, hello-world API, deploy**

```bash
cd /Users/ealanis/Development/current-projects
npx create-next-app@latest invoice-chaser --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd invoice-chaser
npm i ai @ai-sdk/google @ai-sdk/react zod
git init && gh repo create invoice-chaser --public --source=. --push
vercel link && vercel env add GOOGLE_GENERATIVE_AI_API_KEY
```

Crear `app/api/ping/route.ts` que devuelva `{ok: true}`, push, y verificar `https://<deploy>.vercel.app/api/ping` antes de tocar UI. **Esto valida la pipeline completa antes de que haya complejidad.**

### **0:30 – 2:00 — UI con v0 (UNA generación, sin iterar)**

$30 del perk del hackathon. Cada regenerada gasta $5–10. **Una generación bien prompteada y editas en local.**

Prompt a v0 (ver README anterior o `.claude/agents/v0-fixer.md`).

Reservar 15 min al final del bloque para fix del `parts[]` rendering — v0 probablemente lo ponga mal.

### **2:00 – 4:00 — El agente**

#### 2:00 – 2:15 — `lib/mock-inbox.ts`

5 emails con escenarios variados (ignora, da largas, alega bug, "la próxima semana", problema técnico). Ver `.claude/agents/email-tone-writer.md`.

#### 2:15 – 3:15 — `app/api/chat/route.ts`

```ts
import { streamText, stepCountIs, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { mockEmails } from '@/lib/mock-inbox';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      listOverdueInvoices: tool({
        description: 'Lista facturas vencidas del inbox',
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
    },
    system: `Eres un agente que ayuda freelancers mexicanos a cobrar facturas vencidas.

Cuando el usuario pida revisar facturas → listOverdueInvoices.
Cuando pida un follow-up → draftFollowUp con el tono apropiado, luego escribe el email completo en tu respuesta.

Tonos:
- cordial: amable, asume buena fe, ofrece ayuda
- firme: directo, plazo concreto, pide acción
- final: profesional pero serio, menciona pausa de servicio

Español MX, tutea, empático con el freelance pero firme con el cliente moroso.`,
  });

  return result.toUIMessageStreamResponse();
}
```

**Test gate (3:15)**: `npm run dev`, "revisa mis facturas vencidas" → lista las 5. "redacta cordial para Carlos" → email coherente. **Si pasa, ya ganaste.**

#### 3:15 – 3:55 — Composio Gmail MCP (solo si gate pasó)

Ver `.claude/skills/mcp-wire/SKILL.md`.

```ts
import { createMCPClient } from 'ai';

const mcpClient = await createMCPClient({
  transport: { type: 'sse', url: process.env.COMPOSIO_MCP_URL! },
});
const mcpTools = await mcpClient.tools();
// tools: { ...localTools, ...mcpTools }
```

**Hard stop a las 3:55**: si OAuth no está vivo, regresa al mock sin remordimientos.

### **4:00 – 4:30 — Polish visible**

- Loading dots
- Cards bonitas para emails generados (no JSON crudo)
- Toast cuando "envías" un email
- Favicon + `<title>` decentes
- **NO toques colores, spacing, ni metas dark mode**

### **4:30 – 5:00 — Submission**

Ver `.claude/skills/ship-hackathon/SKILL.md`. Resumen:

1. `vercel --prod` y abrir URL pública (no localhost)
2. Llenar README con deploy URL + video URL
3. Video Loom 60–75s (hook 5s → dashboard 15s → agente 25s → tonos 25s → cierre 5s)
4. Submit: https://community.vercel.com/hackathons/zero-to-agent

---

## Verificación end-to-end

```bash
# Agente responde en prod
curl -N https://<url>.vercel.app/api/chat \
  -X POST -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"revisa mis facturas vencidas"}]}'

npm run build                    # build local pasa
grep -i "track 2" README.md      # README menciona track
# Video URL accesible (Loom público o YouTube unlisted)
```

---

## Las 5 reglas que te salvan

1. Deploy desde 0:30, no al final
2. Mock inbox = plan A. Composio = bonus
3. v0: una generación bien prompteada. Cada regenerada cuesta $5–10
4. Si algo no funciona en 20 min → simplifica el feature, no debuguees
5. El video se graba aunque la app esté fea. **No-video = no-submission**

---

## Lo que NO vas a hacer

Auth · DB · multi-MCP · dark mode · tests · i18n · responsive perfecto · animaciones custom.

---

## Post-hackathon (si la cosa funciona y quieres convertirlo en producto)

### v0.1 — Composio OAuth real en vivo
- Reemplazar mock por `composio.connectedAccounts.initiate({ appName: 'gmail' })` flow
- UI para conectar Gmail con un click desde el dashboard
- Manejar tokens revocados / refresh

### v0.2 — Persistencia
- Postgres (Vercel Postgres o Neon free tier) para guardar:
  - Conexiones de usuario
  - Historial de follow-ups enviados (audit log)
  - Reglas custom por cliente ("a Carlos siempre cordial")
- Esquema mínimo: `users`, `connections`, `follow_ups`

### v0.3 — Multi-tenant + auth
- NextAuth con Google OAuth (para login del freelance, no del Gmail del cliente)
- Cada usuario ve solo sus facturas y conexiones
- Rate limiting por usuario

### v0.4 — Aprende de tus respuestas
- Cada vez que el usuario edita un follow-up generado, guardar el diff
- Few-shot al system prompt con los últimos 3 ejemplos editados
- "Tu agente aprendió que prefieres mencionar tipo de servicio"

### v0.5 — Cobros reales
- Stripe payment links autogenerados en cada follow-up
- "Paga aquí en 10s" → reduce fricción del cliente
- Tracking: ¿cuántos pagaron tras qué tono?

### v0.6 — Channels
- Además de email: WhatsApp Business API (LATAM ama WhatsApp)
- SMS (Twilio) para "aviso final"
- Slack si el cliente B2B usa Slack

### v0.7 — Pricing
- Free: 5 follow-ups/mes
- Pro $19/mes: ilimitados + analytics
- Team $49/mes: multi-usuario, branded emails

---

## Métricas de éxito post-hackathon

- 10 freelancers LATAM probando en la primera semana
- 1 cliente paga después de un follow-up generado
- Tiempo medio de cobro: 30 días → 18 días
