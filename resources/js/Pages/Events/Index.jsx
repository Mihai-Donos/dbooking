// resources/js/Pages/Host/Events/Index.jsx
import React, { useMemo, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  Pencil,
  Trash2,
  Plus,
  MapPinHouse,
  Users,
  ClipboardList,
} from "lucide-react";
import AppShell from "@/Layouts/AppShell";

function formatDateTime(v) {
  if (!v) return "—";
  const d = new Date(String(v).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "—";

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function StatusBadge({ status, label }) {
  const s = Number(status);

  const cls =
    s === 5
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : s === 4
      ? "bg-sky-50 text-sky-700 ring-sky-200"
      : s === 1
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : s === 2 || s === 3
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${cls}`}
    >
      {label ?? "—"}
    </span>
  );
}

export default function Index({ routeBase = "host.events", events = [] }) {
  const { delete: destroy, processing } = useForm();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return events;

    return events.filter((e) => {
      const hay = [
        e?.name,
        e?.description,
        e?.location?.name,
        e?.status_label,
        String(e?.status ?? ""),
        String(e?.id ?? ""),
        String(e?.start_date ?? ""),
        String(e?.end_date ?? ""),
        String(e?.booking_visible_from ?? ""),
        String(e?.booking_visible_to ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [q, events]);

  const onDelete = (id) => {
    if (!confirm("Event wirklich löschen?")) return;
    destroy(route(`${routeBase}.destroy`, id), { preserveScroll: true });
  };

  return (
    <AppShell
      title="Events"
      subtitle="Verwalte Events und deren Offerings."
      actions={
        <Link
          href={route(`${routeBase}.create`)}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Event anlegen
        </Link>
      }
    >
      <Head title="Events" />

      <section className="soft-surface p-6">
        {/* Kopfzeile: Gesamt + Suche */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            Gesamt:{" "}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suchen…"
            className="w-full md:w-80 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="soft-divider my-6" />

        {/* Tabelle */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-50/60 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Event</th>
                <th className="px-4 py-3 text-left font-semibold">Teilnahmen</th>
                <th className="px-4 py-3 text-left font-semibold">Zeitraum</th>
                <th className="px-4 py-3 text-right font-semibold w-40">
                  Aktionen
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => {
                const pc = e.person_counts || {};
                const sc = e.status_counts || {};

                const totalPersons = pc.total ?? 0;

                return (
                  <tr key={e.id} className="hover:bg-sky-50/40">

                    {/* Event (wie bisher, plus Location unter der Beschreibung) */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-slate-900">
                          {e.name}
                        </div>
                        <StatusBadge
                          status={e.status}
                          label={e.status_label}
                        />
                      </div>

                      {e.description ? (
                        <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {e.description}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-slate-400">—</div>
                      )}

                      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPinHouse className="h-3.5 w-3.5 text-slate-400" />
                        <span>{e.location?.name ?? "Ort noch offen"}</span>
                      </div>
                    </td>

                    {/* Teilnahmen-Stats */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      {(() => {
                        const pc = e.person_counts || {};
                        const sc = e.status_counts || {};

                        const totalParticipations = pc.total ?? 0;         // alle gebuchten Plätze
                        const newRegistrations = sc.in_progress ?? 0;      // “in Bearbeitung” = neue Anmeldungen

                        return (
                          <div className="space-y-1 text-sm">
                            <div className="font-semibold text-slate-900">
                              {newRegistrations}{" "}
                              {newRegistrations === 1 ? "neue Anmeldung" : "neue Anmeldungen"}
                            </div>

                            <div className="text-slate-700">
                              {totalParticipations}{" "}
                              {totalParticipations === 1 ? "Teilnahme" : "Teilnahmen"}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Zeitraum – unverändert */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      <div className="grid grid-cols-[3.25rem_1fr] gap-x-2 gap-y-1">
                        <div className="font-semibold text-slate-900">Vom:</div>
                        <div className="text-slate-700 tabular-nums">
                          {formatDateTime(e.start_date)}
                        </div>

                        <div className="font-semibold text-slate-900">Bis:</div>
                        <div className="text-slate-700 tabular-nums">
                          {formatDateTime(e.end_date)}
                        </div>
                      </div>

                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <div className="grid grid-cols-[3.25rem_1fr] gap-x-2 gap-y-1 text-xs">
                          <div className="font-semibold text-slate-600">
                            Buchbar:
                          </div>
                          <div className="text-slate-600 tabular-nums">
                            {formatDateTime(e.booking_visible_from)} –{" "}
                            {formatDateTime(e.booking_visible_to)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Aktionen / Quick Actions */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-end gap-2">
                        {/* Primäre Quick Action: Anmeldungen verwalten (Platzhalter) */}
                        <Link
                          href={route("host.events.bookings", e.id)}
                          className="btn btn-secondary inline-flex items-center gap-2 text-xs">
                          <ClipboardList className="h-3.5 w-3.5" />
                          Anmeldungen
                        </Link>

                        {/* Sekundäre Actions als Icon-Buttons */}
                        <div className="flex justify-end gap-2">
                          {/* Event bearbeiten */}
                          <Link
                            href={route(`${routeBase}.edit`, e.id)}
                            className="icon-btn icon-btn--edit"
                            title="Event bearbeiten"
                          >
                            <Pencil className="icon-btn__icon" />
                          </Link>

                          {/* Platzhalter: Zimmer & Belegung */}
                          <button
                            type="button"
                            className="icon-btn icon-btn--edit"
                            title="Zimmer &amp; Belegung (kommt noch)"
                            onClick={() =>
                              console.log("TODO: Zimmer & Belegung", e.id)
                            }
                          >
                            <Users className="icon-btn__icon" />
                          </button>

                          {/* Löschen */}
                          <button
                            type="button"
                            onClick={() => onDelete(e.id)}
                            disabled={processing}
                            className="icon-btn icon-btn--danger"
                            title="Event löschen"
                          >
                            <Trash2 className="icon-btn__icon" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Keine Events gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}