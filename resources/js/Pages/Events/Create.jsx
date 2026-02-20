import React, { useMemo, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Save, X } from "lucide-react";
import AppShell from "@/Layouts/AppShell";

export default function Create({
  routeBase = "host.events",
  locations = [],
  offers = [],
  statusOptions = [],
}) {
  const { data, setData, post, processing, errors, transform } = useForm({
    name: "",
    description: "",
    location_id: locations?.[0]?.id ?? "",
    start_date: "",
    end_date: "",
    booking_visible_from: "",
    booking_visible_to: "",
    status: statusOptions?.[0]?.value ?? 0,
    offerings: {},
  });

  const [offerQuery, setOfferQuery] = useState("");

  const offersFiltered = useMemo(() => {
    const q = offerQuery.trim().toLowerCase();
    if (!q) return offers;

    return offers.filter((o) => {
      const hay = [o?.name, o?.type_label, o?.charge_type_label, String(o?.id ?? "")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [offerQuery, offers]);

  const selectedCount = useMemo(() => {
    return Object.values(data.offerings || {}).filter((v) => v?.selected).length;
  }, [data.offerings]);

  const setOffering = (id, patch) => {
    const prev = data.offerings || {};
    const current = prev[id] || {};
    setData("offerings", { ...prev, [id]: { ...current, ...patch } });
  };

  const toggleOffering = (id, checked) => {
    const prev = data.offerings || {};

    if (!checked) {
      const next = { ...prev };
      delete next[id];
      setData("offerings", next);
      return;
    }

    const current = prev[id] || {};
    setData("offerings", {
      ...prev,
      [id]: { selected: true, price: current.price ?? "0.00", visible: current.visible ?? true },
    });
  };

  const normalizePrice = (v) => String(v ?? "0.00").replace(",", ".");

  const buildOfferingsPayloadFrom = (offeringsMap) =>
    Object.entries(offeringsMap || {})
      .filter(([, v]) => v?.selected)
      .map(([offeringId, v]) => ({
        offering_id: Number(offeringId),
        price: normalizePrice(v?.price ?? "0.00"),
        visible: !!v?.visible,
      }));

  const onSubmit = (e) => {
    e.preventDefault();

    transform((formData) => {
      const { offerings: offeringsMap, ...rest } = formData;

      return {
        ...rest,
        status: Number(rest.status),
        location_id: rest.location_id === "" ? "" : Number(rest.location_id),
        offerings: buildOfferingsPayloadFrom(offeringsMap),
      };
    });

    post(route(`${routeBase}.store`), {
      preserveScroll: true,
      onFinish: () => transform((d) => d),
    });
  };

  return (
    <AppShell
      title="Event anlegen"
      subtitle="Zeitraum, Sichtbarkeit, Status, Location und Offerings festlegen."
      actions={
        <>
          <Link href={route(`${routeBase}.index`)} className="btn btn-secondary inline-flex items-center gap-2">
            <X className="h-4 w-4" />
            Abbrechen
          </Link>
          <button
            type="submit"
            form="event-create-form"
            disabled={processing}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Speichern
          </button>
        </>
      }
    >
      <Head title="Event anlegen" />

      <section className="soft-surface p-6">
        <form id="event-create-form" onSubmit={onSubmit} className="space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name <span className="text-rose-600">*</span>
              </label>
              <input
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                autoFocus
              />
              {errors.name && <p className="mt-2 text-sm text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Location <span className="text-rose-600">*</span>
              </label>
              <select
                value={data.location_id}
                onChange={(e) => setData("location_id", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.location_id && <p className="mt-2 text-sm text-rose-600">{errors.location_id}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Beschreibung <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={4}
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
            {errors.description && <p className="mt-2 text-sm text-rose-600">{errors.description}</p>}
          </div>

          {/* Zeitraum */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Start <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={data.start_date}
                onChange={(e) => setData("start_date", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.start_date && <p className="mt-2 text-sm text-rose-600">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ende <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={data.end_date}
                onChange={(e) => setData("end_date", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.end_date && <p className="mt-2 text-sm text-rose-600">{errors.end_date}</p>}
            </div>
          </div>

          {/* Sichtbarkeit + Status */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700">
                Status <span className="text-rose-600">*</span>
              </label>
              <select
                value={data.status}
                onChange={(e) => setData("status", Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="mt-2 text-sm text-rose-600">{errors.status}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Buchbar von <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={data.booking_visible_from}
                onChange={(e) => setData("booking_visible_from", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.booking_visible_from && (
                <p className="mt-2 text-sm text-rose-600">{errors.booking_visible_from}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Buchbar bis <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                value={data.booking_visible_to}
                onChange={(e) => setData("booking_visible_to", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
              {errors.booking_visible_to && <p className="mt-2 text-sm text-rose-600">{errors.booking_visible_to}</p>}
            </div>
          </div>

          <div className="soft-divider" />

          {/* Offerings */}
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Offerings auswählen</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Ausgewählt: <span className="font-medium">{selectedCount}</span>
                </p>
              </div>

              <input
                value={offerQuery}
                onChange={(e) => setOfferQuery(e.target.value)}
                placeholder="Offerings suchen…"
                className="w-full md:w-80 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-sky-50/60 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold w-16">Aktiv</th>
                    <th className="px-4 py-3 text-left font-semibold">Offering</th>
                    <th className="px-4 py-3 text-left font-semibold">Typ</th>
                    <th className="px-4 py-3 text-left font-semibold">Abrechnung</th>
                    <th className="px-4 py-3 text-left font-semibold w-40">Preis (€)</th>
                    <th className="px-4 py-3 text-left font-semibold w-28">Buchbar</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {offersFiltered.map((o) => {
                    const row = data.offerings?.[o.id];
                    const selected = !!row?.selected;

                    return (
                      <tr key={o.id} className="hover:bg-sky-50/40">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => toggleOffering(o.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{o.name}</div>
                          <div className="mt-1 text-xs text-slate-500">#{o.id}</div>
                        </td>

                        <td className="px-4 py-3 text-slate-700">{o.type_label ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{o.charge_type_label ?? "—"}</td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            disabled={!selected}
                            value={row?.price ?? ""}
                            onChange={(e) => setOffering(o.id, { selected: true, price: e.target.value })}
                            placeholder={selected ? "0.00" : "—"}
                            className={[
                              "w-full rounded-xl border px-3 py-2 shadow-sm outline-none",
                              selected
                                ? "border-slate-200 bg-white text-slate-900 focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                : "border-slate-100 bg-slate-50 text-slate-400",
                            ].join(" ")}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 text-slate-700">
                            <input
                              type="checkbox"
                              disabled={!selected}
                              checked={selected ? !!row?.visible : false}
                              onChange={(e) => setOffering(o.id, { selected: true, visible: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span className={selected ? "" : "text-slate-400"}>sichtbar</span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}

                  {offersFiltered.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                        Keine Offerings gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {errors.offerings && <p className="mt-2 text-sm text-rose-600">{errors.offerings}</p>}
          </div>
        </form>
      </section>
    </AppShell>
  );
}