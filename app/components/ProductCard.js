import Link from "next/link";
import { parseImages } from "../../lib/images";
import { f, stockNum, fmtPrecio, nombreProducto, descuento } from "../../lib/productos";
import { esNuevo } from "../../lib/filtros-catalogo";

// Tarjeta de producto. Ofertas (HU-39): etiqueta roja «−X %» y precio anterior tachado cuando
// «Precio antes» es mayor que el precio; si no hay descuento y el equipo es nuevo, etiqueta «NUEVO».
// `wa`: enlace de WhatsApp para el botón «Consultar por WhatsApp» (carrusel de ofertas del Inicio).
export default function ProductCard({ r, wa = "" }) {
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
  const oferta = precio ? descuento(r) : null;
  const href = `/producto/${encodeURIComponent(f(r, "Código"))}`;
  const estado = f(r, "Estado");
  const etiquetaNuevo = !sold && !oferta && esNuevo(r);
  const grado = etiquetaNuevo && /^nuev/i.test(estado) ? "" : estado;

  const cuerpo = (
    <>
      {sold
        ? <span className="ribbon">AGOTADO</span>
        : oferta
          ? <span className="etq-card etq-desc" aria-label={`${oferta.pct} % de descuento`}>−{oferta.pct} %</span>
          : esNuevo(r) && <span className="etq-card etq-nuevo">NUEVO</span>}
      <div className="card-img">
        {foto
          ? <img src={foto} alt={nombre} loading="lazy" />
          : <span className="noimg">💻</span>}
      </div>
      <div className="card-body">
        {/* HU-41: categoría destacada y el grado como pastilla aparte (sin repetir «Nuevo» si ya
            está la etiqueta NUEVO de la foto). */}
        <span className="card-cat">
          <span className="card-cat-nombre">{f(r, "Categoría") || "Producto"}</span>
          {grado && <span className="card-grado">{grado}</span>}
        </span>
        <span className="card-title">{nombre}</span>
        {specs && <span className="card-specs">{specs}</span>}
        {oferta && <s className="precio-antes card-antes"><span className="sr-only">Antes: </span>{oferta.antes}</s>}
        <div className="card-bottom">
          {precio
            ? <span className="card-price">{oferta && <span className="sr-only">Ahora: </span>}{precio}</span>
            : <span className="card-price tbd">Precio: consultar</span>}
          {sold
            ? <span className="badge bad">Agotado</span>
            : <span className="badge ok">Disponible</span>}
        </div>
        <span className="card-code">Ref: {f(r, "Código")}</span>
      </div>
    </>
  );

  // Con botón de WhatsApp la tarjeta no puede ser un solo enlace (no se anidan enlaces).
  if (wa) {
    return (
      <div className={`card card-con-wa${sold ? " sold" : ""}`}>
        <Link className="card-enlace" href={href}>{cuerpo}</Link>
        <a className="btn-wa card-wa" href={wa} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
      </div>
    );
  }
  return <Link className={`card${sold ? " sold" : ""}`} href={href}>{cuerpo}</Link>;
}
