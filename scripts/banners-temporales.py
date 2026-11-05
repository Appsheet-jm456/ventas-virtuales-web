#!/usr/bin/env python3
"""Genera los banners temporales de la portada (public/banners/*.svg) con la guía visual
«modo pantalla» (HU-21). Se usan solo mientras el dueño no sube banners en /admin/banners.

    python3 scripts/banners-temporales.py
"""
import random
from pathlib import Path

DESTINO = Path(__file__).resolve().parent.parent / "public" / "banners"
FUENTE = "Montserrat, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
C = dict(fondo="#081A4E", hondo="#060E27", red="#183FA5", destello="#A0D8FF", cian="#4CC3F0",
         amarillo="#F5C518", noche="#0B1F4D", luna="#A9B8D9", rojo="#D7192F")


def constelacion(w, h, n, semilla):
    r = random.Random(semilla)
    p = [(r.uniform(0, w), r.uniform(0, h), r.uniform(1.4, 3.6)) for _ in range(n)]
    lineas = set()
    for i, (x, y, _) in enumerate(p):
        cerca = sorted((((x - a) ** 2 + (y - b) ** 2), j) for j, (a, b, _) in enumerate(p) if j != i)[:2]
        lineas |= {tuple(sorted((i, j))) for _, j in cerca}
    s = [f'<g stroke="{C["red"]}" stroke-width="1.2" opacity=".8">']
    s += [f'<line x1="{p[i][0]:.0f}" y1="{p[i][1]:.0f}" x2="{p[j][0]:.0f}" y2="{p[j][1]:.0f}"/>' for i, j in sorted(lineas)]
    s.append("</g>")
    s += [f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{t * 5:.0f}" fill="{C["cian"]}" opacity=".16"/>' for x, y, t in p if t > 3]
    s += [f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{t:.1f}" fill="{C["destello"]}"/>' for x, y, t in p]
    return "".join(s)


def monitor(x, y, ancho):
    """El monitor del logo: marco amarillo, pantalla con constelación, cables cian y rojo."""
    alto = ancho * 0.66
    m = ancho * 0.07
    return (f'<g transform="translate({x},{y})">'
            f'<path d="M{-ancho*.12:.0f} {alto*.35:.0f} C {-ancho*.2:.0f} {alto*1.25:.0f}, {ancho*.75:.0f} {alto*1.35:.0f}, {ancho*1.06:.0f} {alto*.12:.0f}" fill="none" stroke="#3FA0E8" stroke-width="{ancho*.035:.0f}" stroke-linecap="round"/>'
            f'<path d="M{-ancho*.02:.0f} {alto*.75:.0f} C {ancho*.1:.0f} {alto*1.45:.0f}, {ancho*.95:.0f} {alto*1.3:.0f}, {ancho*1.16:.0f} {alto*.3:.0f}" fill="none" stroke="{C["rojo"]}" stroke-width="{ancho*.035:.0f}" stroke-linecap="round"/>'
            f'<circle cx="{ancho*1.06:.0f}" cy="{alto*.12:.0f}" r="{ancho*.035:.0f}" fill="none" stroke="#3FA0E8" stroke-width="{ancho*.022:.0f}"/>'
            f'<circle cx="{ancho*1.16:.0f}" cy="{alto*.3:.0f}" r="{ancho*.035:.0f}" fill="none" stroke="{C["rojo"]}" stroke-width="{ancho*.022:.0f}"/>'
            f'<rect width="{ancho}" height="{alto:.0f}" rx="{ancho*.05:.0f}" fill="{C["amarillo"]}"/>'
            f'<svg x="{m:.0f}" y="{m:.0f}" width="{ancho-2*m:.0f}" height="{alto-2*m:.0f}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">'
            f'<rect width="400" height="240" fill="{C["hondo"]}"/>{constelacion(400, 240, 16, 9)}</svg>'
            f'<path d="M{ancho*.42:.0f} {alto:.0f} h{ancho*.16:.0f} l{ancho*.03:.0f} {alto*.16:.0f} h{-ancho*.22:.0f} z" fill="{C["amarillo"]}"/>'
            f'<rect x="{ancho*.3:.0f}" y="{alto*1.15:.0f}" width="{ancho*.4:.0f}" height="{alto*.06:.0f}" rx="{alto*.03:.0f}" fill="{C["amarillo"]}"/>'
            "</g>")


def texto(x, y, t, tam, color, peso=800, extra=""):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{tam}" font-weight="{peso}" font-family="{FUENTE}" {extra}>{t}</text>'


def chip(x, y, t, ancho):
    return (f'<rect x="{x}" y="{y}" width="{ancho}" height="40" rx="20" fill="{C["fondo"]}" stroke="{C["red"]}" stroke-width="2"/>'
            + texto(x + ancho / 2, y + 26, t, 17, "#FFFFFF", 600, 'text-anchor="middle"'))


def boton(x, y, t, ancho, fondo, color):
    return (f'<rect x="{x}" y="{y}" width="{ancho}" height="56" rx="12" fill="{fondo}"/>'
            + texto(x + ancho / 2, y + 36, t, 22, color, 800, 'text-anchor="middle"'))


def marca_temporal(w):
    return (f'<rect x="{w-215}" y="22" width="190" height="34" rx="17" fill="{C["hondo"]}" stroke="{C["red"]}"/>'
            + texto(w - 120, 44, "IMAGEN TEMPORAL", 14, C["luna"], 700, 'text-anchor="middle" letter-spacing="1.5"'))


def lienzo(w, h, semilla, cuerpo):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<rect width="{w}" height="{h}" fill="{C["fondo"]}"/>{constelacion(w, h, 34 if w > h else 22, semilla)}'
            f'<rect width="{w}" height="6" fill="#00A8E0"/>{cuerpo}{marca_temporal(w)}</svg>')


archivos = {
    "banner-1.svg": lienzo(1600, 500, 1,
        texto(70, 150, "Portátiles corporativos", 64, "#FFFFFF")
        + texto(70, 222, "con garantía", 64, C["amarillo"])
        + texto(70, 292, "Lenovo · Dell · HP — nuevos y usados", 26, C["luna"], 500)
        + chip(70, 318, "Core i5 / i7", 150) + chip(232, 318, "SSD", 80) + chip(324, 318, "Grado A", 120)
        + boton(70, 384, "Ver portátiles", 250, C["amarillo"], C["noche"])
        + monitor(1060, 110, 380)),
    "banner-1-movil.svg": lienzo(800, 800, 2,
        monitor(250, 110, 300)
        + texto(60, 470, "Portátiles", 70, "#FFFFFF") + texto(60, 548, "corporativos", 70, C["amarillo"])
        + texto(60, 600, "Nuevos y usados con garantía", 30, C["luna"], 500)
        + boton(60, 650, "Ver portátiles", 280, C["amarillo"], C["noche"])),
    "banner-2.svg": lienzo(1600, 500, 3,
        texto(70, 150, "Envíos a todo", 64, "#FFFFFF") + texto(70, 222, "el país", 64, C["amarillo"])
        + texto(70, 292, "Portátiles, torres tiny, partes y accesorios", 26, C["luna"], 500)
        + chip(70, 318, "Despacho nacional", 210) + chip(292, 318, "Asesoría", 130)
        + boton(70, 384, "Escríbenos por WhatsApp", 360, "#25D366", "#05391F")
        + monitor(1060, 110, 380)),
    "banner-2-movil.svg": lienzo(800, 800, 4,
        monitor(250, 110, 300)
        + texto(60, 470, "Envíos a todo", 70, "#FFFFFF") + texto(60, 548, "el país", 70, C["amarillo"])
        + texto(60, 600, "Despacho nacional y asesoría", 30, C["luna"], 500)
        + boton(60, 650, "Escríbenos por WhatsApp", 400, "#25D366", "#05391F")),
}
for nombre, svg in archivos.items():
    (DESTINO / nombre).write_text(svg, encoding="utf-8")
    print("✓", nombre)
