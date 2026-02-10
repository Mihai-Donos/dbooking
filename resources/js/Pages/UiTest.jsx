// resources/js/Pages/UiTest.jsx

import React, { useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

import SoftCard from "@/Components/UI/SoftCard";
import SoftBadge from "@/Components/UI/SoftBadge";
import SoftStat from "@/Components/UI/SoftStat";
import SoftTable from "@/Components/UI/SoftTable";

export default function UiTest() {
  const { auth } = usePage().props;
  const role = auth?.user?.role ?? "user";

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () => [
      { id: 1, label: "Buchung #A-1024", meta: "2 Gäste · Room 12", date: "2026-02-15", location: "Berlin Mitte", status: "Confirmed" },
      { id: 2, label: "Buchung #A-1025", meta: "1 Gast · Room 03", date: "2026-03-01", location: "Hamburg", status: "Pending" },
      { id: 3, label: "Buchung #A-1026", meta: "3 Gäste · Room 07", date: "2026-03-10", location: "München", status: "Canceled" },
    ],
    []
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !query ||
        r.label.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.meta.toLowerCase().includes(query);

      const matchStatus = status === "all" || r.status.toLowerCase() === status;
      return matchQ && matchStatus;
    });
  }, [rows, q, status]);

  const columns = useMemo(
    () => [
      {
        key: "label",
        header: "Label",
        render: (r) => (
          <div>
            <div className="font-semibold text-gray-900">{r.label}</div>
            <div className="text-xs text-gray-500">{r.meta}</div>
          </div>
        ),
      },
      { key: "date", header: "Datum" },
      { key: "location", header: "Location" },
      {
        key: "status",
        header: "Status",
        render: (r) => {
          const v =
            r.status === "Confirmed" ? "success" :
            r.status === "Pending" ? "warn" :
            "danger";
          return <SoftBadge variant={v}>{r.status}</SoftBadge>;
        },
      },
      {
        key: "action",
        header: "",
        thClassName: "text-right",
        tdClassName: "text-right",
        render: () => (
          <button className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
            Details
          </button>
        ),
      },
    ],
    []
  );

  return (
    <AppShell
      title="UI Test"
      subtitle={`BLUE1 Komponenten · Role: ${role}`}
      actions={
        <>
          <Link href="/dashboard" className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
            Zurück
          </Link>
          <Link href="/bookings" className="btn btn-primary">
            Bookings
          </Link>
        </>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SoftStat label="Bookings (30 Tage)" value="128" badge={{ variant: "info", text: "INFO" }} delta="+12.4%" />
        <SoftStat label="Auslastung" value="74%" badge={{ variant: "success", text: "OK" }} delta="+3.1%" />
        <SoftStat label="Pending" value="9" badge={{ variant: "warn", text: "OPEN" }} delta="stabil" />
        <SoftStat label="Stornos" value="3" badge={{ variant: "danger", text: "RISK" }} delta="-1" />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="soft-alert soft-alert-info">
          <div className="font-bold">Info</div>
          <div className="mt-1 text-sm opacity-80">Soft-UI wirkt am besten mit “floating surfaces” und wenig harten Borders.</div>
        </div>
        <div className="soft-alert soft-alert-success">
          <div className="font-bold">Erfolg</div>
          <div className="mt-1 text-sm opacity-80">Sidebar + Brand sind stabil – jetzt ziehen wir den Rest der Komponenten nach.</div>
        </div>
      </div>

      {/* Table */}
      <SoftCard
        title="Bookings"
        subtitle="Table + Filter im Soft-UI Stil."
        actions={
          <>
            <button className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">Export</button>
            <button className="btn btn-primary">Neu</button>
          </>
        }
      >
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Suche
            </label>
            <input
              className="form-input w-full"
              placeholder="Label, Location, Meta…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">
              Status
            </label>
            <select className="form-select w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Alle</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70 w-full"
              onClick={() => {
                setQ("");
                setStatus("all");
              }}
            >
              Reset
            </button>
            <button className="btn btn-primary w-full">Apply</button>
          </div>
        </div>

        <SoftTable columns={columns} rows={filtered} />
      </SoftCard>

      {/* Form */}
      <SoftCard title="Form" subtitle="Input/Select/Textarea im Soft-UI Stil.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">Label</label>
            <input className="form-input w-full" placeholder="z.B. Buchung #A-1234" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">Location</label>
            <select className="form-select w-full">
              <option>Berlin Mitte</option>
              <option>Hamburg</option>
              <option>München</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-400">Beschreibung</label>
            <textarea className="form-textarea w-full" rows={3} placeholder="Optional…" />
            <p className="mt-1 text-xs text-gray-500">Helper text / Validation Hinweis.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" className="form-checkbox" defaultChecked />
            Rechnungsfähig
          </label>

          <div className="flex gap-2">
            <button className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">Abbrechen</button>
            <button className="btn btn-primary">Speichern</button>
          </div>
        </div>
      </SoftCard>
    </AppShell>
  );
}