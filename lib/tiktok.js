// Videos de TikTok en la ficha (HU-40). El video sigue en los servidores de TikTok: la web solo
// muestra su portada y, cuando el cliente toca ▶, el reproductor oficial (tiktok.com/player/v1).
// Estas funciones corren en el servidor: el navegador no habla con tiktok.com hasta que se toca ▶
// (decisión 0010, sin cookies de rastreo).

// Enlace completo: https://www.tiktok.com/@usuario/video/123… (también /embed/v2/ y /player/v1/).
// BUG-6: las publicaciones de fotos (carrusel) usan /@usuario/photo/123…; el reproductor oficial
// también las muestra, así que se aceptan igual que un video.
const COMPLETO = /^https?:\/\/(?:www\.|m\.)?tiktok\.com\/(?:@[\w.-]*\/(?:video|photo)|embed\/v2|embed|player\/v1|v)\/(\d{8,25})/i;
// Enlace corto de la app: https://vt.tiktok.com/ZS…/ o https://vm.tiktok.com/ZM…/
const CORTO = /^https?:\/\/(?:vt|vm)\.tiktok\.com\/[\w-]+\/?$/i;

export const tiktokId = (u) => String(u || "").trim().match(COMPLETO)?.[1] || "";
export const esCortoTikTok = (u) => CORTO.test(String(u || "").trim());
export const playerTikTok = (id) => `https://www.tiktok.com/player/v1/${id}?description=1&music_info=1&rel=0`;

const DIA = 86400;

// Enlace corto -> enlace completo (sigue la redirección de TikTok). Si falla, devuelve "".
async function expandir(corto) {
  try {
    const r = await fetch(corto, { redirect: "manual", signal: AbortSignal.timeout(4000), next: { revalidate: DIA } });
    const destino = r.headers.get("location") || "";
    return tiktokId(destino) ? destino.split("?")[0] : "";
  } catch {
    return "";
  }
}

// Texto del campo «Video» con los enlaces cortos de TikTok convertidos a completos.
export async function resolverVideos(raw) {
  if (typeof raw !== "string" || !/tiktok\.com/i.test(raw)) return raw;
  const urls = raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const salida = await Promise.all(urls.map(async (u) => (esCortoTikTok(u) ? (await expandir(u)) || u : u)));
  return salida.join("\n");
}

// Portada de cada video de TikTok con el oEmbed público (en el servidor, guardado 1 día).
export async function conPortadasTikTok(videos) {
  return Promise.all(videos.map(async (v) => {
    if (v.red !== "tiktok" || v.thumb) return v;
    try {
      const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(v.url)}`, { signal: AbortSignal.timeout(4000), next: { revalidate: DIA } });
      if (!r.ok) return v;
      const d = await r.json();
      return { ...v, thumb: d.thumbnail_url || "", titulo: d.title || "" };
    } catch {
      return v;
    }
  }));
}
