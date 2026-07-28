"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArticleImage } from "@/lib/types";
import { CoverArt } from "./CoverArt";

/**
 * Featured photograph for an article. Uses next/image (lazy, responsive,
 * AVIF/WebP) with a category-tinted gradient fallback if no photo is set.
 *
 * Curated stories point at photos hosted by the original publisher, and a few
 * of those hosts refuse requests coming from an image optimizer. When that
 * happens the generated cover art takes over instead of leaving a broken frame.
 */
export function CoverImage({
  image,
  seed,
  category,
  className = "",
  rounded = "rounded-xl",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  image?: ArticleImage;
  seed: string;
  category?: string;
  className?: string;
  rounded?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return <CoverArt seed={seed} category={category} className={className} rounded={rounded} priority={priority} />;
  }

  // The caller may pass its own `position` utility (e.g. the hero card needs
  // `absolute inset-0` to sit behind its text). Tailwind's cascade order makes
  // a hardcoded `relative` win over that regardless of class order, so only
  // fall back to it when the caller didn't specify one.
  const hasPosition = /(^|\s)(absolute|fixed|sticky|static)(\s|$)/.test(className);

  return (
    <div className={`${hasPosition ? "" : "relative "}overflow-hidden ${rounded} ${className} bg-muted`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </div>
  );
}
