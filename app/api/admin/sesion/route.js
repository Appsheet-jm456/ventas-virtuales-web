// Quién soy y qué puedo hacer en el panel (HU-34). El menú lo usa para mostrar solo lo permitido;
// la protección real está en cada ruta y en la RLS.
import { accesoDeToken } from "../../../../lib/permisos";
import { tokenDe, supabaseConfigurado } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!supabaseConfigurado()) return Response.json({ error: "Faltan las claves de Supabase." }, { status: 500 });
  try {
    const acceso = await accesoDeToken(tokenDe(request));
    if (!acceso) return Response.json({ error: "Sesión no válida." }, { status: 401 });
    return Response.json({ acceso });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
