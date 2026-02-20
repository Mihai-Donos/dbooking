// resources/js/Components/AppShell/NavSection.jsx
import React from "react";
import NavItem from "@/Components/AppShell/NavItem";

export default function NavSection({ title, items, currentPath, onNavigate }) {
  if (!items?.length) return null;

  return (
    <section className="space-y-2">
      <div className="px-1 text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
        {title}
      </div>

      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            currentPath={currentPath}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}