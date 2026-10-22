import Link from "next/link";
import { Inter, Montserrat } from "next/font/google";
import { waLink } from "../../lib/site";
import { getSite } from "../../lib/configuracion";
import Brand from "../components/Brand";
import Medidor from "../components/Medidor";
import Constelacion from "../components/Constelacion";
import "./tema-pantalla.css";

// Tipografía de la guía visual (HU-21): Montserrat en títulos, precios y botones; Inter en textos.
// next/font las descarga al compilar y las sirve la propia web.
const titulos = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-tit", display: "swap" });
const textos = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-txt", display: "swap" });

const SALUDO = "Hola 👋, quiero información sobre sus computadores.";

function WaIcon({ size = 24 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.8 0-3.5-.5-5-1.3l-.4-.2-4.9 1 1-4.7-.3-.4C5.5 17.9 5 16.5 5 15 5 9 9.9 4 16 4s11 5 11 11-4.9 10-11 10zm5.5-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

// Marco de la web pública: encabezado, pie y botón de WhatsApp. /admin no lo usa.
// La clase "tp" activa el «modo pantalla» de la guía visual solo aquí (tema-pantalla.css).
export default async function WebLayout({ children }) {
  const site = await getSite();
  const wa = (texto) => waLink(texto, site.whatsapp);
  return (
    <div className={`tp ${titulos.variable} ${textos.variable}`}>
        <header className="site-header">
          <div className="wrap hd-top">
            <Link href="/" className="brand" aria-label={site.nombre}>
              <Brand site={site} />
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

            <a className="hd-info hd-wa" href={wa(SALUDO)} target="_blank" rel="noopener noreferrer">
              <span className="hd-ico wa"><WaIcon size={22} /></span>
              <span><b>WhatsApp</b><small>{site.whatsappDisplay}</small></span>
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

        <Medidor />
        {children}

        <footer className="site-footer" id="contacto">
          <Constelacion semilla={21} puntos={30} ancho={1400} alto={420} />
          <div className="wrap footer-grid">
            <div>
              <Brand variant="footer" site={site} />
              <p>{site.lema}. Ventas online y tienda física.</p>
            </div>
            <div>
              <div className="f-title">Contacto</div>
              <p className="f-addr">📍 {site.direccion}</p>
              <p>
                <a href={wa(SALUDO)} target="_blank" rel="noopener noreferrer">
                  🟢 WhatsApp: {site.whatsappDisplay}
                </a>
              </p>
            </div>
            <div>
              <div className="f-title">Atención</div>
              {site.horario && <p>🕘 {site.horario}</p>}
              <p>Asesoría y cierre de venta por WhatsApp.</p>
              <p>🚚 Envíos a todo el país.</p>
            </div>
            <div>
              <div className="f-title">Síguenos</div>
              {site.instagram && <p><a href={site.instagram} target="_blank" rel="noopener noreferrer">📸 Instagram</a></p>}
              {site.facebook && <p><a href={site.facebook} target="_blank" rel="noopener noreferrer">👍 Facebook</a></p>}
              {site.tiktok && <p><a href={site.tiktok} target="_blank" rel="noopener noreferrer">🎵 TikTok</a></p>}
            </div>
          </div>
          <div className="wrap f-note">
            Precios e inventario sujetos a cambios. Consulte con su asesor. © {new Date().getFullYear()} {site.nombre}.
          </div>
        </footer>

        {/* Botón flotante de WhatsApp */}
        <a
          className="wa-float"
          href={wa(SALUDO)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
        >
          <WaIcon size={26} />
          <span>Escríbenos</span>
        </a>
    </div>
  );
}
