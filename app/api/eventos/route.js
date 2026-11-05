// Registro de métricas de la web pública (HU-11): visitas a páginas y clics en WhatsApp.
// No guarda IP, cookies ni navegador (Ley 1581). Los robots no cuentan. La RLS de `eventos` solo
// deja al público insertar; nadie de afuera puede leer lo registrado.
import { publicClient, supabaseConfigurado } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

const ROBOTS = /bot|crawl|spider|slurp|lighthouse|headless|vercel|preview|monitor|curl|wget|python/i;
const TIPOS = new Set(["visita", "whatsapp"]);

export async function POST(request) {
  if (!supabaseConfigurado()) return new Response(null, { status: 204 });
  if (ROBOTS.test(request.headers.get("user-agent") || "")) return new Response(null, { status: 204 });

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const tipo = String(body?.tipo || "");
  if (!TIPOS.has(tipo)) return new Response(null, { status: 400 });
  // Solo la ruta, sin parámetros: ?q= podría traer lo que el cliente escribió.
  const ruta = String(body?.ruta || "").split("?")[0].slice(0, 300);
  if (!ruta.startsWith("/") || ruta.startsWith("/admin") || ruta.startsWith("/api")) return new Response(null, { status: 204 });
  const producto = tipo === "whatsapp" ? String(body?.producto || "").slice(0, 100) : "";

  // Un fallo al registrar nunca debe afectar al visitante.
  await publicClient().from("eventos").insert({ tipo, ruta, producto }).then(() => null, () => null);
  return new Response(null, { status: 204 });
}
