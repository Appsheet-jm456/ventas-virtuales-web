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
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # en producción: el dominio
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

## Compilar y producción

```bash
npm run build
npm start        # usa el puerto de la variable PORT (3000 por defecto)
```

Despliegue en Hostinger: [sdlc/5-despliegue.md](./sdlc/5-despliegue.md).
