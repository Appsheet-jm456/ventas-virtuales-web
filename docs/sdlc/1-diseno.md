# Fase 1 · Diseño

**Estado:** 🟡 En curso · **Abierta:** 12 oct 2026

> Define **qué** se construye, **para quién** y **cómo** está armado. El código v1 ya existe:
> esta fase lo documenta, lo valida con el dueño y deja escritas las reglas.

## Criterio de cierre

- [x] Brief escrito: problema, usuarios, alcance, métricas y riesgos — [00-BRIEF.md](../00-BRIEF.md)
- [x] Reglas del negocio escritas — [REGLAS_DEL_NEGOCIO.md](../REGLAS_DEL_NEGOCIO.md)
- [x] Modelo de datos documentado — [notion_modelado_datos.md](../notion_modelado_datos.md)
- [x] Método de trabajo: git manda, Notion es el espejo (decisión 0001)
- [ ] Preguntas abiertas del brief respondidas por el dueño
- [ ] Reglas del negocio validadas por el dueño
- [ ] Columnas reales de Baserow revisadas: qué expone hoy la API pública (RN-04)
- [ ] Hosting destino decidido, con la razón escrita en `docs/decisiones/`
- [ ] Guía visual definida: logo, colores y tipografía

---

## Arquitectura

```
┌──────────────┐     ┌───────────────────────────┐     ┌──────────────────┐
│  Navegador   │────►│  Next.js 14 (servidor)    │────►│  Baserow API     │
│  cliente     │     │  · páginas (SSR)          │     │  tabla InventarIA│
│  admin       │     │  · /api/products          │     └──────────────────┘
└──────┬───────┘     │  · /api/admin  (clave)    │
       │             └───────────────────────────┘
       └──► wa.me/<línea de ventas>?text=<producto>
```

- **Sin base propia**: Baserow es la fuente de verdad (decisión 0003).
- **El token de Baserow solo vive en el servidor**: el navegador nunca lo ve.
- **Modo demo**: sin credenciales la app arranca con tres productos de ejemplo, para desarrollo.
- **Escrituras solo por `/api/admin`** con la clave en el header `x-admin-password`.

## Estructura del código

| Ruta | Qué es |
|---|---|
| `app/page.js` | Inicio: hero y catálogo con filtros |
| `app/producto/[codigo]/page.js` | Detalle: galería, especificaciones, botón WhatsApp |
| `app/admin/page.js` | Panel de administración |
| `app/api/products/route.js` | Catálogo en JSON |
| `app/api/admin/route.js` | Escrituras protegidas |
| `app/components/` | Catalog, Gallery, Brand |
| `lib/inventory.js` · `lib/images.js` · `lib/site.js` | Datos, imágenes, datos de la empresa |
