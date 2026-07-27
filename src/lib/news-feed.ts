import Parser from "rss-parser";
import { extract } from "@extractus/article-extractor";
import { htmlToText } from "html-to-text";
import sharp from "sharp";
import type { ArticleImage, Block } from "./types";
import { slugify } from "./utils";

interface FeedSource {
  category: string;
  categoryLabel: string;
  /**
   * Several search angles per category. A single Bing News query only returns
   * a dozen or so items, nowhere near enough to fill a category with a month
   * of genuine coverage — spreading the vertical across sub-topics is what
   * gives the quality filter enough raw material to work with.
   */
  queries: string[];
  /** Keywords used to tag stories and to check they really belong to the vertical. */
  keywords: string[];
  fallbackImage: ArticleImage;
}

/** One search-driven Bing News RSS feed per category — no API key required. */
export const FEED_SOURCES: FeedSource[] = [
  {
    category: "inteligencia-artificial",
    categoryLabel: "Inteligencia Artificial",
    queries: [
      "inteligencia artificial",
      "ChatGPT OpenAI",
      "modelos de lenguaje IA",
      "robots e inteligencia artificial",
      "startups de inteligencia artificial",
      "IA generativa",
      "regulación inteligencia artificial",
      "inteligencia artificial empresas España",
      "Google Gemini IA",
      "IA en la educación",
      "IA en la sanidad",
      "ciberseguridad inteligencia artificial",
      "inteligencia artificial empleo",
      "chips y semiconductores IA",
      "inteligencia artificial arte creatividad",
      "coches autónomos inteligencia artificial",
    ],
    keywords: [
      "inteligencia artificial", "ia", "openai", "chatgpt", "gemini", "anthropic", "claude",
      "algoritmo", "modelo", "machine learning", "aprendizaje automatico", "chip", "nvidia",
      "robot", "automatizacion", "datos", "software",
    ],
    fallbackImage: {
      url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=70",
      alt: "Interfaz abstracta de inteligencia artificial",
      credit: "Unsplash",
    },
  },
  {
    category: "psicologia",
    categoryLabel: "Psicología",
    queries: [
      "psicología salud mental",
      "ansiedad y estrés",
      "terapia psicológica",
      "bienestar emocional",
      "salud mental jóvenes",
      "hábitos y comportamiento humano",
      "psicólogos",
      "depresión salud mental",
      "sueño y descanso psicología",
      "relaciones de pareja psicología",
      "crianza y familia psicología",
      "adicciones salud mental",
      "trauma y resiliencia psicológica",
      "salud mental en el trabajo",
      "trastornos alimentarios",
      "psicología infantil",
    ],
    keywords: [
      "psicologia", "psicologo", "salud mental", "ansiedad", "depresion", "terapia", "estres",
      "bienestar", "emociones", "cerebro", "sueno", "habitos", "mindfulness", "autoestima",
      "relaciones", "conducta",
    ],
    fallbackImage: {
      url: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1600&q=70",
      alt: "Dos personas conversando con atención",
      credit: "Unsplash",
    },
  },
  {
    category: "historia-negocios",
    categoryLabel: "Historia & Negocios",
    queries: [
      "empresas y negocio España",
      "economía mercado tecnología",
      "startups inversión España",
      "fusiones y adquisiciones empresas",
      "resultados empresariales",
      "bolsa mercados financieros",
      "historia de empresas tecnológicas",
      "negocios tecnología",
      "empleo y mercado laboral España",
      "banca y finanzas España",
      "energía y empresas España",
      "comercio y consumo España",
      "inmobiliario empresas España",
      "grandes fortunas empresarios",
      "industria y manufactura España",
      "IPO salida a bolsa empresas",
    ],
    keywords: [
      "empresa", "negocio", "economia", "mercado", "inversion", "startup", "facturacion",
      "beneficios", "bolsa", "empleo", "industria", "compania", "fundador", "millones",
      "acuerdo", "compra",
    ],
    fallbackImage: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=70",
      alt: "Gráficos financieros en una pantalla",
      credit: "Unsplash",
    },
  },
];

export interface NormalizedFeedItem {
  title: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  excerpt: string;
  tags: string[];
  blocks: Block[];
  image: ArticleImage;
}

interface BingItem {
  title?: string;
  link?: string;
  contentSnippet?: string;
  isoDate?: string;
  bingImage?: string;
  bingSource?: string;
  bingImageMaxWidth?: string;
  bingImageMaxHeight?: string;
}

const USER_AGENT = "Mozilla/5.0 (compatible; HyperNewsBot/1.0)";

const parser: Parser<unknown, BingItem> = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": USER_AGENT },
  customFields: {
    item: [
      ["News:Image", "bingImage"],
      ["News:Source", "bingSource"],
      ["News:ImageMaxWidth", "bingImageMaxWidth"],
      ["News:ImageMaxHeight", "bingImageMaxHeight"],
    ],
  },
});

const HERO_MAX_WIDTH = 1600;
const HERO_MAX_HEIGHT = 900;

/** Bing's <News:Image> is a small ~700px thumbnail by default; request the full size it advertises. */
function fullSizeImage(rawUrl: string, maxWidth?: string, maxHeight?: string): string {
  const url = rawUrl.replace(/^http:/, "https:");
  const w = Math.min(parseInt(maxWidth ?? "", 10) || HERO_MAX_WIDTH, HERO_MAX_WIDTH);
  const h = Math.min(parseInt(maxHeight ?? "", 10) || HERO_MAX_HEIGHT, HERO_MAX_HEIGHT);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${w}&h=${h}&c=7`;
}

function feedUrl(query: string): string {
  const q = encodeURIComponent(query);
  return `https://www.bing.com/news/search?q=${q}&format=RSS&setmkt=es-ES`;
}

/** Bing wraps the real article link in an apiclick redirect; the destination is a plain query param. */
function unwrapSourceUrl(bingLink: string): string {
  try {
    const wrapped = new URL(bingLink);
    const real = wrapped.searchParams.get("url");
    return real ? decodeURIComponent(real) : bingLink;
  } catch {
    return bingLink;
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/\s+/g, " ")
    .trim();
}

/** Accent-insensitive lowercase, used by every content filter below. */
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ==========================================================================
   Regional balance
   The Bing "es-ES" market still mixes in a fair number of Latin American
   outlets. Nothing here excludes them — some categories would come up short
   without them — but Spanish and major international sources are ranked
   first, so a LATAM story only takes a slot once the better-fit ones are used.
   ========================================================================== */

const LATAM_TLDS = new Set([
  "ar", "mx", "co", "cl", "pe", "uy", "ec", "bo", "py", "ve", "cr", "pa", "do", "gt", "hn", "ni", "sv", "cu", "lat",
]);

// Country-coded TLDs miss the many LATAM outlets that publish under .com/.net,
// so the frequent offenders are named explicitly.
const LATAM_OUTLETS = [
  "infobae.com", "clarin.com", "lanacion.com.ar", "tn.com.ar", "ambito.com", "perfil.com", "cronista.com",
  "eluniversal.com.mx", "milenio.com", "excelsior.com.mx", "elespectador.com", "semana.com", "eltiempo.com",
  "emol.com", "biobiochile.cl", "cooperativa.cl", "t13.cl", "elcomercio.com", "elcomercio.pe",
  "elperuano.pe", "larepublica.co", "publimetro.com", "diariolibre.com", "elnuevodiario.com.ni",
  "confirmado.net", "itongadol.com", "merca20.com", "merca2.0", "peru-retail.com", "sopitas.com",
  "sdpnoticias.com", "chequeado.com", "forbes.com.mx", "forbes.com.co", "muyinteresante.com.mx",
  "xataka.com.mx", "computerhoy.com.mx", "meridiano.mx", "eleconomista.com.mx", "elfinanciero.com.mx",
  "cienradios.com", "pijamasurf.com", "contextotucuman.com", "lanacion.com", "eleconomistaamerica.com",
  "urgente24.com", "eldestapeweb.com",
];

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isLatamSource(sourceUrl: string): boolean {
  const domain = domainOf(sourceUrl);
  if (!domain) return false;
  const tld = domain.split(".").pop() ?? "";
  if (LATAM_TLDS.has(tld)) return true;
  return LATAM_OUTLETS.some((outlet) => domain === outlet || domain.endsWith(`.${outlet}`));
}

/* ==========================================================================
   Content hygiene
   Scraped pages carry a lot that is not the news: consent notices, share
   widgets, photo credits, related-story teasers and paywall prompts. Nothing
   below this line ends up in an article unless it reads like actual reporting.
   ========================================================================== */

/** Fragments that never belong to the body of a news story. */
const NOISE_PATTERNS: RegExp[] = [
  /\b(suscri(b|p)|newsletter|boletin|hazte socio|contenido exclusivo|solo para suscriptores)\b/,
  /\b(cookies?|politica de privacidad|aviso legal|terminos y condiciones|consentimiento)\b/,
  /\b(inicia sesion|registrate|crea tu cuenta|ya eres suscriptor)\b/,
  /\b(lee tambien|leer mas|te puede interesar|puede interesarte|noticias relacionadas|mas informacion en|sigue leyendo|continuar leyendo|articulo relacionado)\b/,
  /\b(comparte|compartir en|copiar enlace|enviar por whatsapp|siguenos en|siguenos a traves)\b/,
  /\b(descarga la app|activa las notificaciones|habilita javascript|actualiza tu navegador)\b/,
  /\b(todos los derechos reservados|derechos reservados|prohibida su reproduccion)\b/,
  /\b(publicidad|patrocinado|contenido patrocinado|espacio publicitario)\b/,
  /^(foto|fotos|imagen|imagenes|fotografia|video|audio|credito|autor|fuente|etiquetas|temas|actualizado|publicado)\s*[:·|-]/,
  /^\s*(efe|reuters|ap|europa press|afp|getty images?)\s*[.·|-]?\s*$/,
  /\b(archivado en|te contamos|en directo|minuto a minuto)\b/,
  // Photo captions travel inside <p> on many templates: "… (Foto: Adobe Stock)".
  /\(\s*(foto|fotos|imagen|imagenes|fotografia|video|ilustracion|infografia)\s*[:.]/,
  /\b(foto|imagen|fotografia|ilustracion)\s*:\s*\S/,
  /\(\s*(efe|reuters|ap|europa press|afp|getty images?|archivo)\s*\)\s*$/,
];

/** Datelines such as "MADRID, 27 jul (Reuters) - " prefix the real first sentence. */
const DATELINE = /^[A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s.]{2,30},?\s*(\d{1,2}\s+\w{3,10}\.?\s*)?\(([^)]{2,30})\)\s*[-–—.]\s*/;

const MIN_PARAGRAPH_CHARS = 80;
const MIN_PARAGRAPH_WORDS = 14;

function isNoise(text: string): boolean {
  const n = normalize(text);
  if (NOISE_PATTERNS.some((re) => re.test(n))) return true;
  // A bare URL or an email address is navigation, never prose.
  if (/https?:\/\/|www\.|@[\w.-]+\.\w{2,}/.test(n)) return true;
  // Shouting fragments are headline or menu leftovers.
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÑÜáéíóúñü]/g, "");
  if (letters.length > 12 && letters === letters.toUpperCase()) return true;
  return false;
}

/** Keeps only lines that read like a written paragraph of reporting. */
function isProse(text: string): boolean {
  if (text.length < MIN_PARAGRAPH_CHARS) return false;
  if (text.split(/\s+/).length < MIN_PARAGRAPH_WORDS) return false;
  if (!/[.!?…»"”)]$/.test(text)) return false;
  if (isNoise(text)) return false;
  return true;
}

function cleanText(html: string): string {
  const text = htmlToText(html, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
      { selector: "figure", format: "skip" },
      { selector: "figcaption", format: "skip" },
    ],
  });
  return decodeEntities(text).replace(DATELINE, "").trim();
}

interface RawBlock {
  tag: string;
  html: string;
}

/**
 * Walks the extracted article HTML in document order and keeps the block-level
 * elements that carry meaning. Preserving the publisher's own headings is what
 * gives the rendered article its structure and its table of contents.
 */
function tokenize(html: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  const re = /<(h2|h3|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    blocks.push({ tag: match[1].toLowerCase(), html: match[2] });
  }
  return blocks;
}

// High enough that a full-length news story is captured almost in its
// entirety, not just a lead excerpt — the callout below still sends readers
// to the source for anything this cap trims off a genuinely long piece.
const MAX_BLOCKS = 60;
const MIN_PARAGRAPHS = 3;
const MIN_BODY_CHARS = 700;

/** True when the paragraph is a standalone quotation worth pulling out. */
function isPullQuote(text: string): boolean {
  return /^[«"“]/.test(text) && /[»"”]$/.test(text) && text.length < 320;
}

interface ParsedBody {
  blocks: Block[];
  chars: number;
  paragraphs: number;
  firstParagraph?: string;
}

function parseBody(html: string): ParsedBody {
  const blocks: Block[] = [];
  const seen = new Set<string>();
  let chars = 0;
  let paragraphs = 0;
  let quotes = 0;
  let firstParagraph: string | undefined;

  for (const raw of tokenize(html)) {
    if (blocks.length >= MAX_BLOCKS) break;

    if (raw.tag === "ul" || raw.tag === "ol") {
      const items = [...raw.html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((m) => cleanText(m[1]))
        .filter((t) => t.length > 25 && !isNoise(t));
      // Short lists are almost always navigation or related-story teasers.
      if (items.length >= 3) {
        blocks.push({ type: "list", ordered: raw.tag === "ol", items: items.slice(0, 8) });
        chars += items.join(" ").length;
      }
      continue;
    }

    const text = cleanText(raw.html);
    if (!text) continue;

    if (raw.tag === "h2" || raw.tag === "h3") {
      // A heading is only useful if real prose follows it.
      if (text.length < 8 || text.length > 120 || isNoise(text)) continue;
      if (paragraphs === 0) continue;
      const id = slugify(text).slice(0, 60);
      if (!id || seen.has(`h:${id}`)) continue;
      seen.add(`h:${id}`);
      blocks.push({ type: "heading", level: raw.tag === "h2" ? 2 : 3, text, id });
      continue;
    }

    if (!isProse(text)) continue;

    const key = normalize(text).slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);

    if (raw.tag === "blockquote" || (isPullQuote(text) && quotes === 0 && paragraphs > 0)) {
      if (quotes >= 1) continue;
      quotes++;
      blocks.push({ type: "quote", text: text.replace(/^[«"“]|[»"”]$/g, "").trim() });
      chars += text.length;
      continue;
    }

    firstParagraph ??= text;
    paragraphs++;
    chars += text.length;
    blocks.push({ type: "paragraph", text });
  }

  // A trailing heading with nothing under it looks broken.
  while (blocks.length > 0 && blocks[blocks.length - 1].type === "heading") blocks.pop();

  return { blocks, chars, paragraphs, firstParagraph };
}

/* ========================================================================== */

/** Trims to the last complete sentence that fits, so cards never end mid-word. */
function toExcerpt(text: string, max = 220): string {
  const clean = decodeEntities(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (lastStop > max * 0.5) return cut.slice(0, lastStop + 1).trim();
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}

/** Publishers append their own name to the headline; the byline already says it. */
function cleanTitle(title: string, sourceName: string): string {
  const clean = decodeEntities(title)
    .replace(/\s*[|–—-]\s*[^|–—-]{2,40}$/, (match) =>
      normalize(match).includes(normalize(sourceName)) ? "" : match
    )
    .trim();
  return clean.length > 20 ? clean : decodeEntities(title);
}

/** Up to three vertical keywords actually present in the story. */
function deriveTags(source: FeedSource, title: string, body: string): string[] {
  const haystack = normalize(`${title} ${body}`);
  const hits = source.keywords.filter((k) => haystack.includes(normalize(k)));
  const tags = hits.slice(0, 3).map((k) => slugify(k)).filter(Boolean);
  return [...new Set(tags)];
}

const FETCH_TIMEOUT_MS = 12_000;

interface ExtractedArticle {
  image?: ArticleImage;
  body: ParsedBody;
  description?: string;
  author?: string;
}

/** Bylines come as "Por Jane Doe", "Jane Doe / EFE", "Jane Doe, Juan Pérez"... keep just the name(s). */
function cleanAuthor(raw: string | undefined, sourceName: string): string | undefined {
  if (!raw) return undefined;
  const name = decodeEntities(raw)
    .replace(/^(por|by)\s+/i, "")
    .split(/[\/|]/)[0]
    .trim();
  if (!name || name.length > 80) return undefined;
  if (isNoise(name)) return undefined;
  if (normalize(name) === normalize(sourceName)) return undefined;
  // Wire-service bylines aren't a person and are already credited via sourceName.
  if (/^(efe|reuters|ap|europa press|afp)$/i.test(name)) return undefined;
  return name;
}

/**
 * Reads the publisher's page once and takes from it the hero photo, the real
 * body, the summary and (when the page exposes one) the original journalist's
 * byline, so the republished piece can credit a person, not just an outlet.
 */
async function extractArticle(sourceUrl: string, title: string, sourceName: string): Promise<ExtractedArticle | null> {
  try {
    const article = await extract(sourceUrl, {}, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!article?.content) return null;

    const image: ArticleImage | undefined = article.image?.startsWith("http")
      ? { url: article.image.replace(/^http:/, "https:"), alt: title, credit: sourceName }
      : undefined;

    return {
      image,
      body: parseBody(article.content),
      description: article.description ?? undefined,
      author: cleanAuthor(article.author, sourceName),
    };
  } catch {
    return null;
  }
}

/** Anything narrower than this looks visibly soft once stretched into a hero slot. */
const MIN_IMAGE_WIDTH = 600;
const IMAGE_FETCH_TIMEOUT_MS = 8_000;
/** Refuse to download beyond this even if a server lies about Content-Length. */
const MAX_IMAGE_BYTES = 12_000_000;

/**
 * Some publishers advertise an og:image that is a redirect, a placeholder, a
 * plain 404, or a real photo shrunk to a tiny thumbnail. A HEAD request only
 * catches the first three — actual pixel dimensions need the bytes, so this
 * downloads the image and reads its header via sharp before it reaches the
 * database.
 */
async function isServableImage(url: string): Promise<boolean> {
  if (!url.startsWith("https://")) return false;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/") || type.includes("svg")) return false;

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) return false;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) return false;

    const { width } = await sharp(buffer).metadata();
    return typeof width === "number" && width >= MIN_IMAGE_WIDTH;
  } catch {
    return false;
  }
}

/** First candidate photo that actually resolves to an image. */
async function pickImage(candidates: (ArticleImage | undefined)[], fallback: ArticleImage): Promise<ArticleImage> {
  for (const candidate of candidates) {
    if (candidate && (await isServableImage(candidate.url))) return candidate;
  }
  return fallback;
}

/** Runs `worker` over `items` with a bounded number of simultaneous requests. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

const CONCURRENCY = 6;

/** Fetches, extracts and quality-gates every raw RSS item for one category. */
async function extractItems(rawItems: BingItem[], source: FeedSource): Promise<(NormalizedFeedItem | null)[]> {
  return mapWithConcurrency(rawItems, CONCURRENCY, async (item): Promise<NormalizedFeedItem | null> => {
    if (!item.title || !item.link) return null;

    const sourceName = item.bingSource ? decodeEntities(item.bingSource) : "Fuente externa";
    const title = cleanTitle(item.title, sourceName);
    const sourceUrl = unwrapSourceUrl(item.link);
    if (!sourceUrl.startsWith("https://")) return null;

    const extracted = await extractArticle(sourceUrl, title, sourceName);
    if (!extracted) return null;

    // Quality gate: without real reporting there is no article worth publishing.
    const { blocks, chars, paragraphs, firstParagraph } = extracted.body;
    if (paragraphs < MIN_PARAGRAPHS || chars < MIN_BODY_CHARS) return null;

    const image = await pickImage(
      [
        extracted.image,
        item.bingImage
          ? { url: fullSizeImage(item.bingImage, item.bingImageMaxWidth, item.bingImageMaxHeight), alt: title, credit: sourceName }
          : undefined,
      ],
      source.fallbackImage
    );

    // The lede is the summary in any well-written piece, and unlike the page's
    // meta description it is guaranteed to be clean prose.
    const summarySource =
      firstParagraph ??
      (extracted.description && !isNoise(extracted.description) ? extracted.description : item.contentSnippet ?? title);

    const byline = extracted.author
      ? `Escrito originalmente por **${extracted.author}** para ${sourceName}.`
      : `Publicado originalmente por ${sourceName}.`;

    const body: Block[] = [
      ...blocks,
      { type: "divider" },
      {
        type: "callout",
        tone: "info",
        title: "Fuente original",
        // The [label](url) markdown is rendered as a real link by ArticleBody —
        // readers get a clickable way back to the source, not just a mention of one.
        text: `${byline} [Lee la noticia completa en ${sourceName} ↗](${sourceUrl})`,
      },
    ];

    return {
      title,
      sourceUrl,
      sourceName,
      publishedAt: item.isoDate ?? new Date().toISOString(),
      excerpt: toExcerpt(summarySource),
      tags: deriveTags(source, title, firstParagraph ?? ""),
      blocks: body,
      image,
    };
  });
}

/** Raw candidates gathered per accepted item, since roughly half fail the quality gate. */
const OVERFETCH = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fetches and normalizes the most relevant recent items for one category,
 * drawing from several search angles so there is enough raw material to fill
 * a full month of coverage. Stories whose body cannot be read properly are
 * discarded rather than published as a one-line stub, and near-duplicate
 * headlines from syndicated wire copy are collapsed to one.
 *
 * Bing ranks by relevance, not recency, so a broad topic query mixes in
 * evergreen pieces from a year ago alongside this morning's news. Raw items
 * are split into "within `maxAgeDays`" and "older", and the older pool is
 * only drawn on to avoid coming back short — freshness always wins first.
 */
export async function fetchCategoryFeed(categorySlug: string, limit = 30, maxAgeDays = 30): Promise<NormalizedFeedItem[]> {
  const source = FEED_SOURCES.find((s) => s.category === categorySlug);
  if (!source) return [];

  // A single Bing query returns barely a dozen items, so queries run one at a
  // time and stop as soon as there is enough fresh raw material — a small daily
  // top-up rarely needs more than the first query or two, while a large backfill
  // works through the whole list.
  const targetRaw = Math.ceil(limit * OVERFETCH);
  const maxAgeMs = maxAgeDays * DAY_MS;
  const seenUrls = new Set<string>();
  const fresh: BingItem[] = [];
  const stale: BingItem[] = [];

  for (const query of source.queries) {
    if (fresh.length >= targetRaw) break;
    try {
      const feed = await parser.parseURL(feedUrl(query));
      for (const item of feed.items ?? []) {
        if (!item.title || !item.link) continue;
        const sourceUrl = unwrapSourceUrl(item.link);
        if (!sourceUrl.startsWith("https://") || seenUrls.has(sourceUrl)) continue;
        seenUrls.add(sourceUrl);
        const age = item.isoDate ? Date.now() - new Date(item.isoDate).getTime() : 0;
        (age <= maxAgeMs ? fresh : stale).push(item);
      }
    } catch {
      // A failed sub-query just means less raw material; the rest still run.
    }
  }

  // Only reach into the older pool when freshness alone can't fill the target.
  const rawItems = fresh.length >= targetRaw ? fresh : [...fresh, ...stale].slice(0, targetRaw);

  const extracted = await extractItems(rawItems, source);

  // Drop rejects and near-duplicate headlines from syndicated wire copy.
  const seenTitles = new Set<string>();
  const unique: NormalizedFeedItem[] = [];
  for (const item of extracted) {
    if (!item) continue;
    const key = normalize(item.title).replace(/[^a-z0-9 ]/g, "").split(/\s+/).slice(0, 8).join(" ");
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    unique.push(item);
  }

  // Spanish and major international sources fill the list first; a Latin
  // American outlet only takes a slot once those run out, and within each
  // group the most recent stories lead.
  unique.sort((a, b) => {
    const latamDelta = Number(isLatamSource(a.sourceUrl)) - Number(isLatamSource(b.sourceUrl));
    if (latamDelta !== 0) return latamDelta;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return unique.slice(0, limit);
}
