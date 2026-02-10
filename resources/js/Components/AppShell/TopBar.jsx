// resources/js/Components/AppShell/TopBar.jsx

import React from "react";

export default function TopBar({ title, role, userName, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="mx-auto max-w-7xl">
      <div className="soft-glass px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="btn bg-white text-gray-700 hover:text-gray-900 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              ☰
            </button>

            <div className="leading-tight">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400">
                DBOOKING
              </div>
              <div className="text-sm font-semibold text-gray-900">{title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-xs">
              {role}
            </span>

            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm font-semibold text-gray-700">
                {userName}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-extrabold text-white shadow-md">
                {(userName?.[0] ?? "G").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}