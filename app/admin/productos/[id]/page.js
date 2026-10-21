"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAdmin } from "../../AdminShell";
import ProductoForm from "../ProductoForm";
import { camposDe } from "../campos";

// Editar un producto en página completa (HU-18). Lee el catálogo del panel con la sesión y
// busca la fila por su id; así no hace falta otra API.
export default function EditarProductoPage({ params }) {
  const { token, logout } = useAdmin();
  const [estado, setEstado] = useState({ cargando: true, fila: null, error: "" });

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store", headers: { Authorization: `Bearer ${await token()}` } });
        if (res.status === 401) { logout(); return; }
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        const fila = (d.rows || []).find((r) => String(r._id) === String(params.id)) || null;
        if (vivo) setEstado({ cargando: false, fila, error: "" });
      } catch (e) {
        if (vivo) setEstado({ cargando: false, fila: null, error: String(e?.message || e) });
      }
    })();
    return () => { vivo = false; };
  }, [params.id]);

  if (estado.cargando) return <div className="pf-vacio">Cargando producto…</div>;
  if (!estado.fila) {
    return (
      <div className="pf-vacio">
        <h2>{estado.error ? "No se pudo cargar el producto" : "Producto no encontrado"}</h2>
        <p>{estado.error || "Puede que se haya eliminado o que el enlace sea viejo."}</p>
        <Link className="btn" href="/admin/productos">Volver a Productos</Link>
      </div>
    );
  }
  return <ProductoForm inicial={camposDe(estado.fila)} id={estado.fila._id} />;
}
