import "./globals.css";
import { SITE } from "../lib/site";

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

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
