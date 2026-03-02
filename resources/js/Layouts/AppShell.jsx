// resources/js/Layouts/AppShell.jsx
import React, { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import * as navItems from "@/nav/navItems";

import SideBar from "@/Components/AppShell/SideBar";
import TopBar from "@/Components/AppShell/TopBar";

export default function AppShell({
  title,
  subtitle,
  actions,
  headerRight,
  headerBottom,
  children,
}) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;
  const role = user?.role ?? "user";

  const nav = useMemo(() => {
    try {
      const getNav = navItems.getNavItems ?? navItems.default;
      const result = typeof getNav === "function" ? getNav(role) : [];
      return Array.isArray(result) ? result : [];
    } catch (e) {
      console.error("Nav build failed:", e);
      return [];
    }
  }, [role]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const headerHasBottom = Boolean(headerBottom);

  return (
    <div className="soft-app-bg flex h-[100dvh] overflow-hidden text-gray-800">
      <SideBar
        nav={nav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="px-4 pt-4 lg:px-6 lg:pt-4">
          <div className="mx-auto w-full max-w-7xl space-y-4 pb-6">
            <TopBar
              title={title ?? "Page"}
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />

            <main className="space-y-4">
              {/* Header Card */}
              <section
                className={[
                  "soft-surface p-5 sm:p-6",
                  headerHasBottom ? "rounded-b-none" : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Links */}
                  <div className="min-w-0">
                    <h1 className="soft-title">{title ?? "Page"}</h1>
                    <p className="mt-1 soft-subtitle">
                      {subtitle ?? "BLUE1"}
                    </p>
                  </div>

                  {/* Rechts */}
                  {(headerRight || actions) ? (
                    <div className="shrink-0 flex flex-wrap items-center justify-end gap-2">
                      {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
                      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Header Bottom (ausklappbarer Bereich) */}
              {headerBottom ? (
                <section className="soft-muted px-5 py-4 sm:px-6 rounded-t-none -mt-4">
                  {headerBottom}
                </section>
              ) : null}

              {/* Page Content */}
              <div className="space-y-4">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}