// resources/js/Components/UI/SoftCard.jsx

import React from "react";

export default function SoftCard({ title, subtitle, actions, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`soft-surface p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="soft-title">{title}</h2>}
            {subtitle && <p className="mt-1 soft-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}