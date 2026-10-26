// Cinta en movimiento sobre el encabezado (HU-24). El texto lo edita el dueño en
// /admin/configuracion › Cinta. Solo CSS: se desplaza de derecha a izquierda, se pausa con el
// puntero o el foco y queda quieta si el sistema pide «reducir movimiento» (tema-pantalla.css).
const REPETICIONES = 4; // copias del mensaje por mitad, para llenar pantallas anchas sin huecos

export default function Cinta({ texto }) {
  const t = String(texto || "").trim();
  if (!t) return null;
  const mitad = (oculta) => (
    <span className="cinta-mitad" aria-hidden={oculta || undefined}>
      {Array.from({ length: REPETICIONES }, (_, i) => (
        <span key={i} className="cinta-item" aria-hidden={i > 0 || undefined}>{t}</span>
      ))}
    </span>
  );
  // La duración crece con el largo del texto para que la velocidad de lectura sea pareja.
  const duracion = Math.max(18, Math.round(t.length * REPETICIONES * 0.11));
  return (
    <div className="cinta" role="marquee" aria-label={t} tabIndex={0} style={{ "--cinta-dur": `${duracion}s` }}>
      <div className="cinta-pista">
        {mitad(false)}
        {mitad(true)}
      </div>
    </div>
  );
}
