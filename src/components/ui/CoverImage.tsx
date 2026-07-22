import Image from "next/image";
import type { ArticleImage } from "@/lib/types";
import { CoverArt } from "./CoverArt";

/**
 * Featured photograph for an article. Uses next/image (lazy, responsive,
 * AVIF/WebP) with a category-tinted gradient fallback if no photo is set.
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
  if (!image) {
    return <CoverArt seed={seed} category={category} className={className} rounded={rounded} priority={priority} />;
  }
  return (
    <div className={`relative overflow-hidden ${rounded} ${className} bg-muted`}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
