// resources/js/Components/AppShell/SideBar.jsx

import React, { useEffect, useRef } from "react";
import { Link, usePage } from "@inertiajs/react";
import NavSection from "@/Components/AppShell/NavSection";

export default function SideBar({
  nav,
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded, // (optional) bleibt kompatibel mit AppShell
  setSidebarExpanded, // (optional)
  onNavigate,
  variant = "default",
}) {
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const currentPath = usePage().url.split("?")[0];

  // Close on click outside (mobile)
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen) return;
      if (sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [sidebarOpen, setSidebarOpen]);

  // Close on ESC (mobile)
  useEffect(() => {
    const keyHandler = (e) => {
      if (!sidebarOpen) return;
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <div className="min-w-fit">
      {/* Backdrop (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/30 transition-opacity duration-200 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        ref={sidebar}
        className={`no-scrollbar fixed left-0 top-0 z-50 flex h-[100dvh] w-72 flex-col overflow-y-auto bg-white px-4 py-5 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-72"
        }
        rounded-r-3xl lg:rounded-3xl
        border border-white/70
        shadow-[0_20px_27px_0_rgba(0,0,0,0.06)]
        ${
          variant === "default"
            ? "lg:ml-4 lg:my-4 lg:h-[calc(100dvh-2rem)]"
            : "lg:h-[100dvh]"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          {/* Close button (mobile) */}
          <button
            ref={trigger}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={onNavigate}
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-extrabold text-white shadow-md">
              D
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-gray-900">
                DBOOKING
              </div>
              <div className="text-[11px] font-semibold text-gray-500">
                Soft UI · BLUE1
              </div>
            </div>
          </Link>

          {/* spacer on desktop */}
          <div className="hidden lg:block w-6" />
        </div>

        {/* Nav */}
        <nav className="space-y-6">
          {nav.map((section) => (
            <NavSection
              key={section.section}
              title={section.section}
              items={section.items}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Footer (optional) */}
        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Tip</div>
            <div className="mt-1 text-sm text-gray-600">
              Active-State: <span className="font-semibold">weiß + Shadow</span> (Soft-UI).
            </div>
          </div>

          {/* Optional: keep compatibility with sidebarExpanded toggle (currently unused visually)
              If you want a compact mode later, sag Bescheid — dann bauen wir das Soft-UI-compact sauber. */}
        </div>
      </aside>
    </div>
  );
}