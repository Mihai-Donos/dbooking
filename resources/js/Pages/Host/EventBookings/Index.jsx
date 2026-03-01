// resources/js/Pages/Host/EventBookings/Index.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import {
  ArrowLeft,
  BedSingle,
  Baby,
  User,
  UserCheck,
  Triangle,
} from "lucide-react";

function formatDateTime(v) {
  if (!v) return "—";
  const d = new Date(String(v).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "—";

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatMoney(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// interne Status-Keys für Filter/Counts
function bookingStatusKey(b) {
  if (b.status_key) return b.status_key;

  const s = String(b.status_label || "").toLowerCase();

  if (s.includes("bestät")) return "confirmed";
  if (s.includes("storniert") || s.includes("cancel")) return "cancelled";

  // Fallback
  return "in_progress";
}

const STATUS_TABS = [
  { key: "in_progress", label: "In Bearbeitung" },
  { key: "confirmed", label: "Bestätigt" },
  { key: "cancelled", label: "Storniert" },
];

export default function EventBookingsIndex({ event, bookings = [], summary = {} }) {
  const [statusFilter, setStatusFilter] = useState("in_progress");
  const [sortBy, setSortBy] = useState(null); // 'person' | 'room' | null
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'

  // Slider-Thumb: Position + Breite
  const sliderRef = useRef(null);
  const [thumbRect, setThumbRect] = useState({ left: 0, width: 0 });

  const total = summary.bookings_count ?? bookings.length;

  // aktuell ausgewählten Tab-Index berechnen
  const activeIndex = STATUS_TABS.findIndex((t) => t.key === statusFilter);
  // Fallback, falls irgendwas schiefgeht
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  // Counts je Status
  const statusCounts = useMemo(() => {
    const base = { in_progress: 0, confirmed: 0, cancelled: 0 };

    bookings.forEach((b) => {
      const key = bookingStatusKey(b);
      if (base[key] !== undefined) base[key] += 1;
    });

    return base;
  }, [bookings]);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;
  
    // Aktiven Button anhand des Status-Keys finden
    const activeBtn = container.querySelector(
      `button[data-status-key="${statusFilter}"]`
    );
    if (!activeBtn) return;
  
    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();
  
    setThumbRect({
      left: bRect.left - cRect.left,
      width: bRect.width,
    });
  }, [statusFilter, bookings.length]); // bei Status-Wechsel / anderer Anzahl neu messen


  const handleSort = (field, dir) => {
    setSortBy(field);
    setSortDir(dir);
  };

  const sortIconClass = (field, dir) => {
    const active = sortBy === field && sortDir === dir;
    return [
      "h-3 w-3 transition",
      dir === "desc" ? "rotate-180" : "",
      active ? "text-slate-700 fill-slate-700" : "text-slate-300",
    ].join(" ");
  };

  const filteredAndSortedBookings = useMemo(() => {
    // 1. nach Status filtern
    const filtered = bookings.filter(
      (b) => bookingStatusKey(b) === statusFilter
    );

    // 2. sortieren (optional)
    if (!sortBy) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      let av;
      let bv;

      if (sortBy === "person") {
        av = String(a.customer_name || "").toLowerCase().trim();
        bv = String(b.customer_name || "").toLowerCase().trim();

        if (!av && !bv) return 0;
        if (!av) return 1;
        if (!bv) return -1;
      } else if (sortBy === "room") {
        const ra = a.room?.number;
        const rb = b.room?.number;

        const na =
          ra === null || ra === undefined || ra === ""
            ? Number.POSITIVE_INFINITY
            : Number(ra);
        const nb =
          rb === null || rb === undefined || rb === ""
            ? Number.POSITIVE_INFINITY
            : Number(rb);

        if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
        if (Number.isNaN(na)) return 1;
        if (Number.isNaN(nb)) return -1;

        av = na;
        bv = nb;
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [bookings, sortBy, sortDir, statusFilter]);

  return (
    <AppShell
      title="Anmeldungen verwalten"
      subtitle={event?.name ? `Event: ${event.name}` : "Event-Anmeldungen"}
      actions={
        <Link
          href={route("host.events.index")}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zur Eventliste
        </Link>
      }
    >
      <Head title="Anmeldungen verwalten" />

{/* Event-Kopf + Tabelle in EINER Card */}
<section className="soft-surface p-0">
  {/* Header-Bereich */}
  <div className="px-6 pt-6 pb-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between py-4">
      {/* Linke Seite: Event-Info */}
      <div className="min-w-0 space-y-1">
        <div className="text-xs text-slate-500">Event</div>
        <div className="text-lg font-semibold text-slate-900 truncate">
          {event?.name ?? "—"}
        </div>
        {event?.description ? (
          <div className="text-sm text-slate-600 line-clamp-2">
            {event.description}
          </div>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          {event?.location?.name && (
            <span>
              <span className="text-slate-500">Ort:</span>{" "}
              <span className="font-semibold text-slate-900">
                {event.location.name}
              </span>
            </span>
          )}
          <span>
            <span className="text-slate-500">Zeitraum:</span>{" "}
            <span className="font-semibold text-slate-900">
              {formatDateTime(event.start_date)} –{" "}
              {formatDateTime(event.end_date)}
            </span>
          </span>
        </div>
      </div>

      {/* Rechte Seite: Summary + Slider */}
      <div className="flex flex-col items-end gap-5">
        {/* Gesamt-Anmeldungen */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
          <UserCheck className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-900">
            {total} {total === 1 ? "Anmeldung" : "Anmeldungen"}
          </span>
        </div>

            {/* Status-Slider */}
            <div
              ref={sliderRef}
              className="relative inline-flex shrink-0 rounded-full bg-slate-100/80 py-1 px-1 shadow-inner overflow-hidden"
            >
              {/* Thumb richtet sich nach dem aktiven Button */}
              <div
                className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-200 ease-out"
                style={{
                  left: thumbRect.left,
                  width: thumbRect.width,
                }}
              />

              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.key;
                const count = statusCounts[tab.key] ?? 0;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    data-status-key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={[
                      "relative z-10 inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition",
                      active
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-700",
                    ].join(" ")}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1 text-[11px] text-slate-400">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
 
   {/* Divider OBEN für den Tabellenbereich */}
   <div className="border-t border-slate-100 py-3" />

      {/* Tabelle mit Buchungen */}

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-50/60 text-slate-700">
              <tr>
                {/* Person + Sort */}
                <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center gap-1">
                        <span>Person</span>
                        <div className="flex items-center gap-[2px]">
                        <button
                            type="button"
                            aria-label="Nach Name aufsteigend sortieren"
                            onClick={() => handleSort("person", "asc")}>
                            <Triangle className={sortIconClass("person", "asc")} />
                        </button>
                        <button
                            type="button"
                            aria-label="Nach Name absteigend sortieren"
                            onClick={() => handleSort("person", "desc")}>
                            <Triangle className={sortIconClass("person", "desc")} />
                        </button>
                        </div>
                    </div>
                </th>

                <th className="px-4 py-3 text-left font-semibold">Zeitraum</th>

                {/* Zimmer + Sort */}
                <th className="px-4 py-3 text-left font-semibold">
                    <div className="flex items-center gap-1">
                        <span>Zimmer</span>
                        <div className="flex items-center gap-[2px]">
                        <button
                            type="button"
                            aria-label="Nach Zimmernummer aufsteigend sortieren"
                            onClick={() => handleSort("room", "asc")}
                        >
                            <Triangle className={sortIconClass("room", "asc")} />
                        </button>
                        <button
                            type="button"
                            aria-label="Nach Zimmernummer absteigend sortieren"
                            onClick={() => handleSort("room", "desc")}
                        >
                            <Triangle className={sortIconClass("room", "desc")} />
                        </button>
                        </div>
                    </div>
                </th>

                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Betrag</th>
                <th className="px-4 py-3 text-right font-semibold w-40">
                  Aktionen
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedBookings.map((b) => {
                const extras = b.per_booking_items || [];

                return (
                  <tr key={b.id} className="hover:bg-sky-50/40">
                    {/* Person */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {b.customer_name || "—"}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {b.user?.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Zeitraum */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      <div className="grid grid-cols-[2.5rem_1fr] gap-x-2 gap-y-1">
                        <div className="text-xs font-semibold text-slate-600">
                          Von
                        </div>
                        <div className="tabular-nums">
                          {formatDateTime(b.from_date)}
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          Bis
                        </div>
                        <div className="tabular-nums">
                          {formatDateTime(b.to_date)}
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-slate-500 pl-12">
                        {b.nights} {b.nights === 1 ? "Nacht" : "Nächte"}
                      </div>
                    </td>

                    {/* Zimmer + Optionen + Pauschalen */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      <div className="flex items-center gap-2">
                        <BedSingle className="h-4 w-4 text-slate-500" />
                        <span>
                          {b.room?.number
                            ? `Zimmer ${b.room.number}`
                            : "Noch nicht zugewiesen"}
                        </span>
                      </div>

                      {/* Optionen: Einzelzimmer / Babybett */}
                      <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                      {(b.single_room || b.baby_bed) && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                            {b.single_room && (
                            <span
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
                                title="Einzelzimmer">
                                Einzelzimmer
                            </span>
                            )}

                            {b.baby_bed && (
                            <span
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700"
                                title="Babybett">
                                Babybett
                            </span>
                            )}
                        </div>
                        )}
                      </div>

                      {/* Pauschalen / Zuschläge */}
                      {extras.length > 0 && (
                        <div className="mt-1 text-xs text-slate-500 truncate">
                          {extras.map((x) => x.name).join(" • ")}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      <span className="soft-badge soft-badge-neutral">
                        {b.status_label ?? "In Bearbeitung"}
                      </span>
                    </td>

                    {/* Betrag */}
                    <td className="px-4 py-3 align-top text-right text-slate-900 tabular-nums">
                      {formatMoney(b.total_amount)} €
                    </td>

                    {/* Aktionen */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-2">
                        {/* Platzhalter: später Status / Zimmer / Details */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() =>
                            console.log("TODO: Details / Bearbeiten", b.id)
                          }
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAndSortedBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Noch keine Anmeldungen mit diesem Status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      
  </div>
</section>
    </AppShell>
  );
}