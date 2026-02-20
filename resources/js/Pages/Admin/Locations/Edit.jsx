import React, { useMemo, useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

export default function Edit({ location, rooms = [] }) {
  const { flash } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    name: location?.name ?? "",
    description: location?.description ?? "",
    rooms: rooms.map((r) => ({
      id: r.id,
      number: r.number ?? "",
      capacity: r.capacity ?? 1,
      description: r.description ?? "",
    })),
    deleted_room_ids: [],
  });

  const [q, setQ] = useState("");

  function setRoom(index, key, value) {
    const next = [...data.rooms];
    next[index] = { ...next[index], [key]: value };
    setData("rooms", next);
  }

  function addRoom() {
    setData("rooms", [
      ...data.rooms,
      { id: null, number: "", capacity: 1, description: "" },
    ]);
  }

  function removeRoom(index) {
    const r = data.rooms[index];
    const next = [...data.rooms];
    next.splice(index, 1);

    // wenn es ein bestehendes Zimmer ist -> zur Löschliste
    if (r?.id) {
      setData("deleted_room_ids", [...data.deleted_room_ids, r.id]);
    }

    setData("rooms", next.length ? next : []);
  }

  function undoDeleteLast() {
    const next = [...data.deleted_room_ids];
    next.pop();
    setData("deleted_room_ids", next);
  }

  function submit(e) {
    e.preventDefault();
    put(route("admin.locations.update", location.id), {
      preserveScroll: true,
    });
  }

  const filteredRooms = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return data.rooms;

    return data.rooms.filter((r) => {
      const num = String(r.number ?? "").toLowerCase();
      const desc = String(r.description ?? "").toLowerCase();
      return num.includes(query) || desc.includes(query);
    });
  }, [data.rooms, q]);

  return (
    <AppShell
      title="Location bearbeiten"
      subtitle="Admin: Zimmer nachträglich ändern, hinzufügen oder löschen."
      actions={
        <>
          <Link
            href={route("admin.locations.index")}
            className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
          >
            Zurück
          </Link>
          <Link
            href={route("admin.locations.create")}
            className="btn btn-primary"
          >
            + Neue Location
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

      <form onSubmit={submit} className="space-y-4">
        {/* Location */}
        <div className="soft-surface p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Name
              </label>
              <input
                className="form-input w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
              />
              {errors.name && <div className="mt-1 text-sm text-rose-600">{errors.name}</div>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Beschreibung
              </label>
              <input
                className="form-input w-full"
                value={data.description ?? ""}
                onChange={(e) => setData("description", e.target.value)}
                placeholder="optional…"
              />
              {errors.description && <div className="mt-1 text-sm text-rose-600">{errors.description}</div>}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Zimmer aktuell:{" "}
              <span className="font-semibold text-gray-900">{data.rooms.length}</span>
              {data.deleted_room_ids.length > 0 && (
                <>
                  {" "}
                  · Löschen vorgemerkt:{" "}
                  <span className="font-semibold text-gray-900">{data.deleted_room_ids.length}</span>
                </>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
              onClick={addRoom}
            >
              + Zimmer hinzufügen
            </button>
          </div>
        </div>

        {/* Rooms */}
        <div className="soft-surface p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-md">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Zimmer suchen
              </label>
              <input
                className="form-input w-full"
                placeholder="Nummer oder Beschreibung…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {data.deleted_room_ids.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
                onClick={undoDeleteLast}
                title="Letzte Löschung rückgängig"
              >
                Undo (1)
              </button>
            )}
          </div>

          <div className="soft-divider my-5" />

          {errors.rooms && <div className="mb-3 text-sm text-rose-600">{errors.rooms}</div>}
          {errors.deleted_room_ids && (
            <div className="mb-3 text-sm text-rose-600">{errors.deleted_room_ids}</div>
          )}

          {filteredRooms.length === 0 ? (
            <div className="text-sm text-gray-600">Keine Zimmer.</div>
          ) : (
            <div className="space-y-3">
              {filteredRooms.map((r, idx) => (
                <div
                  key={r.id ?? `new-${idx}`}
                  className="rounded-3xl border border-gray-200/60 bg-white p-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-start">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Nummer
                      </label>
                      <input
                        type="number"
                        className="form-input w-full"
                        value={r.number}
                        onChange={(e) => setRoom(idx, "number", e.target.value)}
                        min={1}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Kapazität
                      </label>
                      <input
                        type="number"
                        className="form-input w-full"
                        value={r.capacity}
                        onChange={(e) => setRoom(idx, "capacity", e.target.value)}
                        min={1}
                      />
                    </div>

                    <div className="md:col-span-7">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Beschreibung
                      </label>
                      <input
                        className="form-input w-full"
                        value={r.description ?? ""}
                        onChange={(e) => setRoom(idx, "description", e.target.value)}
                        placeholder="optional…"
                      />
                    </div>

                    <div className="md:col-span-1 md:flex md:justify-end">
                      <button
                        type="button"
                        className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
                        onClick={() => removeRoom(idx)}
                        title="Zimmer entfernen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {errors[`rooms.${idx}.number`] && (
                    <div className="mt-2 text-sm text-rose-600">{errors[`rooms.${idx}.number`]}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={processing}>
              Speichern
            </button>

            <Link
              href={route("admin.locations.index")}
              className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
            >
              Abbrechen
            </Link>
          </div>
        </div>
      </form>
    </AppShell>
  );
}