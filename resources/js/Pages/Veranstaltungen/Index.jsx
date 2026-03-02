import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import PublicShell from "@/Layouts/PublicShell";
import Pagination from "@/Components/Pagination";
import AppShell from "@/Layouts/AppShell";


function formatDateRange(start, end) {
  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso.replace(" ", "T"));
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function statusPillClass(statusValue) {
  switch (Number(statusValue)) {
    case 0:
      return "bg-slate-100 text-slate-800 border-slate-200";
    case 1:
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case 2:
      return "bg-amber-50 text-amber-800 border-amber-200";
    case 3:
      return "bg-sky-50 text-sky-800 border-sky-200";
    case 4:
      return "bg-slate-100 text-slate-700 border-slate-200";
    case 5:
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

export default function Index({ category = "Freizeiten", events }) {
  const { props } = usePage();
  const isAuthed = !!props?.auth?.user;

  const items = useMemo(() => events?.data ?? [], [events]);

  const content = (
    <>
      {/* Kategorien (vorerst nur 1) */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-3">
          <span className="font-medium text-slate-900">{category}</span>
          {/* später: <span className="text-slate-300">|</span> ... */}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((e) => {
          const statusValue = Number(e?.status?.value);
          const canBook = statusValue === 1; // ✅ NUR "Anmeldung möglich"

          return (
            <div
              key={e.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
            >
              {/* Bild/Placeholder */}

              <div className="h-36 overflow-hidden bg-slate-100">
                <img
                  src="/images/Title_Event.jpg"
                  alt="Symbolbild für Event"
                  className="h-full w-full object-cover"
                />
              </div>


              {/* Content (flex-1, damit Button unten bleibt) */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Titel */}
                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {e.name}
                </h3>

                {/* Beschreibung */}
                <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                  {e.description}
                </p>

                {/* Meta */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Zeitraum</span>
                    <span className="font-medium text-slate-700">{formatDateRange(e.start_date, e.end_date)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Ort</span>
                    <span className="font-medium text-slate-700">{e?.location?.name ?? "—"}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Status</span>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                        statusPillClass(statusValue),
                      ].join(" ")}
                      title={e?.status?.label}
                    >
                      {e?.status?.label}
                    </span>
                  </div>
                </div>

                {/* Button unten */}
                <div className="mt-5 pt-2">
                  {canBook ? (
                    <Link
                      href={route("bookings.new", e.id)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-sky-200 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300 transition"
                    >
                      Jetzt anmelden
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
                      title="Die Anmeldung ist aktuell nicht möglich"
                    >
                      Buchen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Aktuell werden keine Veranstaltungen angeboten.
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination links={events?.links ?? []} />
    </>
  );

  if (isAuthed) {
    return (
      <AppShell
        title="Veranstaltungen"
        subtitle="Entdecke aktuelle Veranstaltungen."
      >
        {content}
      </AppShell>
    );
  }

  return (
    <PublicShell
      title="Veranstaltungen"
      subtitle="Entdecke aktuelle Veranstaltungen."
    >
      {content}
    </PublicShell>
  );
}