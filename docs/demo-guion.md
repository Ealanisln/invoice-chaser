# Demo Guión — Loom 60-75s para submission

Versión "Demo B" — combina mock + Composio Gmail real, diferenciador para Track 2 (v0 + MCPs).

## Setup pre-grabación

- Browser limpio, `cmd+shift+f` para fullscreen Chrome
- Cierra todas las tabs visibles del lado
- Tab del demo: https://invoice-chaser-eight.vercel.app/app
- DevTools cerrado
- Notificaciones de Slack/Discord en silencio
- Carga la app antes de iniciar grabación (evita first-paint en el video)
- Refresca el chat para que arranque limpio (sin historial)

## Timing

| Tiempo | Pantalla | Acción / Voz |
|---|---|---|
| 0–5s | Cara o logo | "Soy freelancer y mis clientes me deben 148 mil pesos. Mira esto." |
| 5–15s | Dashboard primer load | Mostrar UI completa, header + chat vacío + panel derecho con empty state |
| 15–30s | Tipear `revisa mis facturas vencidas` | 5 cards aparecen en el panel derecho, total $148,000 MXN resaltado en verde |
| 30–45s | Tipear `redacta cordial para Laura` | Email completo en español aparece. Click en botón verde "Copiar email" → toast verde "Email copiado al portapapeles" |
| 45–55s | Tipear `conecta mi gmail` | Aparece link markdown verde clickable. Click → autoriza en Composio (rápido, ya conectado o cuenta dummy) |
| 55–65s | Vuelves al chat → tipear `busca facturas en mi gmail enviado` | Lista REAL de Gmail aparece (Invoice #0042, #0041, etc.) |
| 65–72s | Tipear `redacta cordial para el #1` | Email coherente con el subject del invoice real |
| 72–75s | Cierre, voz | "Mock como fallback, Gmail real con Composio MCP, 3 tonos de cobro. Track 2." |

## Frases exactas a tipear (copy-paste-ready)

```
revisa mis facturas vencidas
redacta cordial para Laura
conecta mi gmail
busca facturas en mi gmail enviado
redacta cordial para el #1
```

## Tips de grabación

- **Loom** (gratis hasta 5 min, sobra)
- Cámara opcional, voz NO opcional
- 1 sola toma — la edición pausada no agrega
- Si te trabas en la mitad, no pares, sigue. La autenticidad gana
- Ritmo: que la lista de facturas se vea bien (1-2 seg pausa) antes de tipear lo siguiente
- Si el agente toma >5s en una respuesta, usa esos segundos para narrar voz: "el agente está usando Composio para hablar con la API de Gmail"

## Pasos post-grabación (5 min)

1. Loom → "Share" → copiar URL pública (debe ser visible sin login)
2. En `README.md` reemplazar el placeholder de `🎥 Demo video` con la URL real
3. `git add README.md && git commit -m "docs: add demo video URL" && git push`
4. Verificar Loom abre en incógnito (sin login)
5. Submit en https://community.vercel.com/hackathons/zero-to-agent
   - Project name: Invoice Chaser
   - Track: 2 (v0 + MCPs)
   - Live URL: https://invoice-chaser-eight.vercel.app
   - Repo: https://github.com/Ealanisln/invoice-chaser
   - Video: la URL de Loom
   - Description: copy del header del README

## Rollback si algo se cae en vivo

Si Composio falla o Gemini quota se agota durante la grabación:
- **Plan B**: graba solo el flow del mock (steps 1-4 del timing). Llega a 45s, sigue siendo válido.
- En el cierre menciona: "Powered by Composio Gmail MCP, with mock fallback for demo reliability."
- El jurado lo entiende.
