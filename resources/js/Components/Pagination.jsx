import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({ links = [] }) {
  if (!links || links.length <= 3) return null;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {links.map((l, idx) => {
        const label = (l.label || "")
          .replace("&laquo;", "«")
          .replace("&raquo;", "»")
          .replace(/<\/?[^>]+(>|$)/g, "");

        const base =
          "rounded-xl border px-3 py-2 text-sm transition shadow-sm";
        const active = l.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
        const disabled = !l.url ? "opacity-40 cursor-not-allowed" : "";

        if (!l.url) {
          return (
            <span key={idx} className={`${base} ${active} ${disabled}`}>
              {label}
            </span>
          );
        }

        return (
          <Link
            key={idx}
            href={l.url}
            preserveScroll
            className={`${base} ${active}`}
            dangerouslySetInnerHTML={{ __html: label }}
          />
        );
      })}
    </nav>
  );
}