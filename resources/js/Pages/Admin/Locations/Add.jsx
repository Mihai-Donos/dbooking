// resources/js/Pages/Admin/Locations/Add.jsx

import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

export default function Add() {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    name: "",
    description: "",
    rooms: [
      { number: "", capacity: 1, description: "" }, // Start-Zeile
    ],
  });

  function setRoom(index, key, value) {
    const next = [...data.rooms];
    next[index] = { ...next[index], [key]: value };
    setData("rooms", next);
  }

  function addRoom() {
    setData("rooms", [...data.rooms, { number: "", capacity: 1, description: "" }]);
  }

  function removeRoom(index) {
    const next = [...data.rooms];
    next.splice(index, 1);
    setData("rooms", next.length ? next : [{ number: "", capacity: 1, description: "" }]);
  }

  function submit(e) {
    e.preventDefault();
    post(route("admin.locations.store"), { preserveScroll: true });
  }

  return (
    <AppShell
      title="Location anlegen"
      subtitle="Admin: Erstelle eine Location (Hotel) und füge Zimmer hinzu."
      actions={
        <Link
          href={route("admin.locations.index")}
          className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
        >
          Zurück
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
        <form onSubmit={submit} className="space-y-6">
          {/* Location Basics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Name
              </label>
              <input
                className="form-input w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                placeholder="z.B. Hotel Berlin Mitte"
              />
              {errors.name && <div className="mt-1 text-sm text-rose-600">{errors.name}</div>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                Beschreibung (optional)
              </label>
              <input
                className="form-input w-full"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                placeholder="Kurzbeschreibung…"
              />
              {errors.description && (
                <div className="mt-1 text-sm text-rose-600">{errors.description}</div>
              )}
            </div>
          </div>

          <div className="soft-divider" />

          {/* Rooms */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="soft-title">Zimmer</div>
              <div className="soft-subtitle">Zimmernummer + Kapazität, optional Beschreibung.</div>
            </div>

            <button
              type="button"
              className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
              onClick={addRoom}
            >
              Zimmer hinzufügen
            </button>
          </div>

          {errors.rooms && <div className="text-sm text-rose-600">{errors.rooms}</div>}

          <div className="space-y-3">
            {data.rooms.map((room, idx) => {
              const errNumber = errors[`rooms.${idx}.number`];
              const errCapacity = errors[`rooms.${idx}.capacity`];
              const errDesc = errors[`rooms.${idx}.description`];

              return (
                <div key={idx} className="rounded-2xl border border-gray-200/60 bg-white p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Nummer
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="form-input w-full"
                        value={room.number}
                        onChange={(e) => setRoom(idx, "number", e.target.value)}
                        placeholder="z.B. 101"
                      />
                      {errNumber && <div className="mt-1 text-sm text-rose-600">{errNumber}</div>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Kapazität
                      </label>
                      <input
                        type="number"
                        min={1}
                        className="form-input w-full"
                        value={room.capacity}
                        onChange={(e) => setRoom(idx, "capacity", e.target.value)}
                      />
                      {errCapacity && (
                        <div className="mt-1 text-sm text-rose-600">{errCapacity}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Aktionen
                      </label>
                      <button
                        type="button"
                        className="btn btn-secondary w-full border border-gray-200/60 hover:border-gray-300/70"
                        onClick={() => removeRoom(idx)}
                      >
                        Entfernen
                      </button>
                    </div>

                    <div className="md:col-span-6">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Beschreibung (optional)
                      </label>
                      <input
                        className="form-input w-full"
                        value={room.description}
                        onChange={(e) => setRoom(idx, "description", e.target.value)}
                        placeholder="z.B. Doppelbett, Balkon…"
                      />
                      {errDesc && <div className="mt-1 text-sm text-rose-600">{errDesc}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
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
        </form>
      </div>
    </AppShell>
  );
}