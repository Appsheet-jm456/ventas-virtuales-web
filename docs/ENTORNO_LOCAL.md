# Entorno local

## Arrancar la app

Requiere Node.js 18+.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Sin credenciales arranca en **modo demo** con tres productos de
ejemplo.

## Conectar Baserow

Crear `.env.local` en la raíz (no se versiona, decisión 0002):

```bash
BASEROW_API_TOKEN=...
BASEROW_TABLE_ID=...
ADMIN_PASSWORD=...
# BASEROW_API_URL=https://api.baserow.io   (opcional)
```

## Sincronizar con Notion

Copiar el `.env.notion` de Futur Green a la raíz de este proyecto (misma integración y misma
página padre) y correr:

```bash
python3 docs/notion/sincronizar.py --revisar   # ensayo, no escribe
python3 docs/notion/sincronizar.py             # la primera vez: crea la estructura
python3 docs/notion/sincronizar.py --todo      # después: solo lo que cambió
```

Detalle en [notion/COMO_MONTARLO.md](./notion/COMO_MONTARLO.md).

## Compilar

```bash
npm run build
```
