# Despliegue en VPS (Docker + Traefik)

Pensado para un servidor que ya tiene un Traefik corriendo como proxy inverso
compartido, conectado a una red Docker externa llamada `proxy`, con
`certresolver=letsencrypt` configurado. Cada app vive en su propio directorio con
su propio Postgres — este stack no comparte base de datos con nada más.

## 1. Primer despliegue

```bash
git clone https://github.com/IgnacioSanchezYuste/hypernews.git /opt/hyperfocus/news
cd /opt/hyperfocus/news
cp .env.production.example .env
```

Genera los tres secretos y complétalos en `.env`:

```bash
for v in NEWS_DB_PASSWORD SESSION_SECRET CRON_SECRET; do
  echo "$v=$(openssl rand -hex 32)"
done
```

Rellena también `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 12 caracteres) en `.env`.
`DATABASE_URL` ya viene resuelta en el ejemplo — solo sustituye la contraseña.

## 2. Base de datos primero

```bash
docker compose up -d postgres
docker compose ps  # espera a "healthy"
```

El primer arranque, con el volumen vacío, ejecuta `db/schema.sql` automáticamente
(vía `docker-entrypoint-initdb.d`).

## 3. Builder con acceso a la red `db`

`next build` prerenderiza las páginas públicas (ISR) leyendo de Postgres, así que
el build necesita alcanzar el servicio `postgres` por su nombre. El builder de
BuildKit por defecto no tiene acceso a redes Docker arbitrarias, así que se crea
uno dedicado (una sola vez, no toca el builder por defecto del servidor):

```bash
docker buildx create --name newsbuilder --driver docker-container \
  --driver-opt network=news_db
```

(Si la red `news_db` aún no existe, arranca primero `docker compose up -d postgres`.)

## 4. Contenido antes del build

Conviene que la base ya tenga contenido real antes de construir la imagen final,
para que el prerenderizado no capture páginas vacías:

```bash
docker compose --profile tools build --builder newsbuilder tools
docker compose run --rm tools npm run db:seed
docker compose run --rm tools npm run news:backfill
```

`db:seed` crea el usuario administrador y el contenido editorial de ejemplo.
`news:backfill` reemplaza las noticias curadas por hasta 30 por categoría de los
últimos 30 días (tarda unos minutos).

## 5. Construir y levantar la app

```bash
docker compose build --builder newsbuilder app
docker compose up -d app
```

## 6. Cron diario

No hay cron de plataforma como en Vercel, así que un `crontab` local llama al
endpoint. Crea `cron/cron_secret` con el mismo valor que `CRON_SECRET` en `.env`:

```bash
mkdir -p cron
grep '^CRON_SECRET=' .env | cut -d= -f2 > cron/cron_secret
chmod 600 cron/cron_secret
cat > cron/run-daily-news.sh <<'EOF'
#!/bin/sh
set -eu
DIR="$(cd "$(dirname "$0")" && pwd)"
SECRET="$(cat "$DIR/cron_secret")"
curl -fsS -H "Authorization: Bearer $SECRET" https://news.hyperfocus.es/api/cron/news
EOF
chmod +x cron/run-daily-news.sh
```

Añade a `crontab -e` (hora en UTC, equivalente a las 06:00 UTC del `vercel.json`
original):

```
CRON_TZ=UTC
0 6 * * * /opt/hyperfocus/news/cron/run-daily-news.sh >> /opt/hyperfocus/news/cron/cron.log 2>&1
```

## 7. Verificación

```bash
curl -sI https://news.hyperfocus.es/api/health
curl -sI https://news.hyperfocus.es/
curl -s https://news.hyperfocus.es/sitemap.xml | head
```

Revisa también `docker compose logs -f app` durante los primeros minutos.

## Actualizar a una nueva versión

```bash
cd /opt/hyperfocus/news
git pull
docker compose build --builder newsbuilder app
docker compose up -d app
```

Si `db/schema.sql` cambió con columnas o índices nuevos (usa siempre
`if not exists`), aplícalo a mano una vez:

```bash
docker compose exec -T postgres psql -U news -d news < db/schema.sql
```

## Backups

Sigue el mismo patrón que el resto de stacks del servidor (`crontab -l` de `max`):
un script de `pg_dump` programado contra el volumen `news_pgdata`. No incluido
aquí porque depende de dónde quieras retener las copias.
