"use client";

import { useEffect } from "react";

/**
 * Fires once per mount to record a real page view. Article pages are cached
 * (ISR), so this can't happen server-side on every request — it has to run
 * in the reader's browser instead. `sendBeacon` survives the tab closing or
 * navigating away before the request would otherwise complete.
 */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const body = JSON.stringify({ slug });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track/view", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track/view", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [slug]);

  return null;
}
