"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-hair bg-transparent px-3 py-2 text-sm outline-none focus:border-strong"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-hair bg-transparent px-3 py-2 text-sm outline-none focus:border-strong"
        />
      </div>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-60"
      >
        {pending ? "Accediendo…" : "Acceder"}
      </button>
    </form>
  );
}
