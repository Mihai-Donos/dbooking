// resources/js/Pages/Dashboard.jsx

import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

import SoftCard from "@/Components/UI/SoftCard";
import SoftBadge from "@/Components/UI/SoftBadge";
import SoftStat from "@/Components/UI/SoftStat";
import SoftTable from "@/Components/UI/SoftTable";

export default function Dashboard() {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;
  const role = user?.role ?? "user";

  const kpis = useMemo(() => {
    if (role === "host") {
      return [
        { label: "Events (30 Tage)", value: "18", badge: { variant: "info", text: "INFO" }, delta: "+2" },
        { label: "Auslastung", value: "74%", badge: { variant: "success", text: "OK" }, delta: "+3.1%" },
        { label: "Anfragen", value: "6", badge: { variant: "warn", text: "OPEN" }, delta: "stabil" },
        { label: "Stornos", value: "2", badge: { variant: "danger", text: "RISK" }, delta: "-1" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "Neue Requests", value: "7", badge: { variant: "warn", text: "OPEN" }, delta: "+3" },
        { label: "Locations", value: "42", badge: { variant: "info", text: "INFO" }, delta: "+1" },
        { label: "Zuweisungen", value: "11", badge: { variant: "success", text: "OK" }, delta: "+4" },
        { label: "Incidents", value: "1", badge: { variant: "danger", text: "RISK" }, delta: "stabil" },
      ];
    }

    // user
    return [
      { label: "Bookings (30 Tage)", value: "128", badge: { variant: "info", text: "INFO" }, delta: "+12.4%" },
      { label: "Auslastung", value: "74%", badge: { variant: "success", text: "OK" }, delta: "+3.1%" },
      { label: "Pending", value: "9", badge: { variant: "warn", text: "OPEN" }, delta: "stabil" },
      { label: "Stornos", value: "3", badge: { variant: "danger", text: "RISK" }, delta: "-1" },
    ];
  }, [role]);

  const recentRows = useMemo(() => {
    if (role === "host") {
      return [
        { id: 1, label: "Event #E-204", meta: "Workshop · 22 Plätze", date: "2026-02-14", location: "Berlin Mitte", status: "Confirmed" },
        { id: 2, label: "Event #E-205", meta: "Meetup · 40 Plätze", date: "2026-02-20", location: "Hamburg", status: "Pending" },
        { id: 3, label: "Event #E-206", meta: "Seminar · 18 Plätze", date: "2026-02-28", location: "München", status: "Confirmed" },
      ];
    }

    if (role === "admin") {
      return [
        { id: 1, label: "Request #R-88", meta: "Location Approval", date: "2026-02-10", location: "Berlin", status: "Pending" },
        { id: 2, label: "Assign #A-19", meta: "Host → Location", date: "2026-02-10", location: "Hamburg", status: "Confirmed" },
        { id: 3, label: "Report #P-04", meta: "Monthly Export", date: "2026-02-09", location: "System", status: "Confirmed" },
      ];
    }

    // user
    return [
      { id: 1, label: "Buchung #A-1024", meta: "2 Gäste · Room 12", date: "2026-02-15", location: "Berlin Mitte", status: "Confirmed" },
      { id: 2, label: "Buchung #A-1025", meta: "1 Gast · Room 03", date: "2026-03-01", location: "Hamburg", status: "Pending" },
      { id: 3, label: "Buchung #A-1026", meta: "3 Gäste · Room 07", date: "2026-03-10", location: "München", status: "Canceled" },
    ];
  }, [role]);

  const recentColumns = useMemo(
    () => [
      {
        key: "label",
        header: role === "host" ? "Event" : role === "admin" ? "Item" : "Buchung",
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
    [role]
  );

  const actions = useMemo(() => {
    if (role === "host") {
      return (
        <>
          <Link href="/host/events/create" className="btn btn-primary">
            Neues Event
          </Link>
          <Link href="/host/events" className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
            Events
          </Link>
        </>
      );
    }

    if (role === "admin") {
      return (
        <>
          <Link href="/admin/locations/add" className="btn btn-primary">
            Location hinzufügen
          </Link>
          <Link href="/admin/reporting" className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
            Reporting
          </Link>
        </>
      );
    }

    return (
      <>
        <Link href="/bookings" className="btn btn-primary">
          Bookings
        </Link>
        <Link href="/ui-test" className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70">
          UI Test
        </Link>
      </>
    );
  }, [role]);

  const quick = useMemo(() => {
    if (role === "host") {
      return [
        { label: "Events verwalten", href: "/host/events", tone: "secondary" },
        { label: "Location anfragen", href: "/host/locations/request", tone: "secondary" },
        { label: "Invoicing", href: "/host/invoicing", tone: "secondary" },
        { label: "Neues Event", href: "/host/events/create", tone: "primary" },
      ];
    }

    if (role === "admin") {
      return [
        { label: "Locations hinzufügen", href: "/admin/locations/add", tone: "primary" },
        { label: "Locations zuweisen", href: "/admin/locations/assign", tone: "secondary" },
        { label: "Reporting", href: "/admin/reporting", tone: "secondary" },
      ];
    }

    return [
      { label: "Übersicht", href: "/bookings", tone: "primary" },
      { label: "Neue Buchung", href: "/bookings/new", tone: "secondary" },
      { label: "Archiv", href: "/bookings/archive", tone: "secondary" },
      { label: "FAQ", href: "/faq", tone: "secondary" },
    ];
  }, [role]);

  return (
    <AppShell
      title="Dashboard"
      subtitle={`DBLUE1_v01 · Role: ${role}`}
      actions={actions}
    >
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <SoftStat key={k.label} label={k.label} value={k.value} badge={k.badge} delta={k.delta} />
        ))}
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent */}
        <div className="lg:col-span-2">
          <SoftCard
            title={role === "host" ? "Letzte Events" : role === "admin" ? "Letzte Aktivitäten" : "Letzte Bookings"}
            subtitle="Schneller Überblick, ohne harte Borders."
            actions={
              <Link
                href={role === "host" ? "/host/events" : role === "admin" ? "/admin/reporting" : "/bookings"}
                className="btn btn-secondary border border-gray-200/60 hover:border-gray-300/70"
              >
                Alle ansehen
              </Link>
            }
          >
            <SoftTable columns={recentColumns} rows={recentRows} />
          </SoftCard>
        </div>

        {/* Quick actions */}
        <SoftCard
          title="Quick Actions"
          subtitle="Typische Aktionen für deinen Bereich."
        >
          <div className="space-y-2">
            {quick.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className={
                  q.tone === "primary"
                    ? "btn btn-primary w-full justify-center"
                    : "btn btn-secondary w-full justify-center border border-gray-200/60 hover:border-gray-300/70"
                }
              >
                {q.label}
              </Link>
            ))}
          </div>

          <div className="my-5 soft-divider" />

          {/* Status / Hint */}
          <div className="space-y-3">
            <div className="soft-alert soft-alert-info">
              <div className="font-bold">Hinweis</div>
              <div className="mt-1 text-sm opacity-80">
                DBLUE1_v01 setzt auf “floating surfaces” + dezente Typografie (Soft UI).
              </div>
            </div>

            <div className="soft-alert soft-alert-success">
              <div className="font-bold">Status</div>
              <div className="mt-1 text-sm opacity-80">
                Navigation & Cards sind konsistent – als nächstes ziehen wir Listen-Seiten nach.
              </div>
            </div>
          </div>
        </SoftCard>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SoftCard title="Aktivität" subtitle="Mini Feed (Platzhalter).">
          <div className="space-y-3">
            {[
              { t: "Heute", d: "UI Baseline DBLUE1_v01 bestätigt.", v: "success" },
              { t: "Gestern", d: "Sidebar / NavItem auf BLUE1 angepasst.", v: "info" },
              { t: "Letzte Woche", d: "Routing-Gerüst & AppShell stabilisiert.", v: "neutral" },
            ].map((it, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <SoftBadge variant={it.v === "success" ? "success" : it.v === "info" ? "info" : "neutral"}>
                  {it.t}
                </SoftBadge>
                <div className="text-sm text-gray-700">{it.d}</div>
              </div>
            ))}
          </div>
        </SoftCard>

        <SoftCard title="Nächste Schritte" subtitle="Struktur für spätere Features.">
          <div className="space-y-3 text-sm text-gray-700">
            <div className="soft-surface p-4">
              <div className="font-semibold text-gray-900">1) Bookings Liste</div>
              <div className="mt-1 text-gray-600">Filterbar + Table + Empty State (DBLUE1_v01).</div>
            </div>
            <div className="soft-surface p-4">
              <div className="font-semibold text-gray-900">2) Details Page</div>
              <div className="mt-1 text-gray-600">Header + Tabs + Action Bar (soft, clean).</div>
            </div>
          </div>
        </SoftCard>
      </div>
    </AppShell>
  );
}