import React, { useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Info } from "lucide-react";

export default function Register() {
  const { status } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    notes: "",
  });

  const [showTip, setShowTip] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    post(route("register"));
  };

  return (
    <GuestLayout>
      <Head title="Registrieren" />

      <div className="mx-auto w-full max-w-md">
        <div className="soft-surface p-6">
          <h1 className="text-xl font-semibold text-slate-900">Registrieren</h1>
          <p className="mt-1 text-sm text-slate-600">
            Bitte alle Felder ausfüllen. Dein Account muss anschließend bestätigt werden.
          </p>

          {status && (
            <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
              {status}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Vorname, Name <span className="text-rose-600">*</span>
              </label>
              <input
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                E-Mail <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email}</p>}
            </div>

            {/* Passwort */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Passwort <span className="text-rose-600">*</span>
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password}</p>}
            </div>

            {/* Passwort bestätigen */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Passwort bestätigen <span className="text-rose-600">*</span>
              </label>
              <input
                type="password"
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-700">
                  Allgemeine Infos <span className="text-rose-600">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTip(true)}
                    onMouseLeave={() => setShowTip(false)}
                    onFocus={() => setShowTip(true)}
                    onBlur={() => setShowTip(false)}
                    className="grid h-5 w-5 place-items-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
                    aria-label="Hinweis"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>

                  {showTip && (
                    <div className="absolute left-0 top-7 z-10 w-72 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg">
                      Erzähl uns etwas über dich, woher kommst du und wie bist du auf uns aufmerksam geworden?
                    </div>
                  )}
                </div>
              </div>

              <textarea
                rows={3}
                value={data.notes}
                onChange={(e) => setData("notes", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.notes && <p className="mt-2 text-sm text-rose-600">{errors.notes}</p>}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="btn btn-primary w-full"
            >
              {processing ? "Sende…" : "Registrieren"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Schon registriert?{" "}
              <Link href={route("login")} className="font-semibold text-sky-700 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </GuestLayout>
  );
}