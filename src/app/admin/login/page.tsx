import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso administración",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-subtle px-4">
      <div className="w-full max-w-sm rounded-2xl border border-hair bg-surface p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-medium">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted">Accede con tu cuenta de administrador.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
