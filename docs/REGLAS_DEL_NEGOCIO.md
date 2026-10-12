# Reglas del negocio

> Cómo opera la tienda, en palabras del negocio. El sistema las hace cumplir: si una regla
> cambia, cambia primero aquí, después en el diseño y solo al final en el código.
> Diseño que las implementa: [notion_modelado_datos.md](./notion_modelado_datos.md).
> Pendientes de validar por el dueño.

---

## Catálogo

**RN-01 · Una sola fuente de verdad.** El inventario vive en la tabla de Baserow que usa
InventarIA. La web lee de ahí y no guarda copia propia: vender y poner Stock 0 en InventarIA
basta para que la web lo muestre agotado.

**RN-02 · Agotado no es oculto.** Con Stock 0 el producto sigue visible con la cinta
**Equipo agotado**, para que el cliente sepa que se maneja y pregunte. Para que desaparezca de
la tienda se usa la columna `Oculto`.

**RN-03 · Oculto se conserva.** Con `Oculto` en `Sí` (o `1`, `true`, `x`) el producto no se ve
en la tienda pero sigue en Baserow, y el panel admin lo muestra para poder republicarlo.

**RN-04 · El cliente solo ve datos de venta.** Código, categoría, marca, modelo,
especificaciones, estado, precio, stock, descripción, fotos y video. **Nunca** costo, proveedor
ni notas internas.

**RN-05 · Fotos y videos compartidos.** Los enlaces de Google Drive deben estar compartidos como
*Cualquier persona con el enlace*; si no, no cargan en la web.

## Venta

**RN-06 · La venta se cierra por WhatsApp.** El botón abre la línea oficial de ventas con un
mensaje que ya nombra el producto (código y modelo). La web no cobra ni reserva.

**RN-07 · El precio publicado es el de Baserow.** Nadie lo escribe en la web aparte.

## Administración

**RN-08 · El panel admin pide clave.** Toda escritura (crear, editar, eliminar, agotar, ocultar)
exige la clave de administración. El catálogo público nunca escribe en Baserow.

**RN-09 · Todo producto lleva Código.** Es lo que identifica al producto en la URL
(`/producto/<código>`) y en el mensaje de WhatsApp. Sin código no se crea.

**RN-10 · Los datos de la empresa están en un solo lugar.** Nombre, dirección, WhatsApp y redes
salen de `lib/site.js`.

## Marca y políticas

**RN-11 · La web dice quiénes somos.** Una página de marca cuenta la historia, la experiencia y
la especialidad (comercio de tecnología). Lo que se afirma ahí tiene que ser verdad y demostrable.

**RN-12 · Cuatro políticas publicadas y enlazadas desde el pie de página:** privacidad, envíos,
garantía, y términos y condiciones. Ninguna se publica sin la revisión del dueño.

**RN-13 · Sin política de privacidad no se recogen datos.** Mientras no esté publicada, la web no
puede pedir nombre, correo ni teléfono al cliente (Ley 1581 de 2012).

**RN-14 · La política de garantía distingue nuevo de usado.** Cada producto muestra su estado
(Nuevo, Grado A, Grado B) y la garantía que le corresponde.

## Pedido en línea (Etapa 2 — por validar)

**RN-15 · Un pedido recorre siempre el mismo flujo:** Elección del producto → Pago por pasarela →
Confirmación → Pedido nuevo → Alistamiento → Video de soporte → Despacho por transportadora.
No se salta ningún paso.

**RN-16 · La web nunca guarda datos de tarjeta.** El pago lo procesa la pasarela.

**RN-17 · Un equipo usado es único.** Al pagarse, se descuenta del inventario para que no lo
compre otro cliente.

**RN-18 · Antes de despachar hay video de soporte.** Queda el registro de cómo salió el equipo.
