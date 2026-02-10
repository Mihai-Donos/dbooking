// resources/js/Components/AppShell/NavItem.jsx

import React from "react";
import { Link } from "@inertiajs/react";

/* Minimal icon set (du kannst jederzeit erweitern) */
const Icons = {
  dashboard: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
      <path d="M8 0a8 8 0 1 1-8 8 8 8 0 0 1 8-8Zm0 2a6 6 0 1 0 6 6 6 6 0 0 0-6-6Z" />
    </svg>
  ),
  calendar: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M5 0h2v2H5V0Zm4 0h2v2H9V0Z" />
      <path d="M2 2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 4v8h12V6H2Z" />
    </svg>
  ),
  plus: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M7 1h2v6h6v2H9v6H7V9H1V7h6V1Z" />
    </svg>
  ),
  archive: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2H1V2Zm1 3h12v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm4 2v2h4V7H6Z" />
    </svg>
  ),
  help: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0Zm0 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
      <path d="M7.25 11.5h1.5V13h-1.5v-1.5ZM8 3.5c1.38 0 2.5.95 2.5 2.25 0 1.57-1.5 1.9-1.9 2.4-.18.22-.23.43-.23.85v.25h-1.5v-.35c0-.7.14-1.12.44-1.49.56-.7 1.69-.95 1.69-1.66 0-.48-.44-.85-1-.85-.6 0-1.03.34-1.14.94l-1.47-.3C5.6 4.25 6.65 3.5 8 3.5Z" />
    </svg>
  ),
  spark: (props) => (
    <svg viewBox="0 0 16 16" {...props}>
      <path d="M8 0 9.5 6.5 16 8l-6.5 1.5L8 16 6.5 9.5 0 8l6.5-1.5L8 0Z" />
    </svg>
  ),
};

function isActive(currentPath, item) {
  const href = item.href;
  const match = item.match ?? "exact";
  if (match === "prefix") return currentPath === href || currentPath.startsWith(href + "/");
  return currentPath === href;
}

export default function NavItem({ item, currentPath, onNavigate }) {
  const active = isActive(currentPath, item);
  const Icon = Icons[item.icon] ?? Icons.dashboard;

  // Etwas kompakter wie im Original
  const base = "group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition";
  const stateActive = "bg-white text-gray-900 shadow-[0_12px_30px_rgba(0,0,0,0.08)]";
  const stateInactive =
    "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]";
  const stateDisabled = "text-gray-300 cursor-not-allowed";

  /**
   * 🔧 Hier ist der Kern-Fix:
   * - Kachel kleiner (h-10 w-10)
   * - weniger “puffy”: rounded-xl statt rounded-2xl
   * - Icon selbst bleibt gut sichtbar (h-5 w-5)
   */
  const iconWrap =
    "shrink-0 grid h-10 w-10 place-items-center rounded-xl bg-white border border-white/70 shadow-xs";
  const iconWrapActive =
    "bg-gradient-to-br from-brand-500 to-brand-600 border-transparent shadow-md";

  const iconClass =
    "h-5 w-5 fill-current " + (active ? "text-white" : "text-gray-500 group-hover:text-gray-700");

  const labelClass = "truncate text-[15px] font-semibold";

  const badge = item.badge ? (
    <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
      {item.badge}
    </span>
  ) : null;

  if (item.disabled) {
    return (
      <div className={`${base} ${stateDisabled}`}>
        <span className={iconWrap}>
          <Icon className="h-5 w-5 fill-current text-gray-300" />
        </span>
        <span className={labelClass}>{item.label}</span>
        {badge}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`${base} ${active ? stateActive : stateInactive}`}
    >
      <span className={`${iconWrap} ${active ? iconWrapActive : ""}`}>
        <Icon className={iconClass} />
      </span>
      <span className={labelClass}>{item.label}</span>
      {badge}
    </Link>
  );
}