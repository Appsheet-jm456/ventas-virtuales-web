import Link from "next/link";

// Barra superior de la web (HU-32): redes sociales a la izquierda; ubicación de la tienda,
// Nosotros y Contacto a la derecha. Se maneja en /admin/configuracion › Barra superior; las
// redes, en Redes sociales. Va debajo de la cinta y se va con el scroll (el encabezado queda fijo).

const REDES = [
  { clave: "facebook", nombre: "Facebook", icono: <path d="M14 8.5V6.8c0-.8.5-1 .9-1H17V2.3L14.1 2.3C10.9 2.3 10 4.7 10 6.6v1.9H8v3.6h2V22h4v-9.9h2.8l.4-3.6z" /> },
  { clave: "instagram", nombre: "Instagram", icono: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" /></> },
  { clave: "tiktok", nombre: "TikTok", icono: <path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.6a7.8 7.8 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4z" /> },
];

export default function BarraSuperior({ site, hayNosotros }) {
  const c = site.catalogo || {};
  if (c.barra_visible === false) return null;
  const redes = REDES.filter((r) => site[r.clave]);
  const direccion = [site.direccion, site.ciudad].filter(Boolean).join(", ");
  const mapa = c.ubicacion_mapa || (direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : "");
  const ubicacion = c.barra_ubicacion !== false && mapa;
  const nosotros = c.barra_nosotros !== false && hayNosotros;
  const contacto = c.barra_contacto !== false;
  if (!redes.length && !ubicacion && !nosotros && !contacto) return null;

  return (
    <div className="bs">
      <div className="wrap bs-in">
        <ul className="bs-redes" aria-label="Redes sociales">
          {redes.map((r) => (
            <li key={r.clave}>
              <a href={site[r.clave]} target="_blank" rel="noopener noreferrer" aria-label={`${r.nombre} de ${site.nombre}`} title={r.nombre}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">{r.icono}</svg>
              </a>
            </li>
          ))}
        </ul>
        <nav className="bs-enlaces" aria-label="Información de la tienda">
          {ubicacion && (
            <a href={mapa} target="_blank" rel="noopener noreferrer" className="bs-ubi" title={direccion} aria-label={`Ubicación de la tienda: ${direccion || c.ubicacion_texto}. Abre Google Maps`}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              <span>{c.ubicacion_texto || site.ciudad || "Nuestra tienda"}</span>
            </a>
          )}
          {nosotros && <Link href="/nosotros" className="bs-nosotros">Nosotros</Link>}
          {contacto && <a href="#contacto">Contacto</a>}
        </nav>
      </div>
    </div>
  );
}
