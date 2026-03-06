// resources/js/utils/statusBadges.js

export function badgeClass(label) {
    const s = String(label || "").toLowerCase();
  
    if (s.includes("in bearbeitung")) return "soft-badge soft-badge-neutral";
    if (s.includes("bestät")) return "soft-badge soft-badge-success";
    if (s.includes("anmeldung")) return "soft-badge soft-badge-success";
    if (s.includes("storniert")) return "soft-badge soft-badge-danger";
    if (s.includes("beendet")) return "soft-badge soft-badge-neutral";
  
    return "soft-badge soft-badge-neutral";
  }