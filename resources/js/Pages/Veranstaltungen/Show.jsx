import React from "react";
import { Link } from "@inertiajs/react";
import PublicShell from "@/Layouts/PublicShell";

export default function Show({ event }) {
  return (
    <PublicShell
      title={event?.name ?? "Veranstaltung"}
      subtitle="Hier kann später der Buchungsprozess starten."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <p className="mt-1 font-semibold text-slate-900">{event?.status?.label ?? "—"}</p>
          </div>

          <Link
            href={route("public.veranstaltungen.index")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Zurück
          </Link>
        </div>

        <div className="mt-4 text-sm text-slate-700 whitespace-pre-wrap">
          {event?.description}
        </div>

        <div className="mt-6">
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Jetzt buchen (Platzhalter)
          </button>
        </div>
      </div>
    </PublicShell>
  );
}