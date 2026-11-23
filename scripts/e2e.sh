#!/usr/bin/env bash
# Prueba rápida de la subida de fotos a Drive (sin pasar por la UI).
# Uso: scripts/e2e.sh [URL_BASE] [RUTA_FOTO]
#   scripts/e2e.sh                                    → local (npm run dev)
#   scripts/e2e.sh https://tu-app.vercel.app foto.jpg → producción
set -euo pipefail

BASE="${1:-http://localhost:3000}"
PHOTO="${2:-public/icons/zz-negro.png}"

echo "→ Subiendo $PHOTO a $BASE/api/photo"
curl -sS -w "\n  HTTP %{http_code}\n" -X POST "$BASE/api/photo" -F "photo=@$PHOTO" --form-string "team=zz-negro"
echo "Si da HTTP 200 y {\"ok\":true}, la foto debería estar en la carpeta de Drive."
