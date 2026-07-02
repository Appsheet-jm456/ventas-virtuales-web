import "./globals.css";
import Link from "next/link";
import { SITE, waLink } from "../lib/site";
import Brand from "./components/Brand";

export const metadata = {
  title: `${SITE.nombre} — Computadores corporativos nuevos y usados en Cali`,
  description:
    "Venta de portátiles corporativos usados y nuevos, torres tiny, partes y accesorios en Cali, Colombia. Garantía y atención por WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="wrap header-in">
            <Link href="/" className="brand" aria-label={SITE.nombre}>
              <Brand />
            </Link>
            <nav className="main-nav">
              <Link href="/">Inicio</Link>
              <Link href="/#catalogo">Catálogo</Link>
              <Link href="/#contacto">Contacto</Link>
              <a
                className="nav-wa"
                href={waLink("Hola 👋, quiero información sobre sus computadores.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {SITE.whatsappDisplay}
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer" id="contacto">
          <div className="wrap footer-grid">
            <div>
              <Brand variant="footer" />
              <p>{SITE.lema}. Ventas online y tienda física.</p>
              <p className="f-addr">📍 {SITE.direccion}</p>
            </div>
            <div>
              <div className="f-title">Atención y ventas</div>
              <p>
                <a href={waLink("Hola 👋, quiero información sobre sus computadores.")} target="_blank" rel="noopener noreferrer">
                  🟢 WhatsApp: {SITE.whatsappDisplay}
                </a>
              </p>
              <p>Cierre de venta y asesoría por WhatsApp.</p>
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
          href={waLink("Hola 👋, quiero información sobre sus computadores.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbenos por WhatsApp"
        >
          <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
            <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.8 0-3.5-.5-5-1.3l-.4-.2-4.9 1 1-4.7-.3-.4C5.5 17.9 5 16.5 5 15 5 9 9.9 4 16 4s11 5 11 11-4.9 10-11 10zm5.5-7.5c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/>
          </svg>
          <span>Escríbenos</span>
        </a>
      </body>
    </html>
  );
}
