# HyperNews

Un medio digital moderno, rápido y visualmente premium. Construido para escalar a
cientos de miles de artículos y millones de visitas.

> Diseño luminoso y editorial (inspirado en Apple News, Stripe, Linear y Medium),
> SEO de nivel producción y una arquitectura modular lista para crecer.

## Stack

- **Next.js 16** (App Router) · React 19 · Server Components
- **TypeScript** estricto
- **Tailwind CSS v4** (design tokens en CSS, sin `tailwind.config`)
- SSG + ISR + SSR + rutas dinámicas según convenga
- `next/font` (Inter · Fraunces · JetBrains Mono) y `next/og` para imágenes OpenGraph

## Cómo empezar

```bash
npm install
cp .env.example .env.local     # y rellena los valores (ver más abajo)
createdb hypernews             # o usa una base de datos gestionada
npm run db:seed                # crea el esquema, el contenido inicial y el usuario admin
npm run dev                    # http://localhost:3000
```

Otros comandos:

```bash
npm run build       # build de producción
npm run start       # servir el build
npm run news:fetch  # ejecutar a mano la actualización diaria de noticias
npm run lint        # ESLint
```

### Variables de entorno

| Variable | Obligatoria | Para qué sirve |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión a Postgres. Fuera de `localhost` se exige TLS. |
| `SESSION_SECRET` | Sí | Firma las cookies de sesión del panel. Mínimo 32 caracteres. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo para el seed | Crean o actualizan el usuario administrador. |
| `CRON_SECRET` | Sí en producción | Autoriza `/api/cron/news`. Mínimo 32 caracteres. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública canónica (SEO, OpenGraph, RSS, sitemap). |
| `PGPOOL_MAX` | No | Conexiones por instancia. Por defecto 5; súbelo solo en un servidor persistente. |
| `PGSSL_NO_VERIFY` | No | Ponlo a `1` únicamente si tu proveedor sirve un certificado autofirmado. |

Genera los secretos con:

```bash
openssl rand -base64 48
```

La app falla al arrancar si `SESSION_SECRET` falta, es corta o conserva el valor de
ejemplo: es preferible un error visible a firmar sesiones con una clave débil.

## Arquitectura

```
src/
├─ app/                     # Rutas (App Router)
│  ├─ page.tsx              # Home (múltiples secciones)
│  ├─ articulo/[slug]/      # Página de artículo (TOC, progreso, share, related)
│  ├─ categoria/[slug]/     # Categorías + subcategorías (SSG)
│  ├─ autor/[slug]/         # Perfil de autor
│  ├─ etiqueta/[slug]/      # Archivo por etiqueta
│  ├─ buscar/               # Búsqueda avanzada (SSR)
│  ├─ tendencias/ articulos/ categorias/ newsletter/
│  ├─ admin/                # Panel propio: login + rutas protegidas
│  ├─ api/cron/news/        # Actualización diaria de noticias
│  ├─ api/search/           # Búsqueda instantánea (⌘K)
│  ├─ api/og/               # Imágenes OpenGraph dinámicas (edge)
│  ├─ sitemap.ts robots.ts manifest.ts feed.xml/   # SEO automático
│  └─ globals.css           # Sistema de diseño (tokens, prose, componentes)
├─ components/              # UI reutilizable (article/ layout/ ui/ home/ …)
└─ lib/                     # Dominio y datos
   ├─ types.ts              # Modelo de contenido tipado
   ├─ categories.ts authors.ts articles.ts       # Catálogos y contenido inicial
   ├─ articles-db.ts articles-cache.ts db.ts     # Postgres y caché de datos
   ├─ session.ts dal.ts admin-users.ts env.ts    # Autenticación y entorno
   ├─ news-feed.ts auto-articles.ts              # Curación automática de noticias
   ├─ search.ts rate-limit.ts
   ├─ queries.ts            # Capa de acceso a datos (única frontera con los datos)
   ├─ seo.ts                # Metadata + JSON-LD helpers
   └─ utils.ts site.ts
```

### Datos

Toda la app consume datos a través de **`src/lib/queries.ts`**, que a su vez lee de
Postgres. Ninguna página importa datos crudos ni habla con la base de datos
directamente.

```
queries.ts  →  articles-cache.ts  →  articles-db.ts  →  db.ts (pool de pg)
```

`articles-cache.ts` guarda el catálogo en la caché de datos de Next durante 5
minutos y lo etiqueta como `articles`. Con eso una sola consulta atiende a todas las
visitas de esa ventana. Las escrituras del panel invalidan la etiqueta al instante
(`updateTag`) y el cron lo hace en segundo plano (`revalidateTag(..., "max")`).

## Funcionalidades

**Experiencia**: home editorial con hero, tendencias, lo más leído, recomendados,
serendipia y categorías; página de artículo con índice + scroll-spy, barra de
progreso, compartir, favoritos, autor, relacionados, del mismo autor, comentarios,
newsletter y CTA; buscador instantáneo tipo command palette (`⌘K`) con recientes;
mega-menú; modo oscuro opcional (claro por defecto); scroll infinito.

**SEO**: metadata dinámica, canonical, OpenGraph + Twitter Cards, JSON-LD
(`NewsArticle`, `BreadcrumbList`, `FAQPage`, `WebSite` + SearchAction),
`sitemap.xml`, `robots.txt`, RSS (`/feed.xml`), URLs amigables, slugs automáticos.

**Rendimiento y a11y**: portadas generativas (CSS/SVG, cero peticiones, sin CLS),
fuentes con `display: swap`, code-splitting, lazy loading (IntersectionObserver),
`prefers-reduced-motion`, skip-link, foco visible, roles ARIA y contraste cuidado.

**CMS**: panel en `/admin` (excluido de indexación) con dashboard, gestión de
artículos y editor con ajustes de publicación, organización, SEO y portada.
Autenticación propia con sesiones JWT en cookie `httpOnly`.

**Automatización**: `/api/cron/news` publica cada día hasta 10 noticias por
categoría. Descarta las piezas cuyo cuerpo no se puede leer bien y limpia el resto
de avisos de cookies, reclamos de suscripción, pies de foto y enlaces a otras
noticias, conservando los titulares internos del original. Cada pieza cita y enlaza
a su fuente.

## Seguridad

- Sesiones JWT (HS256, 8 h) en cookie `httpOnly` + `sameSite=lax`, `secure` en producción.
- `proxy.ts` protege `/admin/*`; además cada página y cada server action revalidan la sesión.
- Login con límite de intentos por IP y por cuenta, mensaje de error genérico y
  comparación contra un hash señuelo cuando el email no existe, para no revelar qué
  cuentas son válidas.
- `/api/cron/news` solo acepta el secreto en la cabecera `Authorization`, lo compara
  en tiempo constante y rechaza ejecuciones solapadas.
- Cabeceras en `next.config.ts`: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.
- Todas las entradas del editor se validan y acotan en el servidor; los enlaces del
  cuerpo solo admiten `http(s)` o rutas internas.
- El optimizador de imágenes no acepta SVG ni redirecciones y sirve un número
  cerrado de tamaños, para que no pueda usarse como proxy de imágenes ajeno.

## Despliegue

### Docker / VPS propio (uso actual)

`Dockerfile` + `docker-compose.yml` despliegan la app junto a su propio Postgres,
detrás de un proxy inverso existente (Traefik) que gestiona TLS. Ver `DEPLOY.md`
para el procedimiento completo. Resumen:

1. `git clone` de este repo en el servidor y `cp .env.production.example .env`
   (genera cada secreto con `openssl rand -hex 32`).
2. `docker compose up -d postgres` — aplica `db/schema.sql` automáticamente en el
   primer arranque (volumen vacío).
3. `docker compose run --rm tools npm run db:seed` y luego
   `docker compose run --rm tools npm run news:backfill` para tener contenido real
   antes del primer build (las páginas se prerenderizan con ISR).
4. `docker compose up -d --build app`.
5. Cron diario: un `crontab` local llama a `/api/cron/news` con
   `Authorization: Bearer $CRON_SECRET` (ver `DEPLOY.md`).

### Vercel (alternativa)

`vercel.json` programa la actualización de noticias a las 06:00 UTC (cabecera
`Authorization` enviada automáticamente por la plataforma). Requiere un Postgres
gestionado externo (Neon, Supabase…) — `DATABASE_URL` y el resto de variables se
definen en el panel del proyecto.

### En cualquier caso

Comprueba `/api/health`, `/feed.xml`, `/sitemap.xml`, `/robots.txt` y el acceso a
`/admin` tras el despliegue. Las páginas de contenido se sirven prerenderizadas con
ISR (5 min), así que el tráfico de lectura no toca la base de datos salvo cuando el
caché expira. Si necesitas mayor frescura, baja el `revalidate` de cada página; si
necesitas menos carga, súbelo.

## Notas de producción

- Newsletter → conecta `Newsletter.tsx` a tu ESP (Resend / Mailchimp / Beehiiv).
- Comentarios → hoy son de demostración; falta persistirlos.
- El limitador de peticiones vive en memoria de cada instancia: frena fuerza bruta y
  scraping, pero conviene combinarlo con la protección de borde de la plataforma.
