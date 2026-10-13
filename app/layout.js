import "./globals.css";
import Link from "next/link";
import { SITE, waLink } from "../lib/site";
import Brand from "./components/Brand";

const TITULO = `${SITE.nombre} — Computadores corporativos nuevos y usados en Cali`;
const DESCRIPCION =
  "Venta de portátiles corporativos usados y nuevos, torres tiny, partes y accesorios en Cali, Colombia. Garantía, envíos a todo el país y atención por WhatsApp.";

export const metadata = {
  // Con el dominio definitivo en NEXT_PUBLIC_SITE_URL, las vistas previas al compartir usan URLs absolutas.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: TITULO,
  description: DESCRIPCION,
  icons: { icon: SITE.logo },
  openGraph: {
    title: TITULO,
    description: DESCRIPCION,
    siteName: SITE.nombre,
    locale: "es_CO",
    type: "website",
    images: [{ url: SITE.logo }],
  },
};

export const viewport = { themeColor: "#17348f" };

const SALUDO = "Hola 👋, quiero información sobre sus computadores.";

function WaIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.8 0-3.5-.5-5-1.3l-.4-.2-4.9 1 1-4.7-.3-.4C5.5 17.9 5 16.5 5 15 5 9 9.9 4 16 4s11 5 11 11-4.9 10-11 10zm5.5-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="wrap hd-top">
            <Link href="/" className="brand" aria-label={SITE.nombre}>
              <Brand />
            </Link>

            {/* Buscador (HU-01): un formulario normal, funciona aun sin JavaScript. */}
            <form className="hd-search" action="/productos" role="search">
              <input name="q" type="search" placeholder="Buscar productos" aria-label="Buscar productos" />
              <button type="submit" aria-label="Buscar">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </form>

            <a className="hd-info hd-wa" href={waLink(SALUDO)} target="_blank" rel="noopener noreferrer">
              <span className="hd-ico wa"><WaIcon size={22} /></span>
              <span><b>WhatsApp</b><small>{SITE.whatsappDisplay}</small></span>
            </a>
            <div className="hd-info hd-ship">
              <span className="hd-ico">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" /><circle cx="6" cy="17" r="2" fill="#fff" /><circle cx="16.5" cy="17" r="2" fill="#fff" />
                </svg>
              </span>
              <span><b>Envíos</b><small>a todo el país</small></span>
            </div>
          </div>
          <nav className="hd-nav" aria-label="Principal">
            <div className="wrap hd-nav-in">
              <Link href="/">Inicio</Link>
              <Link href="/categorias">Categorías</Link>
              <Link href="/productos">Productos</Link>
              <Link href="#contacto">Contacto</Link>
            </div>
          </nav>
        </header>

        {children}

        <footer className="site-footer" id="contacto">
          <div className="wrap footer-grid">
            <div>
              <Brand variant="footer" />
              <p>{SITE.lema}. Ventas online y tienda física.</p>
            </div>
            <div>
              <div className="f-title">Contacto</div>
              <p className="f-addr">📍 {SITE.direccion}</p>
              <p>
                <a href={waLink(SALUDO)} target="_blank" rel="noopener noreferrer">
                  🟢 WhatsApp: {SITE.whatsappDisplay}
                </a>
              </p>
            </div>
            <div>
              <div className="f-title">Atención</div>
              {SITE.horario && <p>🕘 {SITE.horario}</p>}
              <p>Asesoría y cierre de venta por WhatsApp.</p>
              <p>🚚 Envíos a todo el país.</p>
            </div>
            <div>
              <div className="f-title">Síguenos</div>
              <p><a href={SITE.instagram} target="_blank" rel="noopener noreferrer">📸 Instagram</a></p>
              <p><a href={SITE.facebook} target="_blank" rel="noopener noreferrer">👍 Facebook</a></p>
              <p><a href={SITE.tiktok} target="_blank" rel="noopener noreferrer">🎵 TikTok</a></p>
            </div>
          </div>
          <div className="wrap f-note">
            Precios e inventario sujetos a cambios. Consulte con su asesor. © {new Date().getFullYear()} {SITE.nombre}.
          </div>
        </footer>

        {/* Botón flotante de WhatsApp */}
        <a
          className="wa-float"
          href={waLink(SALUDO)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
        >
          <WaIcon size={26} />
          <span>Escríbenos</span>
        </a>
      </body>
    </html>
  );
}
