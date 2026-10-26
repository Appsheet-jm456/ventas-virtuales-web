import Link from "next/link";
import { notFound } from "next/navigation";
import { getNosotrosPublico } from "../../../lib/nosotros";
import { getSite } from "../../../lib/configuracion";
import { textoPlano } from "../../../lib/texto-seguro";
import NosotrosVista from "../../components/NosotrosVista";

export const revalidate = 60;

// Página «Nosotros» (HU-33): la edita el dueño en /admin/configuracion/nosotros. Sin publicar,
// responde «no encontrada».
export async function generateMetadata() {
  const [n, site] = await Promise.all([getNosotrosPublico(), getSite()]);
  if (!n) return { title: `Página no encontrada — ${site.nombre}` };
  return {
    title: `${n.titulo} — ${site.nombre}`,
    description: textoPlano(n.bloques.map((b) => b.texto).join(" ")).slice(0, 155),
  };
}

export default async function NosotrosPage() {
  const n = await getNosotrosPublico();
  if (!n) notFound();
  return (
    <main className="wrap nv-pagina">
      <div className="crumbs crumbs-top"><Link href="/">Inicio</Link> / Nosotros</div>
      <NosotrosVista nosotros={n} />
    </main>
  );
}
