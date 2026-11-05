import "./globals.css";
import { getSite } from "../lib/configuracion";

const DESCRIPCION =
  "Venta de portátiles corporativos usados y nuevos, torres tiny, partes y accesorios en Cali, Colombia. Garantía, envíos a todo el país y atención por WhatsApp.";

// El nombre sale de la configuración (HU-15); lib/site.js es el respaldo.
export async function generateMetadata() {
  const site = await getSite();
  const titulo = `${site.nombre} — Computadores corporativos nuevos y usados en Cali`;
  return {
    // Con el dominio definitivo en NEXT_PUBLIC_SITE_URL, las vistas previas al compartir usan URLs absolutas.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: titulo,
    description: DESCRIPCION,
    icons: { icon: "/marca/icono.png", apple: "/marca/icono.png" },
    openGraph: {
      title: titulo,
      description: DESCRIPCION,
      siteName: site.nombre,
      locale: "es_CO",
      type: "website",
      images: [{ url: "/marca/og.png", width: 1200, height: 630 }],
    },
  };
}

// Color de la barra del navegador en celular: el azul pantalla de la guía visual (HU-21).
export const viewport = { themeColor: "#060E27" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
