// resources/js/Pages/Bookings/Overview.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Pencil,
  Trash2,
  ReceiptText,
  Tag,
  Leaf,
  WheatOff,
  MilkOff,
  BedSingle,
  Baby,
  UserCheck,
} from "lucide-react";
import AppShell from "@/Layouts/AppShell";

function formatDateTimeDE(iso) {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(" ", "T"));
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
}

function moneyDE(v) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

function badgeClass(label) {
  const s = String(label || "").toLowerCase();
  if (s.includes("in bearbeitung")) return "soft-badge soft-badge-neutral";
  if (s.includes("bestät")) return "soft-badge soft-badge-success";
  if (s.includes("anmeldung")) return "soft-badge soft-badge-success";
  if (s.includes("storniert")) return "soft-badge soft-badge-danger";
  if (s.includes("beendet")) return "soft-badge soft-badge-neutral";
  return "soft-badge soft-badge-neutral";
}

// Optionen -> Meta mit lucide icons (alles neutral, nur Leaf leicht grün)
function optionMeta(b) {
  const opts = [];
  if (b.vegetarian) opts.push({ key: "vegetarian", label: "Vegetarisch", Icon: Leaf, accent: "green" });
  if (b.glutenfree) opts.push({ key: "glutenfree", label: "Glutenfrei", Icon: WheatOff });
  if (b.lactose_free) opts.push({ key: "lactose_free", label: "Laktosefrei", Icon: MilkOff });
  if (b.single_room) opts.push({ key: "single_room", label: "Einzelzimmer", Icon: BedSingle });
  if (b.baby_bed) opts.push({ key: "baby_bed", label: "Babybett", Icon: Baby });
  return opts;
}

function chipClass(accent) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium";
  if (accent === "green") return `${base} border-emerald-200 bg-emerald-50 text-emerald-800`;
  return `${base} border-slate-200 bg-slate-50 text-slate-700`;
}

function optionIconBubbleClass(accent) {
  // neutral look; nur vegetarisch leicht grün
  if (accent === "green") {
    return "inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700";
}

function dateTimeLinesDE(fromIso, toIso) {
  return {
    from: `Von ${formatDateTimeDE(fromIso)}`,
    to: `Bis ${formatDateTimeDE(toIso)}`,
  };
}

function TapTooltipIcon({ id, label, children, activeTooltip, setActiveTooltip }) {
  const isOpen = activeTooltip === id;

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="contents"
        onClick={(e) => {
          e.stopPropagation();
          setActiveTooltip(isOpen ? null : id);
        }}
        aria-label={label}
      >
        {children}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 bottom-full z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-lg">
          {label}
        </div>
      )}
    </div>
  );
}

export default function Overview({ groups = [] }) {
  // standardmäßig: erstes Event offen (wenn vorhanden)
  const defaultOpen = useMemo(
    () => (groups?.[0]?.event?.id ? String(groups[0].event.id) : null),
    [groups]
  );
  const [openEventId, setOpenEventId] = useState(defaultOpen);

  const [activeTooltip, setActiveTooltip] = useState(null);

  React.useEffect(() => {
    function handleClickOutside() {
      setActiveTooltip(null);
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggle = (eventId) => {
    const id = String(eventId);
    setOpenEventId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (eventId, bookingId) => {
    if (!confirm("Buchung wirklich löschen?")) return;
    router.delete(route("bookings.destroy", [eventId, bookingId]), { preserveScroll: true });
  };

  return (
    <AppShell title="Anmeldungen" subtitle="Übersicht deiner Buchungen">
      <Head title="Anmeldungen – Übersicht" />

      <div className="space-y-6">
        {(!groups || groups.length === 0) && (
          <div className="soft-surface p-6">
            <div className="text-sm text-slate-600">Du hast aktuell keine Anmeldungen.</div>
          </div>
        )}

        {(groups || []).map((g) => {
          const e = g.event;
          const isOpen = String(openEventId) === String(e.id);

          return (
            <div key={e.id} className="soft-surface p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">Event</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold text-slate-900">{e.name}</div>
                   
                  </div>
                      {/* Desktop einzeilig */}
                      <div className="hidden sm:block mt-1 text-sm text-slate-600">
                        Von {formatDateTimeDE(e.start_date)} – Bis {formatDateTimeDE(e.end_date)}
                      </div>

                      {/* Mobile zweizeilig */}
                      <div className="mt-1 text-sm text-slate-600 sm:hidden">
                        <div className="grid grid-cols-[1.7rem_1fr] items-baseline gap-x-2 leading-snug">
                          <span className="text-slate-500">Von</span>
                          <span className="tabular-nums">{formatDateTimeDE(e.start_date)}</span>

                          <span className="text-slate-500">Bis</span>
                          <span className="tabular-nums">{formatDateTimeDE(e.end_date)}</span>
                        </div>
                      </div>
                  {e.location?.name ? (
                    <div className="mt-1 text-sm text-slate-600">
                      Ort: <b>{e.location.name}</b>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-3">
                {/* Summe */}
                <div className="text-right leading-tight">
                  <div className="text-xs text-slate-500">Gesamt</div>
                  <div className="text-lg font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {moneyDE(e.total_amount)} €
                  </div>
                  
                </div>

                {/* Anzahl */}
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xs">
                  <span className="text-sm font-semibold text-slate-900">{e.booking_count}×</span>
                  <span className="text-sm text-slate-600">
                    {Number(e.booking_count) === 1 ? "Platz" : "Plätze"}
                  </span>
                </div>

                {/* Chevron darunter */}
                <button
                  type="button"
                  className="icon-btn icon-btn--edit border-slate-300 hover:border-slate-400"
                  aria-label={isOpen ? "Einklappen" : "Ausklappen"}
                  onClick={() => toggle(e.id)}
                >
                  <svg
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              </div>

              {/* Body */}
              {isOpen ? (
                <div className="mt-5 space-y-3">
                  {(g.bookings || []).map((b) => {
                    const opts = optionMeta(b);

                    return (
                      <div
                        key={b.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                      >
                        {/* LEFT */}
                        <div className="min-w-0 sm:flex-1">
                            {/* Header: Desktop (1 Zeile) */}
                          <div className="hidden md:flex items-center gap-x-3 gap-y-1 min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{b.customer_name || "—"}</div>
                            <div className="text-sm text-slate-500 shrink-0">{b.nights} Nächte</div>
                          </div>

                          {/* Header: Mobile (Name oben, Nächte darunter) */}
                          <div className="md:hidden">
                            <div className="font-semibold text-slate-900 truncate">{b.customer_name || "—"}</div>
                            <div className="mt-1 text-sm text-slate-500">{b.nights} Nächte</div>
                          </div>

                          {/* Desktop */}
                          <div className="hidden sm:block mt-1 text-sm text-slate-600">
                            Von {formatDateTimeDE(b.from_date)} – Bis {formatDateTimeDE(b.to_date)}
                          </div>

                          {/* Mobile */}
                          <div className="mt-1 text-sm text-slate-600 sm:hidden">
                            <div className="grid grid-cols-[1.7rem_1fr] items-baseline gap-x-2 leading-snug">
                              <span className="text-slate-500">Von</span>
                              <span className="tabular-nums">{formatDateTimeDE(e.start_date)}</span>

                              <span className="text-slate-500">Bis</span>
                              <span className="tabular-nums">{formatDateTimeDE(e.end_date)}</span>
                            </div>
                          </div>

                          {/* Zimmer nur wenn Event das verlangt */}
                          {e.requires_room_assignment ? (
                            <div className="mt-1 text-sm text-slate-600">
                              Zimmer: <b>{b.room?.number ?? "noch nicht zugewiesen"}</b>
                            </div>
                          ) : null}

                          {/* Optionen: Mobile Icons, Desktop Chips (lucide-react) */}
                          {opts.length > 0 ? (
                            <div className="mt-2">
                              {/* Mobile: Icons */}
                              <div className="flex flex-wrap items-center gap-2 sm:hidden">
                                {opts.map(({ key, label, Icon, accent }) => (
                                   <TapTooltipIcon 
                                        key={key} 
                                        id={`${b.id}-${key}`} 
                                        label={label}
                                        activeTooltip={activeTooltip}
                                        setActiveTooltip={setActiveTooltip}
                                    >
                                   <span className={optionIconBubbleClass()}>
                                      <Icon className={`h-5 w-5 ${accent === "green" ? "text-green-600" : "text-slate-700"}`} />
                                    </span>
                                    </TapTooltipIcon>
                                ))}
                              </div>

                              {/* Desktop: Chips */}
                              <div className="hidden sm:flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                  <Tag className="h-4 w-4" />
                                  Optionen
                                </span>

                                {opts.map(({ key, label, accent }) => (
                                  <span key={key} className={chipClass()}>
                                    {label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* RIGHT */}
                        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:shrink-0">
                          
                        <div className="flex flex-col items-end text-right">
                          {/* Status immer oben rechts */}
                          {b.status_label ? (
                            <span className={badgeClass(b.status_label)}>{b.status_label}</span>
                          ) : null}

                          <div className="mt-2">
                            <div className="text-xs text-slate-500">Summe</div>
                            <div className="font-semibold text-slate-900 tabular-nums">
                              {moneyDE(b.total_amount)} €
                            </div>
                          </div>
                        </div>

                          {/* Aktionen nur wenn editierbar */}
                          {e.can_edit ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="icon-btn icon-btn--edit"
                                aria-label="Bearbeiten"
                                onClick={() => router.get(route("bookings.edit", [e.id, b.id]))}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                className="icon-btn icon-btn--edit"
                                aria-label="Löschen"
                                onClick={() => handleDelete(e.id, b.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {/* FULL-WIDTH: Pauschalen pro Anmeldung (nur Positionen > 0,00 €) */}
                        {(() => {
                          const items = (b.per_booking_items || []).filter(
                            (it) => Number(it.line_total ?? 0) > 0
                          );
                          if (items.length === 0) return null;

                          return (
                            <div className="w-full mt-3 pt-3 border-t border-slate-200/70">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <ReceiptText className="h-4 w-4" />
                                Enthaltene Pauschalen
                              </div>

                              <div className="mt-2 space-y-1 md:pr-23 text-sm text-slate-600">
                                {items.map((it) => (
                                  <div key={it.id} className="flex items-center justify-between gap-3">
                                    <span className="truncate">{it.name}</span>
                                    <span className="shrink-0 font-semibold text-slate-900 tabular-nums">
                                      {moneyDE(it.line_total)} €
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}