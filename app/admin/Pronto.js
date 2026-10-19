// Módulo del panel que aún no se programa: dice qué historia lo trae.
export default function Pronto({ titulo, historia, texto }) {
  return (
    <div className="adm-soon">
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <p style={{ marginTop: 10, fontSize: 12.5 }}>Llega con {historia}.</p>
    </div>
  );
}
