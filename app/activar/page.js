import "../admin/admin.css";
import Activar from "./Activar";

// Enlace de un solo uso para crear o cambiar la contraseña del panel (HU-34).
export const metadata = {
  title: "Activar acceso · Ventas Virtual",
  robots: { index: false, follow: false },
};

export default function ActivarPage() {
  return <Activar />;
}
