# Guía visual · Ventas Virtual Colombia

> **Estado:** `v2.0` · 14 nov 2026 (HU-37). Paleta elegida por el cliente con su guía «estilo
> Mercado Libre». Reemplaza la v1.1 («modo pantalla»), que queda abajo como historial.
> Si hay que volver al diseño anterior: etiqueta git `v1.1-antes-rediseno`.

---

## v2.0 · Paleta del cliente

| Nombre | Hex | Uso |
|---|---|---|
| Blanco principal | `#FFFFFF` | Fondo base, encabezado y menú |
| Azul muy claro | `#EAF5FF` | Fondos suaves, franjas, recuadro de iconos |
| Fondo secundario | `#D5E9FA` | Secciones, hover, elemento activo |
| Azul corporativo | `#0865D9` | Botones de acción, enlaces, «Todas las categorías», borde al pasar el mouse |
| Azul oscuro | `#071F55` | Títulos, precios, barra superior, cinta, pie de página; texto sobre amarillo |
| Amarillo ofertas | `#FFDA00` | Botón principal («Más portátiles»), ofertas, precios en modo oscuro |
| WhatsApp | `#128C26` | Solo botones de WhatsApp (texto blanco en negrita) |
| Descuentos | `#EF172D` | Etiqueta de descuento y «Agotado» (texto blanco en negrita) |
| Bordes suaves | `#E3EBF5` | Bordes de tarjetas, buscador y divisores |

**Proporción:** blanco y azules claros de fondo; azul corporativo para la acción; azul oscuro
para el texto fuerte; amarillo y rojo solo en ofertas.

### Contraste (WCAG, mínimo 4,5 para texto; 3 para texto grande)

| Combinación | Contraste | Regla |
|---|---|---|
| Azul oscuro sobre blanco | 15,7 | Títulos y precios |
| Azul oscuro sobre amarillo | 11,4 | Texto de los botones amarillos |
| Blanco sobre azul corporativo | 5,4 | Botones azules |
| Azul corporativo sobre blanco / sobre azul muy claro | 5,4 / 4,9 | Enlaces |
| Blanco sobre WhatsApp `#128C26` | 4,37 | ⚠️ Solo texto grande o en negrita de botón |
| Blanco sobre descuento `#EF172D` | 4,35 | ⚠️ Solo texto grande o en negrita de etiqueta |
| Amarillo como texto sobre blanco | 1,4 | **No** |

### Modo oscuro (HU-22, adaptado)

Base en los tonos del azul oscuro: fondo `#051537`, encabezado, franjas y pie `#071F55`,
tarjetas `#0B2A6B`, bordes `#1E4597`. Amarillo para la acción y los precios (9,8 sobre las
tarjetas); enlaces `#7AB6FF` (6,4); texto secundario `#B8CBEA` (8,2). Las fotos siguen en un
recuadro claro (`#EAF5FF`).

### Cambios respecto a la v1.1

- El encabezado y el menú pasan a **blanco** con el logo para fondo claro (`logo-claro.png`); en modo oscuro siguen oscuros con el logo para fondo oscuro.
- **Se quita la constelación** del encabezado, del pie y del panel «Portátiles corporativos».
- Tipografía sin cambios: Montserrat en títulos, botones y menú; Inter en los textos.
- Las variables viven en `app/(web)/tema-pantalla.css` (claro) y `app/(web)/tema-oscuro.css` (oscuro).

---

# Historial · v1.1 «modo pantalla» (22 oct 2026)


> **Estado:** `v1.1` · 22 oct 2026. v1.0 aprobada por el dueño; v1.1 por su ajuste tras ver HU-21:
> marco oscuro (encabezado y pie) y contenido en blanco.
> Fuente: el logo (carpeta de Canva «Ventas Virtual Colombia Landig») y la fachada de la tienda.
> Los colores se midieron sobre las imágenes, no a ojo.

---

## 1. La idea: «modo pantalla»

El logo es un **monitor amarillo** cuya pantalla muestra una **red de luces azules** sobre azul
noche, abrazado por **dos cables, uno cian y uno rojo**. La web pública toma esa pantalla como
fondo: **oscura, azul noche, con la constelación de luces**, y usa el amarillo del marco para lo
que se debe tocar. Así la página «es» la pantalla del logo y se distingue de las tiendas blancas.

Se descartó el **negro puro** (`#000`): se ve frío y genérico, y no es un color del logo. El
azul noche de la pantalla da la misma sensación oscura, pero es de la marca.

## 1.1 Ajuste del dueño (v1.1): marco oscuro, contenido claro

Al ver la web toda oscura, el dueño pidió que el **contenido del medio vuelva a blanco**. La
«pantalla» queda como **marco**:

| Zona | Fondo | Notas |
|---|---|---|
| **Encabezado** (logo, buscador, WhatsApp, envíos) y menú | Azul pantalla **con la constelación** | Logo para fondo oscuro, línea cian debajo |
| **Contenido** (categorías, productos, ficha, filtros, franjas) | **Blanco** y gris niebla `#F3F5F9` | Títulos y precios en azul noche `#0B1F4D` |
| **Piezas destacadas** (banners, panel «Portátiles corporativos») | Azul pantalla con constelación | Funcionan como pantallas sobre el blanco |
| **Pie de página** | Azul pantalla con constelación | Logo vertical para fondo oscuro |

El dueño puede alternar entre este **modo claro** (v1.1, por defecto) y el **modo oscuro** (v1.0, toda la web en azul pantalla) desde `/admin/configuracion › Apariencia` (HU-22).

Reglas sobre el blanco: el **amarillo solo como fondo** de botones (texto azul noche, 9,8); los
**precios en azul noche** (15,9); los **enlaces en cian enlace `#0072A8`** (5,3); «Agotado» en
rojo con texto blanco (5,2). Las secciones 2 a 5 siguen valiendo para las zonas oscuras.

## 2. Colores de marca

| Nombre | Hex | Sale de | Uso |
|---|---|---|---|
| **Azul pantalla profundo** | `#060E27` | Lo más oscuro de la pantalla | Fondo general de la web |
| **Azul pantalla** | `#081A4E` | Tono típico de la pantalla | Portada, banners y franjas |
| **Azul superficie** | `#0D1B45` | Pantalla, un paso más claro | Tarjetas de producto y paneles |
| **Azul red** | `#183FA5` | Las líneas de la constelación | Bordes, divisores, líneas de la red |
| **Destello** | `#A0D8FF` | Los puntos de luz | Puntos de la constelación, detalles |
| **Amarillo marco** | `#F5C518` | El marco del monitor | Botón principal, precios, palabras clave |
| **Cian cable** | `#00A8E0` | El cable azul | Línea de acento bajo el menú, iconos |
| **Cian claro** | `#4CC3F0` | El cable azul, aclarado | Enlaces y textos de apoyo sobre fondo oscuro |
| **Rojo cable** | `#D7192F` | El cable rojo | Solo descuentos y «agotado», siempre con texto blanco |
| **Blanco** | `#FFFFFF` | — | Títulos y textos principales |
| **Gris luna** | `#A9B8D9` | — | Textos secundarios (categoría, especificaciones) |
| **Verde WhatsApp** | `#25D366` (texto `#05391F`) | Convención de WhatsApp | Solo los botones de WhatsApp |

**Proporción:** 60 % azules de pantalla (fondos), 30 % blanco y gris luna (textos), 10 %
amarillo (acción). Cian y rojo, solo en puntos concretos.

## 3. Reglas de contraste (WCAG, mínimo 4,5 para texto)

| Combinación | Contraste | ¿Se usa? |
|---|---|---|
| Blanco sobre azul pantalla profundo | 19,1 | Sí: textos |
| Gris luna sobre azul superficie | 8,4 | Sí: textos secundarios |
| Amarillo sobre azul pantalla profundo | 11,7 | Sí: precios y palabras destacadas |
| Azul noche `#0B1F4D` sobre amarillo | 9,8 | Sí: texto del botón amarillo |
| Cian claro sobre azul pantalla profundo | 9,4 | Sí: enlaces |
| Blanco sobre rojo cable | 5,2 | Sí: etiqueta de descuento |
| Rojo cable como texto sobre azul superficie | 3,2 | **No**: el rojo va de fondo, nunca como letra |
| Amarillo como texto sobre blanco | 1,6 | **No** |

## 4. Fotos de producto

Las fotos de los equipos tienen **fondo blanco**. Sobre fondo oscuro quedarían como recortes
blancos sueltos, así que la foto va dentro de un **recuadro claro** (`#F3F5F9`, esquinas
redondeadas) en la parte de arriba de la tarjeta oscura, como una pantalla encendida.

## 5. La constelación

- Fondo de la portada, de los banners y del pie de página: puntos `#A0D8FF` unidos por líneas
  `#183FA5`, algunos con un halo suave `#4CC3F0`.
- Se dibuja con SVG ligero, no con una foto pesada, y es **decorativa**: no lleva texto encima
  sin un fondo que garantice el contraste.
- En celular se reduce la cantidad de puntos para no cargar la pantalla.

## 6. Logo

- La web oscura necesita una **versión del logo para fondo oscuro**: el logotipo «Ventas Virtual
  · COLOMBIA» en **blanco** y el monitor igual. El archivo actual es un JPG con fondo blanco.
- Pendiente del dueño: el archivo original (PNG transparente o SVG). Mientras tanto (HU-21) se
  generaron desde el logo vertical, quitando el fondo y pasando el texto a blanco: `public/marca/`
  `logo-oscuro.png` (horizontal), `logo-vertical-oscuro.png` (pie), `icono.png` (pestaña),
  `og.png` (imagen para compartir) y `logo-claro.png` (para fondos claros).
- Versiones necesarias: horizontal (encabezado), vertical (pie de página, redes) y solo el
  monitor (ícono de la pestaña del navegador).

## 7. Tipografía (propuesta)

| Uso | Letra | Por qué |
|---|---|---|
| Títulos, precios, botones | **Montserrat** (600–700) | Geométrica y gruesa, como el logotipo |
| Textos y especificaciones | **Inter** (400–500) | Muy legible en pantalla y en celular |
| Códigos de producto | Monoespaciada del sistema | Ya se usa en la web |

Las dos son gratuitas (Google Fonts) y funcionan en Canva.

## 8. Dónde aplica

- **Web pública** (Inicio, Categorías, Productos, ficha de producto): modo pantalla.
- **Banners** de la portada (Canva, 1600×500 y 800×800): mismo fondo azul pantalla con la
  constelación, amarillo para la cifra o la llamada a la acción.
- **Panel `/admin`**: se queda **claro**. Es una herramienta de trabajo de varias horas y las
  tablas se leen mejor en claro; solo toma el azul y el amarillo de la marca en el menú y los botones.
- **Piezas de redes y catálogo PDF**: se recomienda la misma paleta; las campañas de temporada
  (por ejemplo Halloween) pueden cambiar colores, pero conservan el logo y el amarillo.

## 9. Próximos pasos

1. Visto bueno del dueño a esta guía (subir a `v1.0`).
2. Logo para fondo oscuro (sección 6).
3. Aplicarla a la web pública como historia de usuario propia.
4. Banners en Canva con esta paleta.
