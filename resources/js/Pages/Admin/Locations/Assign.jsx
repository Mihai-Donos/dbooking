import React, { useEffect, useMemo } from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

export default function Assign({ hosts = [], locations = [], selectedHostId, assignedLocationIds = [] }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    host_id: selectedHostId || "",
    location_ids: assignedLocationIds || [],
  });

  // Wenn der Admin den Host wechselt (Server liefert neue Props), Form-State synchronisieren
  useEffect(() => {
    setData({
      host_id: selectedHostId || "",
      location_ids: assignedLocationIds || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHostId, JSON.stringify(assignedLocationIds)]);

  const assignedSet = useMemo(() => new Set(data.location_ids.map((x) => Number(x))), [data.location_ids]);

  function changeHost(e) {
    const hostId = e.target.value;
    router.get(
      route("admin.locations.assign"),
      { host_id: hostId },
      { preserveScroll: true, replace: true }
    );
  }

  function toggleLocation(id) {
    id = Number(id);
    const next = new Set(assignedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setData("location_ids", Array.from(next));
  }

  function submit(e) {
    e.preventDefault();
    post(route("admin.locations.assign.update"), {
      preserveScroll: true,
    });
  }

  return (
    <AppShell
      title="Locations freigeben"
      subtitle="Admin: Weise Locations ausschließlich Hosts zu."
      actions={
        <>
          <Link href="/admin/dashboard" className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
            Admin Dashboard
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
              Host auswählen
            </label>

            <select
              className="form-select w-full"
              value={data.host_id || ""}
              onChange={changeHost}
              disabled={hosts.length === 0}
            >
              {hosts.length === 0 ? (
                <option value="">Keine Hosts vorhanden</option>
              ) : (
                hosts.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.email})
                  </option>
                ))
              )}
            </select>

            {errors.host_id && <div className="mt-1 text-sm text-rose-600">{errors.host_id}</div>}
          </div>

          <div className="text-sm text-gray-600">
            Freigeschaltet:{" "}
            <span className="font-semibold text-gray-900">{data.location_ids.length}</span> / {locations.length}
          </div>
        </div>

        <div className="soft-divider my-5" />

        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {locations.map((loc) => {
              const checked = assignedSet.has(Number(loc.id));
              return (
                <label
                  key={loc.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    checked ? "border-brand-200/60 bg-brand-50/40" : "border-gray-200/60 hover:bg-gray-50/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 form-checkbox"
                    checked={checked}
                    onChange={() => toggleLocation(loc.id)}
                  />

                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{loc.name}</div>
                    {loc.description ? (
                      <div className="mt-1 text-sm text-gray-600">{loc.description}</div>
                    ) : (
                      <div className="mt-1 text-sm text-gray-400">— keine Beschreibung —</div>
                    )}
                  </div>

                  <span className={`soft-badge ${checked ? "soft-badge-info" : "soft-badge-neutral"}`}>
                    {checked ? "sichtbar" : "gesperrt"}
                  </span>
                </label>
              );
            })}
          </div>

          {errors.location_ids && <div className="mt-2 text-sm text-rose-600">{errors.location_ids}</div>}

          <div className="mt-5 flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={processing || !selectedHostId}
            >
              Speichern
            </button>

            <button
              type="button"
              className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
              onClick={() => setData("location_ids", [])}
              disabled={processing || !selectedHostId}
            >
              Alles entziehen
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}