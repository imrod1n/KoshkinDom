#!/usr/bin/env bash
# Проверка готовности к production (check --deploy)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.production ]]; then
  echo "Создайте .env.production из .env.production.example"
  echo "  cp .env.production.example .env.production"
  echo "  # задайте DJANGO_SECRET_KEY и домен"
  exit 1
fi

PYTHON="${ROOT}/.venv/bin/python"
if [[ ! -x "$PYTHON" ]]; then
  PYTHON=python3
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

"$PYTHON" manage.py check --deploy
