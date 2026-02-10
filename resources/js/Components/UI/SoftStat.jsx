// resources/js/Components/UI/SoftStat.jsx

import React from "react";
import SoftBadge from "@/Components/UI/SoftBadge";

export default function SoftStat({ label, value, badge, delta }) {
  return (
    <div className="soft-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        {badge ? <SoftBadge variant={badge.variant}>{badge.text}</SoftBadge> : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>

        {delta ? (
          <span className="soft-badge soft-badge-neutral">
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}