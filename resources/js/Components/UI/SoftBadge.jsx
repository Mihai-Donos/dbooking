// resources/js/Components/UI/SoftBadge.jsx

import React from "react";

export default function SoftBadge({ variant = "neutral", children, className = "" }) {
  const map = {
    neutral: "soft-badge-neutral",
    info: "soft-badge-info",
    success: "soft-badge-success",
    warn: "soft-badge-warn",
    danger: "soft-badge-danger",
  };

  return (
    <span className={`soft-badge ${map[variant] ?? map.neutral} ${className}`}>
      {children}
    </span>
  );
}