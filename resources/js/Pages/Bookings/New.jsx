// resources/js/Pages/Bookings/New.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

const TIME_SLOTS = ["08:00", "13:00", "18:00"];

function toDateInput(iso) {
  if (!iso) return "";
  const d = new Date(String(iso).replace(" ", "T"));
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toTimeHHMM(iso) {
  if (!iso) return "";
  const d = new Date(String(iso).replace(" ", "T"));
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDateDE(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  const [y, m, d] = String(yyyyMmDd).split("-");
  if (!y || !m || !d) return String(yyyyMmDd);
  return `${d}.${m}.${y}`;
}

function nightsBetween(fromDateStr, toDateStr) {
  if (!fromDateStr || !toDateStr) return 0;
  const a = new Date(`${fromDateStr}T00:00:00`);
  const b = new Date(`${toDateStr}T00:00:00`);
  const ms = b.getTime() - a.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function pickNearestSlot(hhmm) {
  if (!hhmm) return TIME_SLOTS[0];
  const [h, m] = hhmm.split(":").map(Number);
  const minutes = h * 60 + m;

  const slotMinutes = TIME_SLOTS.map((s) => {
    const [sh, sm] = s.split(":").map(Number);
    return sh * 60 + sm;
  });

  let best = 0;
  let bestDiff = Infinity;
  slotMinutes.forEach((sm, idx) => {
    const diff = Math.abs(sm - minutes);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = idx;
    }
  });

  return TIME_SLOTS[best];
}

function bubble(active) {
  return [
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition select-none",
    active
      ? "bg-brand-50 text-brand-700 border-brand-200/60"
      : "bg-white text-gray-700 border-gray-200/60 hover:bg-gray-50",
  ].join(" ");
}

function statusBadge(statusLabel) {
  if (!statusLabel) return "soft-badge soft-badge-neutral";
  const s = String(statusLabel).toLowerCase();
  if (s.includes("möglich") || s.includes("offen")) return "soft-badge soft-badge-success";
  if (s.includes("im gange")) return "soft-badge soft-badge-info";
  if (s.includes("geschlossen")) return "soft-badge soft-badge-warn";
  if (s.includes("abgesagt")) return "soft-badge soft-badge-danger";
  return "soft-badge soft-badge-neutral";
}

// ✅ FIX 1: robustes Parsing für "8.00" (Backend) UND "225,00" (DE)
function moneyToNumber(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
  
    const raw = String(v).trim();
  
    // Wenn Komma vorkommt -> DE-Format: 1.234,56
    if (raw.includes(",")) {
      const s = raw.replace(/\./g, "").replace(",", ".");
      const n = Number(s);
      return Number.isFinite(n) ? n : 0;
    }
  
    // Kein Komma:
    // - "8.00" (Decimalpunkt) => direkt Number
    // - "1000" => Number
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }
  
  function formatEuro(value) {
    const n = typeof value === "number" ? value : moneyToNumber(value);
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  function pickDefaultAdultOfferId(perDayOffers) {
    const adult = (perDayOffers || []).find((o) =>
      String(o?.name || "").toLowerCase().includes("erwachs")
    );
    return adult?.id ?? (perDayOffers?.[0]?.id ?? "");
  }

  function toMinutes(hhmm) {
    if (!hhmm) return 0;
    const [h, m] = String(hhmm).split(":").map(Number);
    return h * 60 + m;
  }
  
  function eventTimeHHMM(iso) {
    if (!iso) return "";
    const d = new Date(String(iso).replace(" ", "T"));
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

export default function New2({
  event,
  offers = [],
  offers_per_day = [],
  offers_per_booking = [],
  chargeTypes,
  flashSuccess,
  user_event_total_amount = 0,
  user_event_booking_count = 0,
  user_event_bookings = [],
  autoAddPerson = false,
}) {
  const PER_BOOKING = chargeTypes?.PER_BOOKING ?? 1;
  const PER_DAY = chargeTypes?.PER_DAY ?? 2;
  const hasBookings = Number(user_event_booking_count) > 0;

  const normalizedOffers = useMemo(() => {
    const hasSplit =
      Array.isArray(offers_per_day) &&
      Array.isArray(offers_per_booking) &&
      (offers_per_day.length || offers_per_booking.length);

    if (hasSplit) {
      return {
        perDay: offers_per_day,
        perBooking: offers_per_booking,
        flat: [...offers_per_day, ...offers_per_booking],
      };
    }

    const flat = Array.isArray(offers) ? offers : [];
    return {
      flat,
      perDay: flat.filter((o) => Number(o.charge_type) === PER_DAY),
      perBooking: flat.filter((o) => Number(o.charge_type) === PER_BOOKING),
    };
  }, [offers, offers_per_day, offers_per_booking, PER_DAY, PER_BOOKING]);

  const perDayOffers = normalizedOffers.perDay;
  const perBookingOffers = normalizedOffers.perBooking;

  const defaultPerDayOfferId = useMemo(
    () => pickDefaultAdultOfferId(perDayOffers),
    [perDayOffers]
  );

  const eventStartDate = toDateInput(event?.start_date);
  const eventEndDate = toDateInput(event?.end_date);
  
  const defaultFromTime = pickNearestSlot(toTimeHHMM(event?.start_date));
  const defaultToTime = pickNearestSlot(toTimeHHMM(event?.end_date));

  const { data, setData, post, processing, errors, transform, reset, clearErrors } = useForm({
    from_date: eventStartDate,
    to_date: eventEndDate,
    from_time: defaultFromTime,
    to_time: defaultToTime,

    glutenfree: false,
    vegetarian: false,
    lactose_free: false,
    single_room: false,
    baby_bed: false,

    per_day: {
      offer_id: defaultPerDayOfferId,
      label: "",
    },

    per_booking: [],
  });

  useEffect(() => {
    if (!data.per_day.offer_id && defaultPerDayOfferId) {
      setData("per_day", { ...data.per_day, offer_id: defaultPerDayOfferId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPerDayOfferId]);


  const eventStartTime = eventTimeHHMM(event?.start_date); // z.B. 18:00
  const eventEndTime = eventTimeHHMM(event?.end_date);     // z.B. 08:00

  const availableFromSlots = useMemo(() => {
    // Standard: alle Slots
    let slots = TIME_SLOTS;

    // Wenn Start-Tag gewählt -> nur Slots >= Event-Startzeit
    if (data.from_date === eventStartDate) {
        const min = toMinutes(eventStartTime);
        slots = slots.filter((t) => toMinutes(t) >= min);
    }

    // Wenn End-Tag gewählt UND Start==End -> zusätzlich <= Endzeit
    if (data.from_date === eventEndDate && eventStartDate === eventEndDate) {
        const max = toMinutes(eventEndTime);
        slots = slots.filter((t) => toMinutes(t) <= max);
    }

    return slots;
    }, [data.from_date, eventStartDate, eventEndDate, eventStartTime, eventEndTime]);

const availableToSlots = useMemo(() => {
    let slots = TIME_SLOTS;

    // Wenn End-Tag gewählt -> nur Slots <= Event-Endzeit
    if (data.to_date === eventEndDate) {
        const max = toMinutes(eventEndTime);
        slots = slots.filter((t) => toMinutes(t) <= max);
    }

    // Wenn Start-Tag gewählt UND Start==End -> zusätzlich >= Startzeit
    if (data.to_date === eventStartDate && eventStartDate === eventEndDate) {
        const min = toMinutes(eventStartTime);
        slots = slots.filter((t) => toMinutes(t) >= min);
    }

    return slots;
    }, [data.to_date, eventStartDate, eventEndDate, eventStartTime, eventEndTime]);

    useEffect(() => {
        if (!availableFromSlots.includes(data.from_time)) {
          setData("from_time", availableFromSlots[0] ?? TIME_SLOTS[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [availableFromSlots]);
      
      useEffect(() => {
        if (!availableToSlots.includes(data.to_time)) {
          setData("to_time", availableToSlots[availableToSlots.length - 1] ?? TIME_SLOTS[TIME_SLOTS.length - 1]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [availableToSlots]);



  const nights = useMemo(() => nightsBetween(data.from_date, data.to_date), [data.from_date, data.to_date]);

  // UX State
  
    // wenn Buchungen existieren: offen, außer der Redirect kommt von extern
  const [bookingsOpen, setBookingsOpen] = useState(
    autoAddPerson ? false : hasBookings
  );

    // wenn Buchungen existieren: zunächst Formular versteckt
  const [showForm, setShowForm] = useState(
    autoAddPerson ? true : !hasBookings
  );

  const [periodExpanded, setPeriodExpanded] = useState(true);

  const periodSummary = useMemo(() => {
    const from = `${formatDateDE(data.from_date)} ${data.from_time}`;
    const to = `${formatDateDE(data.to_date)} ${data.to_time}`;
  
    return (
      <span className="leading-snug">
        <span className="block sm:inline">Von {from}</span>
        <span className="hidden sm:inline"> – </span>
        <span className="block sm:inline">Bis {to}</span>
      </span>
    );
  }, [data.from_date, data.from_time, data.to_date, data.to_time]);

  // Refs für Scroll-to-Name
  const nameInputRef = useRef(null);
  const periodRef = React.useRef(null);

  const TIME_LABELS = {
    "08:00": "Frühstück",
    "13:00": "Mittagessen",
    "18:00": "Abendessen",
  };

  const perDaySelected = useMemo(
    () => perDayOffers.find((o) => Number(o.id) === Number(data.per_day.offer_id)),
    [perDayOffers, data.per_day.offer_id]
  );

  // direkt nach const perBookingOffers = normalizedOffers.perBooking;
  const userPerBookingOffers = useMemo(
    () => (perBookingOffers || []).filter((o) => !o.host_only),
    [perBookingOffers]
  );

  const perBookingSelected = useMemo(() => {
    const set = new Set((data.per_booking || []).map((x) => Number(x)));
    return perBookingOffers.filter((o) => set.has(Number(o.id)));
  }, [data.per_booking, perBookingOffers]);

  // Erkennung: Baby/Kleinkind anhand Name
  const selectedNameLower = String(perDaySelected?.name ?? "").toLowerCase();
  const isBaby = selectedNameLower.includes("baby");
  const isKleinkind = selectedNameLower.includes("kleinkind");
  const allowBabyBed = isBaby || isKleinkind; // Erwachsener -> false




  // ✅ Nur bereinigen (nie automatisch aktivieren)
useEffect(() => {
    // Wenn Babybett nicht erlaubt, aber noch aktiv -> entfernen
    if (!allowBabyBed && data.baby_bed) {
      setData("baby_bed", false);
    }
  
    // Wenn Baby ausgewählt ist, sollen andere Optionen nicht aktiv sein -> entfernen
    if (isBaby) {
      const othersActive =
        data.glutenfree || data.vegetarian || data.lactose_free || data.single_room;
  
      if (othersActive) {
        setData((prev) => ({
          ...prev,
          glutenfree: false,
          vegetarian: false,
          lactose_free: false,
          single_room: false,
          // baby_bed NICHT automatisch setzen!
        }));
      }
    }
  }, [
    isBaby,
    allowBabyBed,
    data.baby_bed,
    data.glutenfree,
    data.vegetarian,
    data.lactose_free,
    data.single_room,
  ]);

  // ✅ Wenn Offering (per_day.offer_id) gewechselt wird: ALLE Optionen resetten
useEffect(() => {
    setData((prev) => ({
      ...prev,
      glutenfree: false,
      vegetarian: false,
      lactose_free: false,
      single_room: false,
      baby_bed: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.per_day.offer_id]);

  const total = useMemo(() => {
    const perDayUnit = Number(perDaySelected?.price ?? 0);
    const perDayTotal = perDayUnit * nights;
    const perBookingTotal = perBookingSelected.reduce((sum, o) => sum + Number(o.price ?? 0), 0);
    return Math.round((perDayTotal + perBookingTotal) * 100) / 100;
  }, [perDaySelected, nights, perBookingSelected]);

  const perDaySummary = useMemo(() => {
    if (!perDaySelected) return { left: "—", right: "—" };

    const unit = Number(perDaySelected.price ?? 0);
    const qty = Number(nights ?? 0);
    const lineTotal = unit * qty;

    return {
      left: (
        <>
          <span className="block sm:hidden ">{formatEuro(unit)} €</span>
          <span className="block sm:hidden ">× {qty} Nächte</span>
          <span className="hidden sm:inline text-base">
            {qty} Nächte × {formatEuro(unit)} €
          </span>
        </>
      ),
      right: <>{formatEuro(lineTotal)} €</>,
    };
  }, [perDaySelected, nights]);

  const togglePerBooking = (id, checked) => {
    const prev = new Set((data.per_booking || []).map((x) => Number(x)));
    if (checked) prev.add(Number(id));
    else prev.delete(Number(id));
    setData("per_booking", Array.from(prev));
  };

  const toggleOpt = (key) => setData(key, !data[key]);

  const deleteBooking = (bookingId) => {
    if (!confirm("Buchung wirklich löschen?")) return;

    router.delete(route("bookings.destroy", [event.id, bookingId]), {
      preserveScroll: true,
    });
  };

  const resetForm = () => {
    clearErrors();
    reset();

    setData({
      from_date: eventStartDate,
      to_date: eventEndDate,
      from_time: defaultFromTime,
      to_time: defaultToTime,

      glutenfree: false,
      vegetarian: false,
      lactose_free: false,
      single_room: false,
      baby_bed: false,

      per_day: {
        offer_id: defaultPerDayOfferId,
        label: "",
      },

      per_booking: [],
    });
  };

  const scrollToName = () => {
    requestAnimationFrame(() => {
      const el = periodRef.current;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Fokus leicht verzögert, damit Scroll fertig ist
      setTimeout(() => el.focus?.(), 150);
    });
  };

  const handleStart = () => {
    setBookingsOpen(false);
    setPeriodExpanded(false);
    setShowForm(true);
    scrollToName();
  };
  
  const handleAddPerson = () => {
    setBookingsOpen(false);
    setPeriodExpanded(false);
    setShowForm(true);
    scrollToName();
  };


  const handleCancelForm = () => {
    // Formular zurücksetzen
    resetForm();
  
    // Formular ausblenden
    setShowForm(false);
  
    // Buchungsübersicht wieder anzeigen
    setBookingsOpen(hasBookings);
  
    // Zeitraum einklappen
    setPeriodExpanded(false);
  };

  const handleFinish = () => {
    resetForm();
    setShowForm(false);
    // Redirect auf öffentliche Eventliste
    router.visit(route("bookings.overview"));
  };



  const submit = (e) => {
    e.preventDefault();

    transform((form) => ({
      ...form,
      per_day_offering_id: Number(form.per_day.offer_id),
      per_booking_offering_ids: (form.per_booking || []).map(Number),
      from_date: `${form.from_date} ${form.from_time}:00`,
      to_date: `${form.to_date} ${form.to_time}:00`,
    }));

    post(route("bookings.store", event.id), {
        preserveScroll: true,
        preserveState: (page) => Object.keys(page.props.errors || {}).length > 0,
      
        onSuccess: () => {
          transform((d) => d);
      
          setBookingsOpen(true);
          setShowForm(false);
          setPeriodExpanded(false);
      
          resetForm();
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
        },
      
        onError: () => {
          setShowForm(true);
          // bookingsOpen NICHT zwangsweise schließen – sonst “verschwindet” der Kontext
          setBookingsOpen(true);
      
          requestAnimationFrame(() => {
            nameInputRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => nameInputRef?.current?.focus?.(), 150);
          });
        },
      
        onFinish: () => {
          transform((d) => d);
        },
      });
  };

  // Header Bottom: Buchungen + Buttons (nur wenn User Buchungen hat UND Chevron offen)
  const headerBottom = hasBookings && bookingsOpen ? (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        {user_event_bookings.length === 0 ? (
          <div className="text-sm text-slate-600">Keine Anmeldungen vorhanden.</div>
        ) : (
          user_event_bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="font-semibold text-slate-900">{b.customer_name || "—"}</div>
                  <div className="text-sm text-slate-500">{b.nights} Nächte</div>
                </div>
                <div className="mt-1 text-sm text-slate-600 truncate">{b.offering_name}</div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Summe</div>
                  <div className="font-semibold text-slate-900 tabular-nums">
                    {formatEuro(moneyToNumber(b.total_amount))} €
                  </div>
                </div>

                <button type="button" onClick={() => deleteBooking(b.id)} className="btn btn-secondary">
                  Löschen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Buttons unter letzter Buchung */}
      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button type="button" className="btn btn-secondary" onClick={handleFinish}>
          Anmeldung abschließen
        </button>
        <button type="button" className="btn btn-primary" onClick={handleAddPerson}>
          Person hinzufügen
        </button>
      </div>
    </div>
  ) : null;

  return (
    <AppShell
      title="Teilnahme(n) anmelden"
      subtitle="Melde dich und alle Personen an, die dich begleiten."
      actions={
        !hasBookings ? (
          <button type="button" className="btn btn-primary" onClick={handleStart}>
            Anmeldung starten
          </button>
        ) : null
      }
      headerRight={
        hasBookings ? (
          <div className="flex items-center gap-3 sm:justify-end">
            <div className="text-right leading-tight">
              <div className="text-lg font-semibold text-slate-900 tabular-nums">
                {formatEuro(user_event_total_amount)} €
              </div>
              <div className="text-xs text-slate-500">Anmeldungen gesamt</div>
            </div>

            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-brand-500 px-2 text-sm font-bold text-white shadow-xs">
              {user_event_booking_count}
            </span>

            <button
              type="button"
              className="icon-btn icon-btn--edit border-slate-300 hover:border-slate-400"
              aria-label={bookingsOpen ? "Buchungen einklappen" : "Buchungen ausklappen"}
              onClick={() => setBookingsOpen((v) => !v)}
            >
              <svg
                className={`h-4 w-4 transition-transform ${bookingsOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : null
      }
      headerBottom={headerBottom}
    >
      <Head title="Neue Buchung (UX v2)" />

      {flashSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {flashSuccess}
        </div>
      ) : null}

      {/* Formular nur sichtbar, wenn gestartet / Person hinzufügen HIER HIER*/ }
      {showForm ? (
        <form onSubmit={submit} className="mt-6 space-y-6">
          {/* Zeitraum */}
          <div className="soft-surface p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500">Event</div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-slate-900">{event?.name}</div>
                      <div className="text-sm text-slate-600">{event?.description}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-500">Ort:</span>
                        <span className="text-sm font-semibold text-slate-800">{event?.location?.name ?? "—"}</span>
                      </div>
                    </div>

                    {event?.status?.label ? (
                      <div className="shrink-0 pt-1">
                        <span className={statusBadge(event.status.label)}>{event.status.label}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                  {/* Zeitraum Header (immer sichtbar) */}
                  <div className="my-5 h-px w-full bg-gray-200/60" />

                  {/* Zeitraum Header (immer sichtbar) */}
                  <div ref={periodRef} className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-900">Zeitraum</h2>

                        <button
                          type="button"
                          className="icon-btn icon-btn--edit"
                          aria-label={periodExpanded ? "Zeitraum einklappen" : "Zeitraum ausklappen"}
                          onClick={() => setPeriodExpanded((v) => !v)}
                        >
                          <svg
                            className={`h-4 w-4 transition-transform ${periodExpanded ? "rotate-180" : ""}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>

                      {!periodExpanded ? (
                        <p className="text-sm text-slate-600">{periodSummary}</p>
                      ) : (
                        <p className="text-sm text-slate-600">Dabei sein ist alles!</p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <div className="soft-muted px-4 py-2.5">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 font-medium">Nächte</span>
                          <span className="text-brand-800 font-semibold tabular-nums">{nights}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Einklappbarer Bereich (nur ab Trennstrich) */}
                    {/* Einklappbarer Bereich (stabil): nur rendern wenn offen */}
                    {periodExpanded ? (
                      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Von */}
                        <div>
                          <label className="block text-sm text-slate-700">
                            <span className="font-semibold">Von</span>{" "}
                            <span className="font-normal">(Ankunft)</span>
                          </label>
                          <input
                            type="date"
                            value={data.from_date}
                            min={eventStartDate}
                            max={eventEndDate}
                            onChange={(e) => setData("from_date", e.target.value)}
                            className="form-input mt-2 w-full"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {availableFromSlots.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setData("from_time", t)}
                                className={bubble(data.from_time === t)}
                              >
                                {TIME_LABELS[t] ?? `${t} Uhr`}
                              </button>
                            ))}
                          </div>
                          {errors.from_date && <p className="mt-2 text-sm text-rose-600">{errors.from_date}</p>}
                          {errors.from_time && <p className="mt-2 text-sm text-rose-600">{errors.from_time}</p>}
                        </div>

                        {/* Bis */}
                        <div>
                          <label className="block text-sm text-slate-700">
                            <span className="font-semibold">Von</span>{" "}
                            <span className="font-normal">(Ankunft)</span>
                          </label>
                          <input
                            type="date"
                            value={data.to_date}
                            min={eventStartDate}
                            max={eventEndDate}
                            onChange={(e) => setData("to_date", e.target.value)}
                            className="form-input mt-2 w-full"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            {availableToSlots.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setData("to_time", t)}
                                className={bubble(data.to_time === t)}
                              >
                                {TIME_LABELS[t] ?? `${t} Uhr`}
                              </button>
                            ))}
                          </div>
                          {errors.to_date && <p className="mt-2 text-sm text-rose-600">{errors.to_date}</p>}
                          {errors.to_time && <p className="mt-2 text-sm text-rose-600">{errors.to_time}</p>}
                        </div>
                      </div>
                    ) : null}

                  {/* ✅ WICHTIG: diese 2 Wrapper müssen jetzt zu! */}
                  </div> {/* min-w-0 flex-1 */}
                  </div> {/* flex items-start */}
                  </div> {/* soft-surface p-6 */}

          {/* Name + Dropdown (an Stelle der früheren Optionen-Card) */}
          <div className="soft-surface p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <label className="block text-base font-semibold text-slate-900">Vorname, Name*</label>
                <input
                  ref={nameInputRef}
                  value={data.per_day.label}
                  onChange={(e) => setData("per_day", { ...data.per_day, label: e.target.value })}
                  placeholder="vollständiger Vor- & Nachname"
                  className="form-input mt-2 w-full"
                  aria-invalid={!!errors["per_day.label"]}
                />
                {errors["per_day.label"] ? <p className="mt-2 text-sm text-rose-600">Ohne vollständigen Vor- & Nachnamen gibts kein Zimmer!</p> : null}
              </div>

              {/* Dropdown (pro Nacht) + Zwischensumme */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-base font-semibold text-slate-900">Kosten pro Nacht &amp; Person</div>
                <div className="mt-3">
                  <select
                    className="form-select w-full"
                    value={data.per_day.offer_id}
                    onChange={(e) => setData("per_day", { ...data.per_day, offer_id: e.target.value })}
                  >
                    {perDayOffers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({formatEuro(o.price)} €)
                      </option>
                    ))}
                  </select>

                {/* Description + Preis unter Dropdown */}
                <div className="mt-3 pl-2 sm:pl-3 text-xs text-slate-500 leading-snug">
                {perDaySelected?.description ? (<div className="line-clamp-2">{perDaySelected.description}</div>) : null}

                <div className="mt-0.5">
                    Preis pro Nacht:{" "}
                    <span className="font-semibold text-slate-700">
                    {formatEuro(perDaySelected?.price ?? 0)} €
                    </span>
                </div>
                </div>

                  {errors["per_day.offer_id"] && <p className="mt-2 text-sm text-rose-600">{errors["per_day.offer_id"]}</p>}
                </div>

                {/* Zwischensumme */}
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">{perDaySummary.left}</div>
                    <div className="shrink-0 text-slate-900 text-lg font-semibold tabular-nums">{perDaySummary.right}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optionen (wandern nach unten) */}
          <div className="soft-surface p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-base font-semibold text-slate-900">Optionen</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {/* Baby: nur Babybett anzeigen */}
                {isBaby ? (
                  <button
                    type="button"
                    onClick={() => toggleOpt("baby_bed")}
                    className={bubble(!!data.baby_bed)}
                    aria-pressed={!!data.baby_bed}
                  >
                    Babybett
                  </button>
                ) : (
                  <>
                    {/* Kleinkind: alle Optionen inkl. Babybett */}
                    {/* Erwachsener: ohne Babybett */}
                    {[
                      ["glutenfree", "Glutenfrei"],
                      ["vegetarian", "Vegetarisch"],
                      ["lactose_free", "Laktosefrei"],
                      ["single_room", "Einzelzimmer"],
                      ...(allowBabyBed ? [["baby_bed", "Babybett"]] : []),
                    ].map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleOpt(k)}
                        className={bubble(!!data[k])}
                        aria-pressed={!!data[k]}
                      >
                        {label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Einmalig */}
          <div className="soft-surface p-6">
            <h2 className="text-base font-semibold text-slate-900">Pauschal pro Anmeldung</h2>
            <p className="mt-1 text-sm text-slate-600">Selten aber manchmal nützlich</p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              {perBookingOffers.length === 0 ? (
                <div className="text-sm text-slate-600">Keine einmaligen Buchungspositionen verfügbar.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {userPerBookingOffers.map((o) => {
                    const checked = (data.per_booking || []).map(Number).includes(Number(o.id));
                    return (
                      <label
                        key={o.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={checked}
                            onChange={(e) => togglePerBooking(o.id, e.target.checked)}
                          />
                          <span className="font-semibold text-slate-900">{o.name}</span>
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatEuro(o.price)} €
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.per_booking && <p className="mt-2 text-sm text-rose-600">{errors.per_booking}</p>}
            </div>
          </div>

          {/* Save */}
          <div className="soft-surface p-6">
            <div className="flex flex-wrap justify-end gap-6 items-end">
              <div className="order-2 w-full sm:order-1 sm:w-auto sm:mr-1 self-end">
                <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={handleCancelForm}>
                  Abbrechen
                </button>
                
                <button type="submit" disabled={processing} className="btn btn-primary w-full sm:w-auto">
                  Person anmelden
                </button>
              </div>

              <div className="order-1 text-right sm:order-2">
                <div className="text-sm text-slate-500">Gesamt</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{formatEuro(total)} €</div>
              </div>
            </div>

            {Object.keys(errors || {}).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                Bitte prüfe deine Eingaben (Name, Zeitraum oder Buchungspositionen).
              </div>
            ) : null}
          </div>
        </form>
      ) : null}
    </AppShell>
  );
}