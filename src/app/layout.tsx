import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { JsonLd } from "@/components/seo/JsonLd";
import { websiteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
  },
  twitter: { card: "summary_large_image", site: site.twitter },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0e" },
  ],
  colorScheme: "light dark",
};

// Prevent theme flash: apply stored/system preference before first paint.
const themeBoot = `(function(){try{var t=localStorage.getItem('hn-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${inter.variable} ${fraunces.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <JsonLd data={websiteJsonLd()} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[var(--accent-fg)]">
          Saltar al contenido
        </a>
        <Navbar />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <SearchDialog />
      </body>
    </html>
  );
}
