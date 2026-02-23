// resources/js/Components/BookingOptionIcons.jsx
import React from "react";

/**
 * Stil: runder Ring + inneres Symbol
 * - neutrales Icon: text-slate-600
 * - vegetarisch: text-green-700
 *
 * Icons nutzen currentColor, damit Wrapper die Farbe steuert.
 */

function Ring({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

/** Vegetarian (leicht grün) */
export function VegetarianBadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Leaf */}
      <path
        d="M8.2 13.1c4.2-5.6 9.3-5.6 9.3-5.6s.2 5.5-4 9c-2.6 2.2-5.6 1.9-7 .9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Leaf vein */}
      <path
        d="M9.7 13.5c2.3.2 4.6-1.2 6.7-3.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Glutenfrei (neutral): Ähre mit Slash */
export function GlutenFreeBadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Wheat stem */}
      <path
        d="M12 6.6v10.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Wheat grains */}
      <path
        d="M12 8.3c-1.2.2-2.2 1.1-2.6 2.2M12 8.3c1.2.2 2.2 1.1 2.6 2.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 11c-1.2.2-2.2 1.1-2.6 2.2M12 11c1.2.2 2.2 1.1 2.6 2.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 13.7c-1.2.2-2.2 1.1-2.6 2.2M12 13.7c1.2.2 2.2 1.1 2.6 2.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Slash */}
      <path
        d="M7.6 16.4L16.6 7.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Laktosefrei (neutral): Tropfen mit Slash */
export function LactoseFreeBadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Drop */}
      <path
        d="M12 7.2c2.1 2.6 3.4 4.6 3.4 6.3a3.4 3.4 0 11-6.8 0c0-1.7 1.3-3.7 3.4-6.3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Slash */}
      <path
        d="M7.6 16.4L16.6 7.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Einzelzimmer (neutral): Bett */
export function SingleRoomBadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Bed base */}
      <path
        d="M7.4 13.2h9.2c.9 0 1.6.7 1.6 1.6v1.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bed head + pillow */}
      <path
        d="M7.4 10.2v6.4M7.4 11.2h3.2c.9 0 1.6.7 1.6 1.6v.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Babybett (neutral): kleines Bettchen */
export function BabyBedBadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Crib */}
      <path
        d="M8 11.2h8M8 11.2v5.4M16 11.2v5.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Slats */}
      <path
        d="M10 11.6v4.6M12 11.6v4.6M14 11.6v4.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Base */}
      <path
        d="M7.6 16.6h8.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Liefert Options als Liste für Booking b
 */
export function bookingOptionIcons(b) {
  const out = [];

  if (b?.vegetarian) out.push({ key: "vegetarian", label: "Vegetarisch", Icon: VegetarianBadgeIcon, tone: "veg" });
  if (b?.glutenfree) out.push({ key: "glutenfree", label: "Glutenfrei", Icon: GlutenFreeBadgeIcon, tone: "neutral" });
  if (b?.lactose_free) out.push({ key: "lactose_free", label: "Laktosefrei", Icon: LactoseFreeBadgeIcon, tone: "neutral" });
  if (b?.single_room) out.push({ key: "single_room", label: "Einzelzimmer", Icon: SingleRoomBadgeIcon, tone: "neutral" });
  if (b?.baby_bed) out.push({ key: "baby_bed", label: "Babybett", Icon: BabyBedBadgeIcon, tone: "neutral" });

  return out;
}

/**
 * Kleine runde Icon-Chips für Mobile
 */
export function OptionIconRow({ booking }) {
  const items = bookingOptionIcons(booking);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(({ key, label, Icon, tone }) => {
        const toneClasses =
          tone === "veg"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-slate-200 bg-slate-50 text-slate-600";

        return (
          <span
            key={key}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border ${toneClasses}`}
            title={label}
            aria-label={label}
          >
            <Icon className="h-9 w-9" />
          </span>
        );
      })}
    </div>
  );
}