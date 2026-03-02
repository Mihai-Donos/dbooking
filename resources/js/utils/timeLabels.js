// resources/js/utils/timeLabels.js
export const TIME_LABELS = {
    "08:00": "Frühstück",
    "13:00": "Mittagessen",
    "18:00": "Abendessen",
    // falls du in der DB Sekunden hast:
    "08:00:00": "Frühstück",
    "13:00:00": "Mittagessen",
    "18:00:00": "Abendessen",
  };
  
  export function labelForTime(timeString) {
    if (!timeString) return null;
  
    // Nur "HH:MM" bzw "HH:MM:SS" extrahieren
    const match = String(timeString).match(/\b\d{2}:\d{2}(:\d{2})?\b/);
    if (!match) return null;
  
    const t = match[0]; // z.B. "08:00" oder "08:00:00"
    return TIME_LABELS[t] ?? null;
  }