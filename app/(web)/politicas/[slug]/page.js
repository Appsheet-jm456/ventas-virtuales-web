import Link from "next/link";
import { notFound } from "next/navigation";
import { getPaginaPublica } from "../../../../lib/paginas";
import { getSite } from "../../../../lib/configuracion";
import { textoPlano } from "../../../../lib/texto-seguro";
import PoliticaVista from "../../../components/PoliticaVista";

export const revalidate = 60;

// Páginas de políticas (HU-26): las crea y edita el dueño en /admin/politicas. Una página oculta
// o inexistente responde «no encontrada».
export async function generateMetadata({ params }) {
  const [p, site] = await Promise.all([getPaginaPublica(params.slug), getSite()]);
  if (!p) return { title: `Página no encontrada — ${site.nombre}` };
  return {
    title: `${p.titulo} — ${site.nombre}`,
    description: textoPlano((p.secciones || []).map((s) => s.texto).join(" ")).slice(0, 155),
  };
}

const fecha = (iso) => {
  try { return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" }); }
  catch { return ""; }
};

export default async function PoliticaPage({ params }) {
  const p = await getPaginaPublica(params.slug);
  if (!p) notFound();
  return (
    <main className="wrap pv-pagina">
      <div className="crumbs crumbs-top"><Link href="/">Inicio</Link> / Soporte / {p.titulo}</div>
      <PoliticaVista titulo={p.titulo} estilo={p.estilo} secciones={p.secciones || []} actualizado={fecha(p.actualizado_en)} />
    </main>
  );
}
