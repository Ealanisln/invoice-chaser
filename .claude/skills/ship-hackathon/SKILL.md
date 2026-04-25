---
name: ship-hackathon
description: Run the full submission flow for the Vercel "Zero to Agent" hackathon — build, deploy to prod, smoke test, generate the README + video checklist, and surface the submission URL. Use when the user says "ship it", "submit", "vamos a submitir", "deploy final".
---

# Ship Hackathon — submission flow

Lleva al usuario desde "el agente funciona en local" hasta "submitted en la plataforma del hackathon". Aprox 15 min si todo va bien.

## Pre-condiciones

Antes de correr este skill, verifica:

- [ ] El agente responde correctamente en `localhost:3000` (probar manualmente con `revisa mis facturas vencidas`)
- [ ] `OPENAI_API_KEY` está en Vercel (`vercel env ls`)
- [ ] `git status` está limpio o todos los cambios están en el branch correcto

Si falta algo, **detente y dile al usuario qué falta** antes de continuar.

## Pasos

### 1. Build local primero (sanity check, ~30s)

```bash
npm run build
```

Si falla, **NO deployes**. Lee el error y arréglalo. Causas típicas: type error en `parts[]` rendering, tool schema mal, import path roto.

### 2. Deploy a producción

```bash
git add -A && git commit -m "ship: hackathon submission"
git push
vercel --prod
```

Captura la URL de producción que devuelve Vercel.

### 3. Smoke tests en prod

```bash
# 1. Endpoint vivo
curl https://<deploy-url>/api/ping
# → {"ok":true}

# 2. Agente responde + streaming + tool calls
curl -N https://<deploy-url>/api/chat \
  -X POST -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"revisa mis facturas vencidas"}]}]}'
# → Debe ver eventos SSE con tool-call y tool-result
```

Si alguno falla, **arregla antes de seguir**.

### 4. Actualizar README con URLs reales

Editar `README.md`:
- Reemplazar `_(pegar URL Loom/YouTube aquí al final)_` con el video real (ver paso 5)
- Reemplazar `_(pegar URL Vercel aquí al final)_` con la URL de producción
- Verificar que mencione "Track 2 — v0 + MCPs" y "Composio Gmail MCP"

```bash
grep -i "track 2" README.md   # debe matchear
grep -i "composio" README.md  # debe matchear
```

### 5. Checklist de video (60–75s)

Decirle al usuario que grabe (Loom o QuickTime) con esta estructura:

| Tiempo | Contenido |
|---|---|
| 0–5s | Hook: "Soy freelance LATAM, mis clientes no pagan a tiempo" |
| 5–20s | Pan al dashboard, narra la propuesta de valor |
| 20–45s | Prompt al agente "revisa mis facturas vencidas" — mostrar streaming + tool call en pantalla |
| 45–70s | Pedir 3 follow-ups con tonos distintos, mostrar las cards |
| 70–75s | Cierre: "v0 + AI SDK v6 + Composio MCP. Hecho en 5h." |

**Recordatorio**: el video DEBE ser público (Loom unlisted o YouTube unlisted) — el jurado tiene que poder verlo sin login.

### 6. Submission

URL: **https://community.vercel.com/hackathons/zero-to-agent**

Campos típicos:
- Project name: `Invoice Chaser Agent`
- Track: `Track 2 — v0 + MCPs`
- Live URL: `<la URL de Vercel>`
- Repo: `<la URL de GitHub>`
- Video: `<URL Loom/YouTube>`
- Description (1 párrafo): copiar la frase del README ("Tu agente que cobra por ti...")

### 7. Confirmación final

Reporta al usuario:

```
✅ Submitted — Invoice Chaser Agent
   • Live: <url>
   • Repo: <url>
   • Video: <url>
   • Track: 2 (v0 + MCPs)
```

## Si algo se rompe en el último minuto

- **Vercel deploy falla** → revisa env vars en `vercel env ls`. Falta `OPENAI_API_KEY`? Agrégala y `vercel --prod` de nuevo.
- **Agente funciona local pero no en prod** → casi siempre es env var faltante. `curl /api/chat` y mira el error en logs (`vercel logs <url>`).
- **Video se corrompió / no carga** → re-graba en QuickTime, sube a YouTube unlisted como backup. **No-video = no-submission**, así que esto es la prioridad #1.

## Filosofía

- **No-video = no-submission.** Si quedan 5 min y todavía no hay video, deja todo y graba.
- **Funcional > bonito.** El jurado ve un agente decidiendo + tools ejecutando. Padding y spacing no importan.
- **Lo que se rompió en prod, fakealo en el video.** El demo se ensaya, no se improvisa.
