#!/usr/bin/env python3
"""
Genera la EDT (mapa del proyecto) a partir de docs/notion/tareas.csv.

    python3 docs/notion/edt_generar.py            # imprime el JSON de la pestaña «EDT detallada» (A1:O..)
    python3 docs/notion/edt_generar.py --resumen  # solo cuenta tareas por fase

La EDT es de solo lectura (docs/FLUJO_DESARROLLO.md): se regenera desde tareas.csv, nunca se
edita a mano. Las fórmulas usan «;» como separador porque la hoja está en configuración es_CO.
Una tarea que no esté en el mapa: BUG-n va a 7.1 «Bugs abiertos»; cualquier otra, a 7.2
«Mejoras nuevas». Para ubicarla en un entregable propio, agregar su título al mapa de abajo.
"""
import csv
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
T = {r["Tarea"]: r for r in csv.DictReader(open(RAIZ / "docs/notion/tareas.csv", newline=""))}


def find(prefijo):
    m = [t for t in T if prefijo in t]
    if len(m) != 1:
        sys.exit(f"El texto «{prefijo}» coincide con {len(m)} tareas: {m}")
    return m[0]


# (código, fase, [(código, entregable, [fragmentos de título])])
S=[
("1","Diseño",[
 ("1.1","Alcance y reglas del negocio",["Escribir el brief v1.0","Escribir las reglas del negocio","Actualizar el brief a v1.2","Responder las preguntas abiertas","Validar las reglas del negocio"]),
 ("1.2","Arquitectura y datos",["Documentar el modelo de datos","Fuente de datos de la landing","Aprobar el modelo v2","Separar la tienda completa","Decidir el hosting: Hostinger","Decidir el hosting destino"]),
 ("1.3","Método y documentación",["Montar el espejo en Notion","Crear en Notion la página","Adoptar el flujo de desarrollo"]),
 ("1.4","Guía visual",["Definir la guía visual"]),
 ("1.5","Seguridad inicial",["Revisar las columnas reales","Revocar el token de Baserow"]),
]),
("2","Especificaciones",[
 ("2.1","Historias de usuario y contenido",["Escribir las historias de usuario","Reunir las imágenes","Recuperar la contraseña"]),
]),
("3","Implementación",[
 ("3.1","Web pública: inicio y catálogo",["Implementar el nuevo Inicio","Crear las páginas Categorías","Mejorar el diseño y el frontend","HU-23"]),
 ("3.2","Web pública: navegación y barras",["HU-24","HU-25","HU-31","HU-32"]),
 ("3.3","Web pública: producto y filtros",["HU-27","HU-28","HU-29","HU-30"]),
 ("3.4","Web pública: páginas de marca",["HU-26","HU-33"]),
 ("3.5","Diseño visual",["HU-21","HU-22"]),
 ("3.6","Panel de administración",["Acceso al panel","HU-10","HU-11","HU-12","HU-13","HU-14","HU-15","HU-18","HU-19","HU-20","HU-34"]),
 ("3.7","Datos y catálogo",["Crear cuenta y proyecto en Supabase","Aplicar el esquema de Supabase","Pasar el catálogo de Baserow","Carga de productos por CSV","Subir imágenes a Cloudinary","Cargar los productos de Baserow","HU-17"]),
 ("3.8","Seguridad de la API",["Proteger la API pública","Filtrar la API pública"]),
]),
("4","Pruebas",[
 ("4.1","Pruebas automáticas",["Configurar las pruebas automáticas"]),
]),
("5","Despliegue",[
 ("5.1","Publicación en Hostinger",["Publicar el panel nuevo","Cambiar la contraseña de pruebas","Desplegar la landing","Migrar el alojamiento","Apagar Vercel","Agregar las variables de Cloudinary"]),
 ("5.2","Resistencia ante tráfico y ataques",["Plan de resistencia","Conocer los límites","Poner Cloudflare","Cabeceras de caché","Límite de peticiones","Dos pasos","Alerta de caída","Prueba de carga","Revisar los planes"]),
]),
("6","Camino 2: tienda completa",[
 ("6.1","Planificación",["Planificar la tienda completa"]),
 ("6.2","Marca y políticas",["Reunir el contenido de Quiénes","Redactar la política de privacidad","Redactar la política de envíos","Redactar la política de garantía","Redactar los términos"]),
]),
("7","Bugs y mejoras",[
 ("7.1","Bugs abiertos",[]),
 ("7.2","Mejoras nuevas",[]),
]),
]

# Tareas fuera del mapa: BUG-n a 7.1, el resto a 7.2.
mapeadas = {find(p) for _, _, gs in S for _, _, ts in gs for p in ts}
for t in T:
    if t in mapeadas:
        continue
    destino = "7.1" if t.startswith("BUG-") else "7.2"
    for _, _, gs in S:
        for gc, gn, ts in gs:
            if gc == destino:
                ts.append(t)

PRIMERA = 5  # primera fila de datos (la 4 es el encabezado)
A, C, D = "$A$5:$A", "$C$5:$C", "$D$5:$D"


def avance(codigo):
    den = f'COUNTIFS({A};"{codigo}.*";{C};"Tarea")'
    return f'=IF({den}=0;0;COUNTIFS({A};"{codigo}.*";{D};"Hecha")/{den})'


filas, usadas = [], set()
for pc, pn, gs in S:
    filas.append(["\'" + pc, pn, "Fase", None, None, None, avance(pc)])
    for gc, gn, ts in gs:
        filas.append(["\'" + gc, gn, "Entregable", None, None, None, avance(gc)])
        for i, p in enumerate(ts, 1):
            t = T[find(p)] if p not in T else T[p]
            usadas.add(t["Tarea"])
            filas.append(["\'" + f"{gc}.{i}", t["Tarea"], "Tarea", t["Estado"], t["Prioridad"], t["Referencia"], None])
if usadas != set(T):
    sys.exit(f"Tareas sin ubicar en la EDT: {set(T) - usadas}")

fases = [(pc, pn) for pc, pn, _ in S]
resumen = []
for i, (pc, pn) in enumerate(fases):
    r = PRIMERA + i
    resumen.append(["\'" + pc, pn,
                    f'=COUNTIFS({A};I{r}&".*";{C};"Tarea")',
                    f'=COUNTIFS({A};I{r}&".*";{D};"Hecha")',
                    f'=COUNTIFS({A};I{r}&".*";{D};"En curso")',
                    f'=COUNTIFS({A};I{r}&".*";{D};"Pendiente")',
                    f"=IF(K{r}=0;0;L{r}/K{r})"])
tot = PRIMERA + len(fases)
fin = tot - 1
resumen.append([None, "Total", f"=SUM(K{PRIMERA}:K{fin})", f"=SUM(L{PRIMERA}:L{fin})", f"=SUM(M{PRIMERA}:M{fin})",
                f"=SUM(N{PRIMERA}:N{fin})", f"=IF(K{tot}=0;0;L{tot}/K{tot})"])

salida = [["EDT: página web Ventas Virtual Colombia (Camino 1: landing y Camino 2)"] + [None] * 14,
          ["Fuente: Notion, base Tareas (copia en docs/notion/tareas.csv del repositorio). El avance cuenta solo tareas en estado Hecha. Solo lectura: se regenera con docs/notion/edt_generar.py."] + [None] * 14,
          [None] * 15,
          ["Código", "Elemento", "Tipo", "Estado", "Prioridad", "Referencia", "% avance", None,
           "Código", "Fase", "Tareas", "Hechas", "En curso", "Pendientes", "% avance"]]
for i in range(max(len(filas), len(resumen))):
    f = filas[i] if i < len(filas) else [None] * 7
    s = resumen[i] if i < len(resumen) else [None] * 7
    salida.append(f + [None] + s)

if "--resumen" in sys.argv:
    for pc, pn in fases:
        n = sum(1 for f in filas if f[2] == "Tarea" and f[0].startswith("\'" + pc + "."))
        print(pc, pn, n)
    print("Total tareas:", sum(1 for f in filas if f[2] == "Tarea"))
else:
    print(json.dumps(salida, ensure_ascii=False, separators=(",", ":")))
