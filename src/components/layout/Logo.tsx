import Image from "next/image";
import { site } from "@/lib/site";

/** HyperNews wordmark: the HyperFocus logo + the masthead name. */
export function Logo({ compact = false, size = 34 }: { compact?: boolean; size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/logo.png" alt={`${site.name} logo`} width={size} height={size} priority className="shrink-0" />
      {!compact && (
        <span className="font-serif text-[1.35rem] font-semibold leading-none tracking-tight text-fg">
          Hyper<span className="text-brand-500">News</span>
        </span>
      )}
      <span className="sr-only">{site.name}</span>
    </span>
  );
}
