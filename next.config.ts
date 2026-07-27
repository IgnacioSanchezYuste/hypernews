import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Locked down as far as a statically rendered app allows.
 *
 * `script-src` still needs `'unsafe-inline'`: the framework emits inline
 * bootstrap and streaming-payload scripts on every prerendered page, and a
 * nonce can only be issued per request, which would force every route to render
 * dynamically. The remaining directives still block the attacks that matter
 * most — remote script loading, framing, base-tag hijacking and off-site form
 * posts. Revisit if the site ever renders dynamically.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://www.youtube-nocookie.com",
  "media-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    // Editorial photography comes from the publishers we curate and from URLs an
    // admin pastes into the editor, so the host cannot be enumerated in advance.
    // The optimizer is instead constrained below: no SVG, no redirect chains,
    // a short list of output widths and a long cache, which keeps it from being
    // used as a general-purpose image proxy.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    qualities: [75],
    minimumCacheTTL: 2_678_400, // 31 days — a news photo never changes.
    // One hop covers the http→https and canonical-CDN redirects publishers use;
    // longer chains are a way to burn optimizer time, so they stop here.
    maximumRedirects: 1,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The panel must never be indexed or stored by a shared cache.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
