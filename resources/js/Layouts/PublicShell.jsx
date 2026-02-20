import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";

export default function PublicShell({ title, subtitle, children }) {
  const page = usePage();
  const user = page.props?.auth?.user ?? null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Head title={title ?? "Veranstaltungen"} />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold text-slate-900">
              DBOOKING
            </Link>
            <span className="text-slate-300">|</span>
            <Link href={route("public.veranstaltungen.index")} className="text-slate-700 hover:text-slate-900">
              Veranstaltungen
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href={route("dashboard")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href={route("login")} className="text-sm text-slate-700 hover:text-slate-900">
                  Login
                </Link>
                <Link
                  href={route("register")}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        </div>

        {children}
      </main>
    </div>
  );
}