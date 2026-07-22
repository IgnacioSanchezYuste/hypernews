import Link from "next/link";
import { getAuthor } from "@/lib/authors";
import { Avatar } from "@/components/ui/Avatar";
import { formatViews, relativeTime } from "@/lib/utils";

/** Compact author + date (+ optional stats) byline used across cards & article. */
export function ArticleMeta({
  author,
  date,
  readingMinutes,
  views,
  size = "sm",
  withAvatar = true,
}: {
  author: string;
  date: string;
  readingMinutes?: number;
  views?: number;
  size?: "sm" | "md";
  withAvatar?: boolean;
}) {
  const a = getAuthor(author);
  return (
    <div className={`flex items-center gap-2.5 text-muted ${size === "md" ? "text-sm" : "text-xs"}`}>
      {withAvatar && <Avatar author={author} size={size === "md" ? 34 : 26} />}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {a && (
          <Link href={`/autor/${a.slug}`} className="font-medium text-fg link-underline">
            {a.name}
          </Link>
        )}
        <span aria-hidden className="text-subtle">·</span>
        <time dateTime={date}>{relativeTime(date)}</time>
        {readingMinutes != null && (
          <>
            <span aria-hidden className="text-subtle">·</span>
            <span>{readingMinutes} min de lectura</span>
          </>
        )}
        {views != null && (
          <>
            <span aria-hidden className="text-subtle">·</span>
            <span>{formatViews(views)} lecturas</span>
          </>
        )}
      </div>
    </div>
  );
}
