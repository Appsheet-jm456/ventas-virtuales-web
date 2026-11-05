import "./admin.css";
import AdminShell from "./AdminShell";

// El panel no se indexa ni usa el encabezado de la web pública (grupo de rutas "(web)").
export const metadata = {
  title: "Panel de administración · Ventas Virtual",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
