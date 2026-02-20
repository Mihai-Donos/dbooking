// resources/js/Pages/Admin/Locations/Index.jsx

import React, { useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

export default function Index({ locations = [] }) {
  const { flash } = usePage().props;
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return locations;

    return locations.filter((l) => {
      const name = (l.name ?? "").toLowerCase();
      const desc = (l.description ?? "").toLowerCase();
      return name.includes(query) || desc.includes(query);
    });
  }, [locations, q]);

  return (
    <AppShell
      title="Locations"
      subtitle="Admin: Überblick über Hotels inkl. Zimmeranzahl."
      actions={
        <>
          <Link href={route("admin.locations.create")} className="btn btn-primary">
            + Location anlegen
          </Link>
          <Link
            href={route("admin.locations.assign")}
            className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
          >
            Locations freigeben
          </Link>
        </>
      }
    >
      {flash?.success && (
        <div className="soft-alert soft-alert-success">
          <div className="font-bold">OK</div>
          <div className="mt-1 text-sm opacity-80">{flash.success}</div>
        </div>
      )}

      <div className="soft-surface p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Suche
            </label>
            <input
              className="form-input w-full"
              placeholder="Name oder Beschreibung…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="text-sm text-gray-600">
            Ergebnisse:{" "}
            <span className="font-semibold text-gray-900">{filtered.length}</span> / {locations.length}
          </div>
        </div>

        <div className="soft-divider my-5" />

        {filtered.length === 0 ? (
          <div className="text-sm text-gray-600">Keine Locations gefunden.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map((l) => {
              const roomsCount = Number(l.rooms_count ?? 0);
              const capSum = Number(l.capacity_sum ?? 0);

              return (
                <div
                  key={l.id}
                  className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_20px_27px_0_rgba(0,0,0,0.06)]"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[18px] font-bold tracking-tight text-gray-900">
                        {l.name}
                      </div>

                      {l.description ? (
                        <div className="mt-1 line-clamp-2 text-sm text-gray-600">{l.description}</div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-400">— keine Beschreibung —</div>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`soft-badge ${
                          roomsCount === 0
                            ? "soft-badge-neutral border-rose-300/70 text-rose-700"
                            : "soft-badge-neutral"
                        }`}
                      >
                        Zimmer: {roomsCount}
                      </span>

                      <span
                        className={`soft-badge soft-badge-neutral ${
                          capSum === 0 ? "border-rose-300/70 text-rose-700" : ""
                        }`}
                      >
                        Kapazität: {capSum}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {l.created_at
                        ? `Erstellt: ${new Date(l.created_at).toLocaleDateString("de-DE")}`
                        : ""}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={route("admin.locations.edit", l.id)}
                        className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
                      >
                        Bearbeiten
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}