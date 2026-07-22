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
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run start    # servir el build
```

Copia `.env.example` a `.env.local` y ajusta `NEXT_PUBLIC_SITE_URL`.

## Arquitectura

```
src/
├─ app/                     # Rutas (App Router)
│  ├─ page.tsx              # Home (múltiples secciones)
│  ├─ articulo/[slug]/      # Página de artículo (TOC, progreso, share, related)
│  ├─ categoria/[slug]/     # Categorías + subcategorías (SSG)
│  ├─ autor/[slug]/         # Perfil de autor
│  ├─ etiqueta/[slug]/      # Archivo por etiqueta
│  ├─ recursos/             # Biblioteca de recursos online
│  ├─ buscar/               # Búsqueda avanzada (SSR)
│  ├─ tendencias/ articulos/ categorias/ newsletter/
│  ├─ admin/                # CMS propio (dashboard, artículos, editor…)
│  ├─ api/search/           # Búsqueda instantánea (⌘K)
│  ├─ api/og/               # Imágenes OpenGraph dinámicas (edge)
│  ├─ sitemap.ts robots.ts manifest.ts feed.xml/   # SEO automático
│  └─ globals.css           # Sistema de diseño (tokens, prose, componentes)
├─ components/              # UI reutilizable (article/ layout/ ui/ home/ …)
└─ lib/                     # Dominio y datos
   ├─ types.ts              # Modelo de contenido tipado
   ├─ categories/authors/articles/resources.ts   # Seed escalable
   ├─ queries.ts            # Capa de acceso a datos (única frontera con los datos)
   ├─ seo.ts                # Metadata + JSON-LD helpers
   └─ utils.ts site.ts
```

### Cambiar el seed por un CMS/BD

Toda la app consume datos a través de **`src/lib/queries.ts`**. Para pasar de los
datos de ejemplo a un headless CMS o base de datos, reimplementa ese único archivo
respetando los tipos de `src/lib/types.ts`. Ninguna página importa datos crudos.

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

**Monetización**: `AdSlot` con huecos reservados (leaderboard/rectangle/inline)
sin layout shift, listos para AdSense, banners, afiliados y publicidad nativa.

**CMS**: panel en `/admin` (excluido de indexación) con dashboard, gestión de
artículos y editor con ajustes de publicación, organización, SEO y portada.

## Notas de producción

Puntos marcados con `TODO` que conectar a servicios reales:
- Newsletter → tu ESP (Resend / Mailchimp / Beehiiv) en `Newsletter.tsx`.
- Comentarios y editor del CMS → server actions + base de datos.
- Autenticación del panel `/admin`.
