"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdmin } from "../../AdminShell";
import EditorPagina from "../EditorPagina";

// Editar una página de política (HU-26): la busca en la lista del panel por su id.
export default function EditarPaginaPage({ params }) {
  const { token, logout } = useAdmin();
  const [estado, setEstado] = useState({ cargando: true, pagina: null, error: "" });

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/paginas", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` }, body: JSON.stringify({ op: "listar" }) });
        if (res.status === 401) { logout(); return; }
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        const p = (d.paginas || []).find((x) => x.id === params.id) || null;
        if (vivo) setEstado({ cargando: false, pagina: p, error: "" });
      } catch (e) {
        if (vivo) setEstado({ cargando: false, pagina: null, error: String(e?.message || e) });
      }
    })();
    return () => { vivo = false; };
  }, [params.id]);

  if (estado.cargando) return <div className="pf-vacio">Cargando página…</div>;
  if (!estado.pagina) {
    return (
      <div className="pf-vacio">
        <h2>{estado.error ? "No se pudo cargar la página" : "Página no encontrada"}</h2>
        <p>{estado.error || "Puede que se haya quitado o que el enlace sea viejo."}</p>
        <Link className="btn" href="/admin/politicas">Volver a Políticas</Link>
      </div>
    );
  }
  const p = estado.pagina;
  const inicial = { titulo: p.titulo, slug: p.slug, estilo: p.estilo, visible: p.visible, secciones: (p.secciones || []).map((s) => ({ titulo: s.titulo, texto: s.texto })) };
  return <EditorPagina inicial={inicial} id={p.id} />;
}
