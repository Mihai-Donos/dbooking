import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

function StatusBadge({ status }) {
  const label = status === 0 ? "New" : status === 1 ? "Confirmed" : status === 2 ? "Blocked" : String(status);
  const cls =
    status === 2
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : status === 1
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${cls}`}>
      {label}
    </span>
  );
}

export default function Edit({ user, roleOptions = ["user", "host", "admin"] }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user?.name ?? "",
    email: user?.email ?? "",
    role: user?.role ?? "user",
    status: user?.status ?? 0,
    notes: user?.notes ?? "",
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("admin.users.update", user.id));
  };

  return (
    <AppShell title="User bearbeiten" subtitle={`#${user.id} · ${user.email}`}>
      <Head title="Admin · User bearbeiten" />

      <section className="soft-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Account</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <span>Aktueller Status:</span>
              <StatusBadge status={Number(user.status)} />
            </div>
          </div>

          <Link
            href={route("admin.users.index")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Zurück
          </Link>
        </div>

        <form onSubmit={submit} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="block text-sm font-extrabold text-slate-800">
              Vorname, Name <span className="text-rose-600">*</span>
            </label>
            <input
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            />
            {errors.name && <div className="mt-2 text-sm text-rose-600">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800">
              E-Mail <span className="text-rose-600">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            />
            {errors.email && <div className="mt-2 text-sm text-rose-600">{errors.email}</div>}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800">
              Rolle <span className="text-rose-600">*</span>
            </label>
            <select
              value={data.role}
              onChange={(e) => setData("role", e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.role && <div className="mt-2 text-sm text-rose-600">{errors.role}</div>}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800">
              Status <span className="text-rose-600">*</span>
            </label>
            <select
              value={data.status}
              onChange={(e) => setData("status", Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            >
              <option value={0}>New</option>
              <option value={1}>Confirmed</option>
              <option value={2}>Blocked</option>
            </select>
            {errors.status && <div className="mt-2 text-sm text-rose-600">{errors.status}</div>}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-extrabold text-slate-800">
              Notes <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={data.notes}
              onChange={(e) => setData("notes", e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              required
            />
            {errors.notes && <div className="mt-2 text-sm text-rose-600">{errors.notes}</div>}
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={processing}
              className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-extrabold text-white shadow hover:bg-sky-700 disabled:opacity-60"
            >
              Speichern
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}