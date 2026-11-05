#!/usr/bin/env bash
# Arranca el MCP de Supabase limitado al proyecto de la landing.
# El token se lee de .env.local (no versionado); este archivo no contiene secretos.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
exec npx -y @supabase/mcp-server-supabase@latest --project-ref="$SUPABASE_PROJECT_REF"
