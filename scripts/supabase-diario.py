#!/usr/bin/env python3
"""Consulta diaria y copia de seguridad de Supabase (decisión 0009).

El plan gratuito pausa el proyecto tras una semana sin actividad y no hace copias automáticas.
Este script lee todas las tablas de la landing una vez al día, lo que cuenta como actividad, y
guarda cada una en JSON:

    ~/respaldos/ventas-virtual/AAAA-MM-DD/<tabla>.json

Conserva los últimos DIAS_CONSERVAR días. Lee las claves de .env.local (nunca del repositorio).
Corre con cron en el servidor atlasjm:

    15 3 * * * /usr/bin/python3 /home/atlasjm/ventas-virtuales-web/scripts/supabase-diario.py >> /home/atlasjm/respaldos/ventas-virtual/diario.log 2>&1

Restaurar: cada archivo es la lista de filas de su tabla, lista para insertarla de nuevo.
Las cuentas de acceso al panel (Supabase Auth) no se copian.
"""
import datetime
import json
import shutil
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = Path.home() / "respaldos" / "ventas-virtual"
TABLAS = ["productos", "categorias", "banners", "configuracion", "eventos"]
DIAS_CONSERVAR = 30
LOTE = 1000


def cargar_env():
    env = {}
    for linea in (RAIZ / ".env.local").read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def leer_tabla(url, clave, tabla):
    filas = []
    while True:
        pedido = urllib.request.Request(
            f"{url}/rest/v1/{tabla}?select=*",
            headers={"apikey": clave, "Authorization": f"Bearer {clave}",
                     "Range-Unit": "items", "Range": f"{len(filas)}-{len(filas) + LOTE - 1}"},
        )
        with urllib.request.urlopen(pedido, timeout=60) as r:
            lote = json.loads(r.read())
        filas.extend(lote)
        if len(lote) < LOTE:
            return filas


def limpiar_viejos(hoy):
    limite = hoy - datetime.timedelta(days=DIAS_CONSERVAR)
    for carpeta in DESTINO.iterdir():
        try:
            fecha = datetime.date.fromisoformat(carpeta.name)
        except ValueError:
            continue
        if carpeta.is_dir() and fecha < limite:
            shutil.rmtree(carpeta)


def main():
    ahora = datetime.datetime.now()
    env = cargar_env()
    url, clave = env.get("NEXT_PUBLIC_SUPABASE_URL"), env.get("SUPABASE_SECRET_KEY")
    if not url or not clave:
        sys.exit(f"{ahora:%Y-%m-%d %H:%M} ✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local")

    carpeta = DESTINO / ahora.date().isoformat()
    carpeta.mkdir(parents=True, exist_ok=True)
    resumen, fallos = [], []
    for tabla in TABLAS:
        try:
            filas = leer_tabla(url, clave, tabla)
            (carpeta / f"{tabla}.json").write_text(json.dumps(filas, ensure_ascii=False, indent=1), encoding="utf-8")
            resumen.append(f"{tabla} {len(filas)}")
        except Exception as e:  # una tabla que falla no detiene las demás
            fallos.append(f"{tabla}: {e}")

    limpiar_viejos(ahora.date())
    estado = "✓" if not fallos else "✗"
    print(f"{ahora:%Y-%m-%d %H:%M} {estado} copia en {carpeta} · " + ", ".join(resumen))
    for f in fallos:
        print(f"    falló {f}  (¿proyecto pausado? revisar en supabase.com y restaurarlo)")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
