// BUG-3: después de un cambio en el panel, borra de la caché las páginas públicas para que el
// cambio se vea en la siguiente visita, sin esperar el minuto de la caché.
import { revalidateTag } from "next/cache";
import { ETIQUETA_WEB } from "./supabase";

export const conRefresco = (manejar) => async (request) => {
  const respuesta = await manejar(request);
  if (respuesta?.status < 400) {
    try {
      revalidateTag(ETIQUETA_WEB);
    } catch {
      // Si falla, la web toma el cambio en menos de un minuto de todos modos.
    }
  }
  return respuesta;
};
