"use client";

import { useState } from "react";

/** Newsletter capture. Optimistic UI; wire `onSubscribe` to your ESP later. */
export function Newsletter({ variant = "band" }: { variant?: "band" | "inline" }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    // TODO: POST /api/newsletter → connect to Mailchimp / Resend / Beehiiv
    setDone(true);
  }

  const inner = (
    <div className={variant === "band" ? "mx-auto max-w-xl text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">El boletín de HyperNews</p>
      <h2 className={`mt-2 font-serif font-medium leading-tight ${variant === "band" ? "text-3xl md:text-4xl" : "text-2xl"}`}>
        Las mejores historias, cada mañana
      </h2>
      <p className="mt-3 text-muted">
        Una selección editorial de lo más relevante en tecnología, ciencia y cultura. Sin ruido, sin spam. Cancela cuando quieras.
      </p>
      {done ? (
        <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          ¡Gracias! Revisa tu correo para confirmar la suscripción. ✦
        </p>
      ) : (
        <form onSubmit={submit} className={`mt-6 flex flex-col gap-2 ${variant === "band" ? "sm:flex-row sm:mx-auto sm:max-w-md" : ""}`}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Tu correo electrónico"
            className="flex-1 rounded-full border border-hair bg-surface px-5 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          />
          <button type="submit" className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-fg)] transition-transform hover:-translate-y-0.5">
            Suscribirme
          </button>
        </form>
      )}
      <p className="mt-3 text-xs text-subtle">Únete a +48.000 lectores curiosos.</p>
    </div>
  );

  if (variant === "inline") {
    return <div className="rounded-2xl border border-hair bg-subtle p-6">{inner}</div>;
  }

  return (
    <section className="container-page my-16 md:my-24">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-hair bg-subtle px-6 py-14 md:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="relative">{inner}</div>
      </div>
    </section>
  );
}
