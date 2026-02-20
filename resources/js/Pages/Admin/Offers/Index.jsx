// resources/js/Pages/Admin/Offers/Index.jsx

import React, { useMemo, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import { Pencil, Trash2 } from "lucide-react";

export default function Index({ offers = [] }) {
  const { flash } = usePage().props;
  const [q, setQ] = useState("");

  const { delete: destroy, processing } = useForm();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return offers;
  
    return offers.filter((o) => {
      const name = (o.name ?? "").toLowerCase();
      const desc = (o.description ?? "").toLowerCase();
  
      const typeLabel = (o.type_label ?? "").toLowerCase();
      const chargeLabel = (o.charge_type_label ?? "").toLowerCase();
  
      // optional: auch nach Zahlen suchbar lassen
      const typeNum = String(o.type ?? "").toLowerCase();
      const chargeNum = String(o.charge_type ?? "").toLowerCase();
  
      return (
        name.includes(query) ||
        desc.includes(query) ||
        typeLabel.includes(query) ||
        chargeLabel.includes(query) ||
        typeNum.includes(query) ||
        chargeNum.includes(query)
      );
    });
  }, [offers, q]);

  const onDelete = (offer) => {
    if (processing) return;
    // eslint-disable-next-line no-alert
    if (!confirm(`Offer "${offer.name}" wirklich löschen?`)) return;

    destroy(route("admin.offers.destroy", offer.id), {
      preserveScroll: true,
    });
  };

  return (
    <AppShell
      title="Offers"
      subtitle="Admin: Angebote verwalten."
      actions={
        <Link href={route("admin.offers.create")} className="btn btn-primary">
          + Offer anlegen
        </Link>
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
              placeholder="Name, Beschreibung, Type oder Charge Type…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="text-sm text-gray-600">
            Ergebnisse:{" "}
            <span className="font-semibold text-gray-900">{filtered.length}</span> / {offers.length}
          </div>
        </div>

        <div className="soft-divider my-5" />

        {filtered.length === 0 ? (
          <div className="text-sm text-gray-600">Keine Offers gefunden.</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_20px_27px_0_rgba(0,0,0,0.06)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-sky-50/60">
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-sky-900/70">
                    <th className="px-5 py-3">Name</th>
                    <th className="hidden md:table-cell px-5 py-3">Type</th>
                    <th className="px-5 py-3">Charge Type</th>
                    <th className="hidden lg:table-cell px-5 py-3">Erstellt</th>
                    <th className="px-5 py-3 text-right">Aktionen</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filtered.map((o) => {
                    const typeVal = o.type ?? null;
                    const chargeVal = o.charge_type ?? null;

                    return (
                      <tr key={o.id} className="hover:bg-sky-50/40">
                        <td className="px-5 py-4 align-top">
                          <div className="min-w-[220px]">
                            <div className="font-semibold text-gray-900">{o.name}</div>
                            {o.description ? (
                              <div className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {o.description}
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-400">— keine Beschreibung —</div>
                            )}
                          </div>
                        </td>

                        <td className="hidden md:table-cell px-5 py-4 align-top">
                          {o.type_label ? (
                            <span className="soft-badge soft-badge-neutral">{o.type_label}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span className="soft-badge soft-badge-info">
                            {o.charge_type_label ?? "—"}
                          </span>
                        </td>

                        <td className="hidden lg:table-cell px-5 py-4 align-top text-gray-600">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString("de-DE")
                            : "—"}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            {/* Edit (Pencil) */}
                            <Link
                                href={route("admin.offers.edit", o.id)}
                                className="icon-btn icon-btn--edit"
                                title="Bearbeiten"
                                aria-label="Bearbeiten"
                              >
                              <Pencil className="icon-btn__icon" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => onDelete(o)}
                              disabled={processing}
                              className="icon-btn icon-btn--danger"
                              title="Löschen"
                              aria-label="Löschen"
                            >
                              <Trash2 className="icon-btn__icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}