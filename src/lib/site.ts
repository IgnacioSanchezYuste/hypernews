/** Global site configuration — single source of truth for SEO & branding. */

export const site = {
  name: "HyperNews",
  tagline: "Historias que merecen tu atención",
  description:
    "HyperNews es un medio digital moderno: artículos, noticias, guías y recursos de calidad sobre tecnología, ciencia, negocios, cultura y mucho más.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://hypernews.example",
  locale: "es_ES",
  lang: "es",
  twitter: "@hypernews",
  email: "hola@hypernews.example",
  themeColor: "#22a9de",
  social: [
    { label: "X / Twitter", href: "https://x.com/hypernews", icon: "x" },
    { label: "Instagram", href: "https://instagram.com/hypernews", icon: "instagram" },
    { label: "LinkedIn", href: "https://linkedin.com/company/hypernews", icon: "linkedin" },
    { label: "YouTube", href: "https://youtube.com/@hypernews", icon: "youtube" },
    { label: "RSS", href: "/feed.xml", icon: "rss" },
  ],
} as const;

export type Site = typeof site;
