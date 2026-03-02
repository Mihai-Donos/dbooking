// resources/js/Components/StatusSlider.jsx
import React, { useEffect, useRef, useState } from "react";

export default function StatusSlider({
  tabs = [],
  activeKey,
  onChange,
  counts = {},
}) {
  const sliderRef = useRef(null);
  const [thumbRect, setThumbRect] = useState({ left: 0, width: 0 });

  // Thumb so ausrichten, wie du es im Page-Component machst
  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    const activeBtn = container.querySelector(
      `button[data-status-key="${activeKey}"]`
    );
    if (!activeBtn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = activeBtn.getBoundingClientRect();

    setThumbRect({
      left: bRect.left - cRect.left,
      width: bRect.width,
    });
  }, [activeKey, tabs.length]);

  return (
    <div
      ref={sliderRef}
      className="relative inline-flex shrink-0 rounded-full bg-slate-100/80 px-1 py-1 shadow-inner overflow-hidden"
    >
      {/* Thumb richtet sich nach dem aktiven Button */}
      <div
        className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-200 ease-out"
        style={{
          left: thumbRect.left,
          width: thumbRect.width,
        }}
      />

      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        const count = counts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            data-status-key={tab.key}
            onClick={() => onChange?.(tab.key)}
            className={[
              "relative z-10 inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition",
              active
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span className="ml-1 text-[11px] text-slate-400">
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}