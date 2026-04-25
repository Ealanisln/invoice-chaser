export async function GET() {
  return Response.json({ ok: true, service: 'invoice-chaser', ts: Date.now() });
}
