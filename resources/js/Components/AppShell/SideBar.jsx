// resources/js/Components/AppShell/SideBar.jsx
import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import NavItem from "@/Components/AppShell/NavItem";

function sectionTitle(label, role) {
  const raw = String(label ?? "");
  const key = raw.trim().toLowerCase();

  // Deine Wunschlogik: Section die "Admin" heißt -> ADMIN oder HOST je nach Rolle
  if (key === "admin" || key === "host") {
    return role === "host" ? "HOST" : "ADMIN";
  }

  return raw.toUpperCase();
}

export default function SideBar({ nav = [], sidebarOpen, setSidebarOpen, onNavigate }) {
  const { url, props } = usePage();
  const currentPath = useMemo(() => String(url ?? "/").split("?")[0], [url]);

  const role = props?.auth?.user?.role ?? "user";

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={[
          "fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 shrink-0",
          "bg-white/70 backdrop-blur-xl",
          "border-r border-white/40",
          "shadow-[0_18px_40px_rgba(15,23,42,0.08)]",
          "transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
          // wichtig: Layout + keine sichtbaren Scrollbars an der Sidebar selbst
          "h-[100dvh] flex flex-col overflow-hidden",
        ].join(" ")}
      >
        {/* Header / Brand */}
        <div className="p-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500 text-white font-extrabold shadow">
              D
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">BuchDeinZimmer.com</div>
              <div className="truncate text-xs font-semibold text-slate-500">Jetzt dabei sein!</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          className={[
            // nimmt den Rest der Höhe ein
            "flex-1 min-h-0",
            // scrollbar unsichtbar, aber scrollen bleibt möglich
            "overflow-y-auto overflow-x-hidden",
            "px-4 pb-6",
            "[-ms-overflow-style:none]",
            "[scrollbar-width:none]",
            "[&::-webkit-scrollbar]:w-0",
            "[&::-webkit-scrollbar]:h-0",
            // (optional) verhindert iOS overscroll glow / bouncing
            "overscroll-contain",
          ].join(" ")}
        >
          {nav.map((sec, idx) => (
            <div key={`${sec.section ?? "sec"}-${idx}`} className="pt-2">
              {/* ✅ Soft Divider zwischen Sektionen (nicht vor der ersten) */}
              {idx > 0 ? <div className="my-5 h-px bg-slate-200/70" /> : null}

              <div className="px-2 pb-2 text-xs font-extrabold tracking-widest text-slate-400">
                {sectionTitle(sec.section, role)}
              </div>

              <div className="space-y-2">
                {(sec.items ?? []).map((item) => (
                  <NavItem
                    key={item.href?.toString() ?? item.label}
                    item={item}
                    currentPath={currentPath}
                    onNavigate={() => {
                      onNavigate?.();
                      setSidebarOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}