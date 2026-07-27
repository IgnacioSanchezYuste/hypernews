"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

/** The `dark` class on <html> is the source of truth; this watches it. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");
const isDarkOnServer = () => false;

/**
 * Light/dark toggle. Default is light (the brand). Preference persists in
 * localStorage; the inline boot script in <head> is what prevents a flash of
 * the wrong theme on first paint. This effect mirrors that same script and
 * re-applies the class on mount — a safety net for the cases (some CDNs and
 * proxies rewrite or defer inline `<head>` scripts) where the boot script's
 * class never makes it to first paint.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem("hn-theme");
      const shouldBeDark = stored === "dark" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", shouldBeDark);
    } catch {}
  }, []);

  const dark = useSyncExternalStore(subscribe, isDark, isDarkOnServer);

  function toggle() {
    const next = !dark;
    // Flipping the class notifies the observer, which re-renders this button.
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("hn-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      className={compact ? "grid h-6 w-6 place-items-center rounded-full text-muted transition-colors hover:text-fg" : "grid h-9 w-9 place-items-center rounded-full border border-hair text-muted transition-colors hover:bg-muted hover:text-fg"}
    >
      {dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
