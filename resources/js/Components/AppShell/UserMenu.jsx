// resources/js/Components/AppShell/UserMenu.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function UserMenu({ user }) {
  const anchorRef = useRef(null);
  const menuRef = useRef(null);

  const canUseDOM = typeof window !== "undefined" && typeof document !== "undefined";
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 }); // right-edge Position

  const initials = useMemo(() => {
    const n = (user?.name ?? "U").trim();
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => (p?.[0] ? p[0].toUpperCase() : "")).join("") || "U";
  }, [user?.name]);

  const computePos = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 10;

    setPos({
      top: r.bottom + gap,
      right: r.right, // wir alignen rechts am Button
    });
  };

  useEffect(() => {
    if (!open) return;
    computePos();

    const onResize = () => computePos();
    const onScroll = () => computePos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Nach jeder Positionsänderung clampen
  useLayoutEffect(() => {
    if (!open) return;
    const m = menuRef.current;
    if (!m) return;

    const rect = m.getBoundingClientRect();

    let top = pos.top;
    let left = pos.right - rect.width; // right aligned

    top = clamp(top, 12, window.innerHeight - 12 - rect.height);
    left = clamp(left, 12, window.innerWidth - 12 - rect.width);

    m.style.top = `${top}px`;
    m.style.left = `${left}px`;
  }, [open, pos.top, pos.right]);

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      const a = anchorRef.current;
      const m = menuRef.current;
      if (!a || !m) return;
      if (a.contains(e.target) || m.contains(e.target)) return;
      setOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const doLogout = () => {
    setOpen(false);
    const logoutUrl = typeof route === "function" ? route("logout") : "/logout";
    router.post(logoutUrl);
  };

  const menu = open ? (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.right, // wird in useLayoutEffect sauber gesetzt
        zIndex: 9999,
      }}
      className="w-56 rounded-2xl border border-slate-200 bg-white shadow-[0_18px_35px_rgba(0,0,0,0.14)]"
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-extrabold text-slate-900">{user?.name ?? "User"}</div>
        <div className="mt-0.5 text-xs font-semibold text-slate-500">{user?.email ?? ""}</div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={doLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-rose-700 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => {
          if (!open) computePos();
          setOpen((v) => !v);
        }}
        className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500 text-sm font-extrabold text-white shadow hover:bg-sky-600"
        aria-label="User Menü öffnen"
        aria-expanded={open}
      >
        {initials}
      </button>

      {canUseDOM && menu ? createPortal(menu, document.body) : null}
    </>
  );
}