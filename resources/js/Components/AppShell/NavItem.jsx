// resources/js/Components/AppShell/NavItem.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";

function pathMatches(currentPath, matchList, opts = {}) {
  const { exact = false } = opts;
  const matches = (matchList?.length ? matchList : []).filter(Boolean);

  if (exact) return matches.some((m) => currentPath === m);
  return matches.some((m) => currentPath === m || currentPath.startsWith(m + "/"));
}

export default function NavItem({ item, currentPath, onNavigate }) {
  const Icon = item.icon;
  const href = typeof item.href === "function" ? item.href() : item.href;

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const childActive = useMemo(() => {
    if (!hasChildren) return false;

    return item.children.some((c) => {
      const cHref = typeof c.href === "function" ? c.href() : c.href;
      return pathMatches(currentPath, c.match || [cHref], { exact: !!c.exact });
    });
  }, [hasChildren, item.children, currentPath]);

  const selfActive = pathMatches(currentPath, item.match || [href], {
    exact: !!item.exact,
  });
  const isActive = selfActive || childActive;

  const [open, setOpen] = useState(() => (hasChildren ? isActive : false));

  useEffect(() => {
    if (hasChildren && isActive) setOpen(true);
  }, [hasChildren, isActive]);

  const rowClass = [
    "group w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition",
    isActive
      ? "bg-white shadow-[0_10px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5 text-gray-900"
      : "text-gray-700 hover:bg-gray-50",
  ].join(" ");

  const iconWrapClass = [
    "grid h-9 w-9 place-items-center rounded-2xl transition shrink-0",
    isActive
      ? "bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md"
      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
  ].join(" ");

  // Child-Links (Subnavigation), gap-5 beibehalten
  const childLinkClass = (active) =>
    [
      "flex items-center gap-5 rounded-xl px-3 py-2 text-sm font-semibold transition",
      active ? "bg-sky-50 text-slate-900" : "text-slate-400 hover:bg-slate-50",
    ].join(" ");

  // Kleines Badge-Fragment (Soon / Fake)
  const renderBadge = (badge) => {
    if (!badge) return null;

    if (badge === "Soon") {
      return (
        <span className="ml-auto rounded-full bg-slate-50 border px-2 py-0.5 text-[10px] font-semibold lowercase tracking-wide text-slate-600">
          Soon
        </span>
      );
    }

    if (badge === "Fake") {
      return (
        <span className="ml-auto rounded-full bg-slate-50 border px-2 py-0.5 text-[10px] font-semibold lowercase tracking-wide text-slate-600">
          Fake
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-1">
      {/* Parent row */}
      {hasChildren ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={[rowClass, "justify-between"].join(" ")}
          aria-expanded={open}
          aria-label={`${item.label} Untermenü umschalten`}
        >
          <span className="flex min-w-0 items-center gap-3">
            {Icon ? (
              <span className={iconWrapClass}>
                <Icon className="h-4 w-4" />
              </span>
            ) : null}

            {/* Label + Badge (Top-Level mit Children) */}
            <div className="flex items-center gap-2 min-w-0 w-full">
              <span className="truncate">{item.label}</span>
              {renderBadge(item.badge)}
            </div>
          </span>

          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 transition-transform text-slate-600",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      ) : (
        <Link href={href} onClick={onNavigate} className={rowClass}>
          {Icon ? (
            <span className={iconWrapClass}>
              <Icon className="h-4 w-4" />
            </span>
          ) : null}

          {/* Label + Badge (Top-Level ohne Children, z.B. Rechnungen, FAQ) */}
          <div className="flex items-center gap-2 min-w-0 w-full">
            <span className="truncate">{item.label}</span>
            {renderBadge(item.badge)}
          </div>
        </Link>
      )}

      {/* Children */}
      {hasChildren && open ? (
        <div className="ml-4 space-y-1">
          {item.children.map((c) => {
            const cHref = typeof c.href === "function" ? c.href() : c.href;
            const cActive = pathMatches(currentPath, c.match || [cHref], {
              exact: !!c.exact,
            });

            return (
              <Link
                key={c.label}
                href={cHref}
                onClick={onNavigate}
                className={childLinkClass(cActive)}
              >
                {/* kleiner quadratischer Punkt */}
                <span
                  className={[
                    "h-2 w-2 rounded-[2px] shrink-0",
                    cActive ? "bg-sky-500" : "bg-slate-300",
                  ].join(" ")}
                />

                {/* Child-Label + optional Child-Badge (falls du es mal brauchst) */}
                <div className="flex w-full items-center justify-between gap-2 min-w-0">
                  <span className="truncate ml-2">{c.label}</span>
                  {renderBadge(c.badge)}
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}