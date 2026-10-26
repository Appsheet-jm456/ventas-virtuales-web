import Link from "next/link";
import { getPublicInventory } from "../../../../lib/inventory";
import { parseImages, parseVideos } from "../../../../lib/images";
import { waLink } from "../../../../lib/site";
import { getSite, mensajeProducto } from "../../../../lib/configuracion";
import Gallery from "../../../components/Gallery";
import { fichaDe } from "../../../../lib/ficha";
import { textoPlano } from "../../../../lib/texto-seguro";
import TextoSeguro, { LineaSegura } from "../../../components/TextoSeguro";

export const revalidate = 60;

const f = (r, k) => (r?.[k] ?? "").toString().trim();
const stockNum = (r) => parseInt(f(r, "Stock") || "0", 10) || 0;

function fmtPrecio(r) {
  const n = Number(f(r, "Precio").replace(/[^\d.-]/g, ""));
  return !isNaN(n) && n > 0 ? `$${n.toLocaleString("es-CO")}` : "";
}

async function findProduct(codigo) {
  const target = decodeURIComponent(codigo).trim().toLowerCase();
  const { rows } = await getPublicInventory();
  return rows.find((r) => f(r, "Código").toLowerCase() === target) || null;
}

export async function generateMetadata({ params }) {
  const [r, site] = await Promise.all([findProduct(params.codigo), getSite()]);
  if (!r) return { title: `Producto no encontrado — ${site.nombre}` };
  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ") || f(r, "Código");
  return {
    title: `${nombre} — ${site.nombre}`,
    description: (textoPlano(f(r, "Resumen")) || f(r, "Descripción")).slice(0, 150) || `Compra ${nombre} en ${site.nombre}.`,
  };
}

// Íconos de la fila de datos clave (HU-29), trazo de 24×24.
const ICONOS = {
  cpu: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  ram: <><rect x="3" y="7" width="18" height="10" rx="1.5" /><path d="M7 7v10M11 7v10M15 7v10M3 20h18" /></>,
  disco: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="15.5" cy="12" r="3" /><path d="M7 9h2M7 15h2" /></>,
  pantalla: <><rect x="2" y="4" width="20" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></>,
};
// Íconos de la tarjeta Especificaciones según la característica (HU-29, ajuste del 26 oct).
const ICONOS_FICHA = {
  ...ICONOS,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  gpu: <><rect x="2" y="7" width="20" height="10" rx="1.5" /><circle cx="9" cy="12" r="2.5" /><path d="M15 10h3M15 14h3M5 17v3" /></>,
  wifi: <><path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><path d="M12 19.5h.01" /></>,
  red: <><rect x="6" y="3" width="12" height="12" rx="1.5" /><path d="M9 15v3h6v-3M9 7v3M12 7v3M15 7v3M12 18v3" /></>,
  puertos: <><path d="M12 2v14M8 6l4-4 4 4M7 11v2a5 5 0 0 0 10 0v-2" /><circle cx="12" cy="19" r="2" /></>,
  bateria: <><rect x="2" y="7" width="17" height="10" rx="2" /><path d="M22 11v2M6 10v4M9.5 10v4" /></>,
  sistema: <><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></>,
  teclado: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></>,
  camara: <><path d="M3 8h4l2-3h6l2 3h4v11H3z" /><circle cx="12" cy="13" r="3.5" /></>,
  peso: <><path d="M6 8h12l3 12H3z" /><circle cx="12" cy="5" r="2" /></>,
  escudo: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
};
const PALABRAS_ICONO = [
  ["procesador", "cpu"], ["cpu", "cpu"], ["memoria", "ram"], ["ram", "ram"], ["almacenamiento", "disco"], ["ssd", "disco"],
  ["disco", "disco"], ["pantalla", "pantalla"], ["grafic", "gpu"], ["video", "gpu"], ["conectividad", "wifi"], ["wi-fi", "wifi"],
  ["wifi", "wifi"], ["bluetooth", "wifi"], ["ethernet", "red"], ["red", "red"], ["puerto", "puertos"], ["usb", "puertos"],
  ["bateria", "bateria"], ["cargador", "bateria"], ["sistema", "sistema"], ["windows", "sistema"], ["teclado", "teclado"],
  ["camara", "camara"], ["peso", "peso"], ["dimension", "peso"], ["garantia", "escudo"], ["estado", "escudo"],
];
const iconoDe = (campo) => PALABRAS_ICONO.find(([p]) => sinTilde(campo).includes(p))?.[1] || "info";
const Ico = ({ d }) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const sinTilde = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const SPECS = [
  ["Categoría", "Categoría"],
  ["Marca", "Marca"],
  ["Modelo", "Modelo"],
  ["Procesador", "Procesador"],
  ["Generación", "Generación"],
  ["RAM", "RAM"],
  ["Almacenamiento", "Almacenamiento"],
  ["Estado", "Estado"],
];

export default async function ProductPage({ params }) {
  const [r, site] = await Promise.all([findProduct(params.codigo), getSite()]);
  const wa = (texto) => waLink(texto, site.whatsapp);

  if (!r) {
    return (
      <main className="pd wrap">
        <div className="crumbs"><Link href="/">Inicio</Link> / Producto</div>
        <h1 className="section-title">Producto no encontrado</h1>
        <p className="section-sub">
          Es posible que ya no esté disponible. <Link href="/productos">Ver el catálogo completo</Link> o{" "}
          <a href={wa("Hola 👋, busco un producto que vi en su página y ya no aparece.")} target="_blank" rel="noopener noreferrer">
            pregúntanos por WhatsApp
          </a>.
        </p>
      </main>
    );
  }

  const nombre = [f(r, "Marca"), f(r, "Modelo")].filter(Boolean).join(" ")
    || f(r, "Descripción").slice(0, 60) || f(r, "Código");
  const sold = stockNum(r) <= 0;
  const precio = fmtPrecio(r);
  const msg = mensajeProducto(site.mensajeProducto, nombre, f(r, "Código"));
  const ficha = fichaDe(r.Ficha);
  const valorFicha = (palabra) => ficha.find((x) => sinTilde(x.campo).includes(palabra))?.valor || "";
  const generacion = f(r, "Generación");
  const datos = [
    ["cpu", "Procesador", [f(r, "Procesador"), generacion && !/gen/i.test(f(r, "Procesador")) ? `${generacion}ª Gen` : ""].filter(Boolean).join(" ")],
    ["ram", "Memoria RAM", f(r, "RAM")],
    ["disco", "Almacenamiento", f(r, "Almacenamiento")],
    ["pantalla", "Pantalla", valorFicha("pantalla")],
  ].filter((x) => x[2]);
  const resumen = f(r, "Resumen");
  const detalleTitulo = f(r, "Título descripción");
  const detalle = f(r, "Descripción larga");
  const hayDetalle = Boolean(detalleTitulo || detalle);
  const bloqueDetalle = hayDetalle && (
    <section className="pd-detalle" aria-labelledby={detalleTitulo ? "pd-detalle-t" : undefined} aria-label={detalleTitulo ? undefined : "Descripción"}>
      <span className="pd-chip">Descripción</span>
      {detalleTitulo && <h2 id="pd-detalle-t">{detalleTitulo}</h2>}
      <TextoSeguro texto={detalle} className="pd-detalle-txt" />
    </section>
  );

  return (
    <main className="pd wrap">
      <div className="crumbs">
        <Link href="/">Inicio</Link> / <Link href="/productos">Productos</Link> / {f(r, "Categoría") ? <><Link href={`/productos?categoria=${encodeURIComponent(f(r, "Categoría"))}`}>{f(r, "Categoría")}</Link> / </> : null}{f(r, "Código")}
      </div>

      <div className="pd-grid">
        <Gallery images={parseImages(r)} videos={parseVideos(r)} alt={nombre} sold={sold} />

        <div className="pd-info">
          {f(r, "Estado") && <span className="pd-insignia">{f(r, "Estado")}</span>}
          <h1>{nombre}</h1>
          <div className="pd-code">Ref: {f(r, "Código")}</div>
          {resumen && <p className="pd-resumen"><LineaSegura texto={resumen} /></p>}
          {datos.length > 0 && (
            <ul className="pd-datos" aria-label="Datos clave">
              {datos.map(([ico, etiqueta, valor]) => (
                <li key={ico} title={etiqueta}><Ico d={ICONOS[ico]} /><span><span className="sr-only">{etiqueta}: </span>{valor}</span></li>
              ))}
            </ul>
          )}

          {precio
            ? <div className="pd-price">{precio}</div>
            : <div className="pd-price tbd">Precio: consultar por WhatsApp</div>}
          <div className="pd-disp">
            {sold
              ? <span className="badge bad">AGOTADO</span>
              : <span className="badge ok">Disponible ({stockNum(r)})</span>}
          </div>

          <table className="specs">
            <tbody>
              {SPECS.map(([label, key]) =>
                f(r, key) ? (
                  <tr key={key}>
                    <th>{label}</th>
                    <td>{f(r, key)}</td>
                  </tr>
                ) : null
              )}
            </tbody>
          </table>

          {f(r, "Descripción") && <div className="pd-desc">{f(r, "Descripción")}</div>}

          {sold ? (
            <>
              <span className="btn-wa off">Producto agotado</span>
              <p className="pd-note">
                ¿Te interesa uno igual?{" "}
                <a href={wa(`Hola 👋, el *${nombre}* (código ${f(r, "Código")}) aparece agotado. ¿Tienen uno similar?`)} target="_blank" rel="noopener noreferrer">
                  Pregúntanos por WhatsApp
                </a>
              </p>
            </>
          ) : (
            <>
              <a className="btn-wa" href={wa(msg)} data-producto={f(r, "Código")} target="_blank" rel="noopener noreferrer">
                💬 Estoy interesado — WhatsApp
              </a>
              <p className="pd-note">Te atendemos por WhatsApp: {site.whatsappDisplay} · {site.ciudad}</p>
            </>
          )}
        </div>
      </div>

      {/* Descripción ampliada (HU-29) a la izquierda y Especificaciones (ficha técnica, HU-27) a la
          derecha. Con uno solo de los dos, ocupa todo el ancho. Texto seguro y texto plano: React
          escapa todo, no se interpreta HTML del dueño. */}
      {hayDetalle && ficha.length > 0 ? (
        <div className="pd-bloques">
          {bloqueDetalle}
          <aside className="pd-specs" aria-labelledby="pd-specs-t">
            <h2 id="pd-specs-t">Especificaciones</h2>
            <dl className="pd-specs-lista">
              {ficha.map((x, i) => (
                <div key={i} className="pd-spec">
                  <dt><Ico d={ICONOS_FICHA[iconoDe(x.campo)]} />{x.campo}</dt>
                  <dd>{x.valor}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      ) : hayDetalle ? bloqueDetalle : ficha.length > 0 && (
        <section className="pd-ficha" aria-labelledby="pd-ficha-t">
          <h2 id="pd-ficha-t">Ficha técnica completa</h2>
          <table className="pd-ficha-tabla">
            <tbody>
              {ficha.map((x, i) => (
                <tr key={i}>
                  <th scope="row">{x.campo}</th>
                  <td>{x.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
