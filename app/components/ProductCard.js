import Link from "next/link";
import { parseImages } from "../../lib/images";
import { f, stockNum, fmtPrecio, nombreProducto } from "../../lib/productos";

export default function ProductCard({ r }) {
  const sold = stockNum(r) <= 0;
  const foto = parseImages(r)[0] || "";
  const nombre = nombreProducto(r);
  const specs = [
    f(r, "Procesador"),
    f(r, "Generación") && `${f(r, "Generación")}ª Gen`,
    f(r, "RAM"),
    f(r, "Almacenamiento"),
  ].filter(Boolean).join(" · ");
  const precio = fmtPrecio(r);

  return (
    <Link className={`card${sold ? " sold" : ""}`} href={`/producto/${encodeURIComponent(f(r, "Código"))}`}>
      {sold && <span className="ribbon">AGOTADO</span>}
      <div className="card-img">
        {foto
          ? <img src={foto} alt={nombre} loading="lazy" />
          : <span className="noimg">💻</span>}
      </div>
      <div className="card-body">
        <span className="card-cat">{f(r, "Categoría") || "Producto"}{f(r, "Estado") ? ` · ${f(r, "Estado")}` : ""}</span>
        <span className="card-title">{nombre}</span>
        {specs && <span className="card-specs">{specs}</span>}
        <div className="card-bottom">
          {precio
            ? <span className="card-price">{precio}</span>
            : <span className="card-price tbd">Precio: consultar</span>}
          {sold
            ? <span className="badge bad">Agotado</span>
            : <span className="badge ok">Disponible</span>}
        </div>
        <span className="card-code">Ref: {f(r, "Código")}</span>
      </div>
    </Link>
  );
}
