import React from "react";
import AppShell from "@/Layouts/AppShell";

export default function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="space-y-3">
        <p className="text-sm text-zinc-700">
          Dashboard Platzhalter. Hier kommen später KPIs/Widgets rein.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card title="Bookings" value="—" />
          <Card title="Revenue" value="—" />
          <Card title="Open Tasks" value="—" />
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}