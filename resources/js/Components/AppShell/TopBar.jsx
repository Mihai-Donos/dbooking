// resources/js/Components/AppShell/TopBar.jsx
import React from "react";
import UserMenu from "@/Components/AppShell/UserMenu";
import { PanelLeft } from "lucide-react";

export default function TopBar({
  title,
  user,        // neu
  role,        // fallback alt
  userName,    // fallback alt
  sidebarOpen,
  setSidebarOpen,
}) {
  const effectiveRole = user?.role ?? role ?? "user";
  const effectiveName = user?.name ?? userName ?? "Guest";

  return (
    <header className="soft-surface px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen?.(!sidebarOpen)}
            className="lg:hidden inline-grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Menü öffnen"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-wide text-slate-400">
              buchdeinzimmer.com
            </div>
            <div className="truncate text-base font-extrabold text-slate-900">
              {}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
            {effectiveRole}
          </span>

          <span className="hidden sm:block text-sm font-extrabold text-slate-900">
            {effectiveName}
          </span>

          {/* Avatar + Dropdown */}
          <UserMenu user={user ?? { name: effectiveName, role: effectiveRole }} />
        </div>
      </div>
    </header>
  );
}