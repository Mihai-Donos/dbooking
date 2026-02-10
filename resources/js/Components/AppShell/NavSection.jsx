// resources/js/Components/AppShell/NavSection.jsx

import React from "react";
import NavItem from "@/Components/AppShell/NavItem";

export default function NavSection({ title, items, currentPath, onNavigate }) {
  return (
    <div className="space-y-2">
      <h3 className="px-3 text-xs font-bold uppercase tracking-wide text-gray-400">
        {title}
      </h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <NavItem item={item} currentPath={currentPath} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}