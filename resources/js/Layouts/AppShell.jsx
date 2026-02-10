// resources/js/Layouts/AppShell.jsx

import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { getNavItems } from "@/nav/navItems";

import SideBar from "@/Components/AppShell/SideBar";
import TopBar from "@/Components/AppShell/TopBar";

export default function AppShell({ title, subtitle, actions, children }) {
  const { auth } = usePage().props;
  const role = auth?.user?.role ?? "user";
  const nav = useMemo(() => getNavItems(role), [role]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="soft-app-bg flex h-[100dvh] overflow-hidden text-gray-800">
      <SideBar
        nav={nav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Content padding aligns with floating sidebar margins on desktop */}
        <div className="px-4 pt-4 lg:mr-4 lg:pt-4">
          <TopBar
            title={title ?? "Page"}
            role={role}
            userName={auth?.user?.name ?? "Guest"}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main className="mt-4">
            <div className="mx-auto max-w-7xl space-y-4 pb-6">
              {/* Page header (Soft UI card) */}
              <section className="soft-surface p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="soft-title">{title ?? "Page"}</h1>
                    <p className="mt-1 soft-subtitle">
                      {subtitle ?? "BLUE1 (Soft UI) Look: weich, hell, floating surfaces."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {actions}
                  </div>
                </div>
              </section>

              {/* Page content (no forced wrapper -> pages can compose cards freely) */}
              <div className="space-y-4">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}