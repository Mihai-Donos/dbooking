import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Pencil, Info, CheckCircle2, Ban } from "lucide-react";
import { createPortal } from "react-dom";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === 0) return "New";
  if (status === 1) return "Confirmed";
  if (status === 2) return "Blocked";
  return String(status ?? "—");
}

function NotesTooltip({ text }) {
  const anchorRef = useRef(null);
  const bubbleRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: "right" });

  useEffect(() => setMounted(true), []);

  const computePos = () => {
    const el = anchorRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const approxW = 360;
    const gap = 10;

    const canPlaceRight = r.right + gap + approxW < window.innerWidth;
    const placement = canPlaceRight ? "right" : "left";

    const left = placement === "right" ? r.right + gap : r.left - gap;
    const top = r.top + r.height / 2;

    setPos({ top, left, placement });
  };

  useEffect(() => {
    if (!open) return;
    computePos();

    const onScroll = () => computePos();
    const onResize = () => computePos();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const b = bubbleRef.current;
    if (!b) return;

    const rect = b.getBoundingClientRect();

    let left = pos.left;
    let top = pos.top;

    top = clamp(top, 12 + rect.height / 2, window.innerHeight - 12 - rect.height / 2);

    if (pos.placement === "right") {
      left = clamp(left, 12, window.innerWidth - 12 - rect.width);
    } else {
      left = left - rect.width;
      left = clamp(left, 12, window.innerWidth - 12 - rect.width);
    }

    setPos((p) => ({ ...p, left, top }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pos.placement]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const a = anchorRef.current;
      const b = bubbleRef.current;
      if (!a || !b) return;
      if (a.contains(e.target) || b.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const bubble = open ? (
    <div
      ref={bubbleRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        zIndex: 9999,
      }}
      className="max-w-[380px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_18px_35px_rgba(0,0,0,0.14)]"
      role="tooltip"
    >
      <div className="font-semibold text-slate-900">Notizen</div>
      <div className="mt-1 leading-relaxed whitespace-pre-wrap">
        {text?.trim() ? text : "Keine Notizen vorhanden."}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="inline-grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notizen anzeigen"
      >
        <Info className="h-4 w-4" />
      </button>

      {mounted && bubble ? createPortal(bubble, document.body) : null}
    </>
  );
}

function StatusCell({ status }) {
  if (status === 2) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-700 ring-1 ring-rose-200">
        Blocked
      </span>
    );
  }
  return <span className="text-slate-700 font-semibold">{statusLabel(status)}</span>;
}

function TableHeader() {
  return (
    <thead className="bg-sky-600 text-white">
      <tr>
        <th className="px-4 py-3 text-left text-[13px] font-extrabold">Name</th>
        <th className="px-4 py-3 text-left text-[13px] font-extrabold">E-Mail</th>
        <th className="px-4 py-3 text-center text-[13px] font-extrabold">Rolle</th>
        <th className="px-4 py-3 text-left text-[13px] font-extrabold">Angemeldet am</th>
        <th className="px-4 py-3 text-left text-[13px] font-extrabold">Bestätigt am</th>
        <th className="px-4 py-3 text-center text-[13px] font-extrabold">Status</th>
        <th className="px-4 py-3 text-center text-[13px] font-extrabold w-44">Actions</th>
      </tr>
    </thead>
  );
}

function UsersTable({ rows, quickActions = false, filters }) {
  const doConfirm = (id) => {
    if (!confirm("Account wirklich freigeben?")) return;
    router.put(route("admin.users.confirm", id), {}, { preserveScroll: true });
  };

  const doBlock = (id) => {
    if (!confirm("Account wirklich blockieren?")) return;
    router.put(route("admin.users.block", id), {}, { preserveScroll: true });
  };

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
      <table className="min-w-full text-sm">
        <TableHeader />

        <tbody className="divide-y divide-slate-100">
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-sky-50/40">
              <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
              <td className="px-4 py-3 text-slate-700">{u.email}</td>
              <td className="px-4 py-3 text-center">
                 <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
                    {u.role ?? "—"}
                 </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(u.created_at)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(u.email_verified_at)}</td>
              <td className="px-4 py-3 text-center">
                <StatusCell status={u.status} />
              </td>

              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  {/* Quick Actions nur in oberer Card */}
                  {quickActions ? (
                    <>
                      <button
                        type="button"
                        onClick={() => doConfirm(u.id)}
                        className="inline-grid h-9 w-9 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100"
                        aria-label="Freigeben"
                        title="Freigeben"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => doBlock(u.id)}
                        className="inline-grid h-9 w-9 place-items-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:bg-rose-100"
                        aria-label="Blockieren"
                        title="Blockieren"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}

                  <Link
                    href={route("admin.users.edit", u.id)}
                    className="inline-grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                    aria-label="User bearbeiten"
                    title="Bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <NotesTooltip text={u.notes} />
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ meta, query }) {
  const page = meta?.current_page ?? 1;
  const last = meta?.last_page ?? 1;

  const go = (p) => {
    router.get(route("admin.users.index"), { ...query, page: p }, { preserveState: true, replace: true });
  };

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <span className="text-sm text-slate-600 mr-2">
        Seite <span className="font-semibold text-slate-900">{page}</span> / {last}
      </span>

      <button
        type="button"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        Zurück
      </button>

      <button
        type="button"
        disabled={page >= last}
        onClick={() => go(page + 1)}
        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      >
        Weiter
      </button>
    </div>
  );
}

export default function Index({ pending = [], users, filters }) {
  const [q, setQ] = useState(filters?.q ?? "");
  const [status, setStatus] = useState(filters?.status ?? "all");
  const [sort, setSort] = useState(filters?.sort ?? "created_at");
  const [dir, setDir] = useState(filters?.dir ?? "desc");

  const query = { q, status, sort, dir };

  const submit = (e) => {
    e.preventDefault();
    router.get(route("admin.users.index"), query, { preserveState: true, replace: true });
  };

  const applyQuick = (next) => {
    router.get(route("admin.users.index"), { ...query, ...next }, { preserveState: true, replace: true });
  };

  return (
    <AppShell title="User Administration" subtitle="Accounts freigeben, suchen und verwalten.">
      <Head title="Admin · Users" />

      {/* Card 1 */}
      <section className="soft-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Accounts zur Freigabe</h2>
            <p className="mt-1 text-sm text-slate-600">
              Alle neuen Accounts (Status <span className="font-semibold">0</span>) die bestätigt werden müssen.
            </p>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4 py-6 text-slate-600">
            Keine neuen Accounts vorhanden.
          </div>
        ) : (
          <UsersTable rows={pending} quickActions />
        )}
      </section>

      {/* Card 2 */}
      <section className="soft-surface p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Alle Accounts</h2>
            <p className="mt-1 text-sm text-slate-600">
              Status ≠ 0, maximal 10 Einträge pro Seite.
            </p>
          </div>

          <form onSubmit={submit} className="flex w-full lg:w-auto flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suchen (Name oder E-Mail)…"
              className="w-full sm:w-80 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                const v = e.target.value;
                setStatus(v);
                applyQuick({ status: v, page: 1 });
              }}
              className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              title="Status Filter"
            >
              <option value="all">Alle</option>
              <option value="confirmed">Confirmed</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => {
                const v = e.target.value;
                setSort(v);
                applyQuick({ sort: v, page: 1 });
              }}
              className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              title="Sortierung"
            >
              <option value="created_at">Datum</option>
              <option value="name">Name</option>
            </select>

            {/* Richtung */}
            <select
              value={dir}
              onChange={(e) => {
                const v = e.target.value;
                setDir(v);
                applyQuick({ dir: v, page: 1 });
              }}
              className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              title="Reihenfolge"
            >
              <option value="desc">Absteigend</option>
              <option value="asc">Aufsteigend</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-extrabold text-white shadow hover:bg-sky-700"
            >
              Suchen
            </button>
          </form>
        </div>

        <UsersTable rows={users?.data ?? []} />

        <Pagination meta={users?.meta} query={query} />
      </section>
    </AppShell>
  );
}