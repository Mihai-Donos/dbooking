import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

export default function Edit({ offer, typeOptions = {}, chargeTypeOptions = {} }) {
  const { flash } = usePage().props;

  const { data, setData, put, processing, errors } = useForm({
    name: offer?.name ?? "",
    description: offer?.description ?? "",
    type: offer?.type ?? null,          // optional
    charge_type: offer?.charge_type ?? 1, // required (Default: PER_BOOKING)
  });

  const submit = (e) => {
    e.preventDefault();
    put(route("admin.offers.update", offer.id));
  };

  return (
    <AppShell
      title="Offer bearbeiten"
      subtitle={`Admin: #${offer.id}`}
      actions={
        <Link
          href={route("admin.offers.index")}
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

      <form onSubmit={submit} className="soft-surface p-5 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
            Name *
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
          <textarea
            className="form-input w-full min-h-[110px]"
            value={data.description}
            onChange={(e) => setData("description", e.target.value)}
          />
          {errors.description && (
            <div className="mt-1 text-sm text-rose-600">{errors.description}</div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* TYPE */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Type (optional)
            </label>
            <select
              className="form-input w-full"
              value={data.type ?? ""}
              onChange={(e) =>
                setData("type", e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <option value="">— auswählen —</option>
              {Object.entries(typeOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.type && <div className="mt-1 text-sm text-rose-600">{errors.type}</div>}
          </div>

          {/* CHARGE TYPE */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Charge Type *
            </label>
            <select
              className="form-input w-full"
              value={data.charge_type}
              onChange={(e) => setData("charge_type", Number(e.target.value))}
            >
              {Object.entries(chargeTypeOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.charge_type && (
              <div className="mt-1 text-sm text-rose-600">{errors.charge_type}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button disabled={processing} className="btn btn-primary">
            Speichern
          </button>
          <Link
            href={route("admin.offers.index")}
            className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </AppShell>
  );
}