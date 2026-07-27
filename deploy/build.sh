#!/bin/sh
# Construye las imágenes news-tools:latest y news-app:latest.
#
# Usa el builder clásico de Docker (DOCKER_BUILDKIT=0), no `docker compose
# build` ni buildx: `next build` necesita alcanzar el servicio `postgres` por
# nombre de host durante el prerenderizado ISR, y BuildKit ejecuta cada `RUN`
# en un sandbox de red aislado que no puede unirse a una red bridge existente
# de forma fiable. El builder clásico sí soporta `--network=<red>` de verdad.
#
# Requiere: postgres ya arrancado y sano (docker compose up -d postgres) y un
# .env con NEWS_DB_PASSWORD.
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Falta .env — copia .env.production.example primero." >&2
  exit 1
fi

NEWS_DB_PASSWORD=$(grep '^NEWS_DB_PASSWORD=' .env | cut -d= -f2-)
if [ -z "$NEWS_DB_PASSWORD" ]; then
  echo "NEWS_DB_PASSWORD vacía en .env." >&2
  exit 1
fi

DATABASE_URL="postgresql://news:${NEWS_DB_PASSWORD}@postgres:5432/news"

echo "→ Construyendo news-tools:latest..."
DOCKER_BUILDKIT=0 docker build --network=news_db --target tools \
  -t news-tools:latest --build-arg DATABASE_URL="$DATABASE_URL" .

echo "→ Construyendo news-app:latest..."
DOCKER_BUILDKIT=0 docker build --network=news_db --target runner \
  -t news-app:latest --build-arg DATABASE_URL="$DATABASE_URL" .

echo "✓ Listo. docker compose up -d app  (o: docker compose run --rm tools ...)"
