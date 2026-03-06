// resources/js/Pages/Bookings/Edit.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";

const TIME_SLOTS = ["08:00", "13:00", "18:00"];

// --- Helpers (wie in New2) ----------------------------------------

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
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mi}`;
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

function moneyToNumber(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;

  const raw = String(v).trim();

  if (raw.includes(",")) {
    const s = raw.replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

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

// ------------------------------------------------------------------
// Edit-Page
// Props-Vorschlag (Controller muss das passend liefern):
// - event
// - booking
// - offers / offers_per_day / offers_per_booking
// - chargeTypes
// ------------------------------------------------------------------

export default function Edit({
  event,
  booking,
  offers = [],
  offers_per_day = [],
  offers_per_booking = [],
  chargeTypes,
}) {
  const PER_BOOKING = chargeTypes?.PER_BOOKING ?? 1;
  const PER_DAY = chargeTypes?.PER_DAY ?? 2;

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

  const userPerBookingOffers = useMemo(
    () => (perBookingOffers || []).filter((o) => !o.host_only),
    [perBookingOffers]
  );

  const hostOnlyOffers = useMemo(
    () => (perBookingOffers || []).filter((o) => o.host_only),
    [perBookingOffers]
  );

  const hostOnlySelected = useMemo(
    () =>
      hostOnlyOffers.filter((o) =>
        (booking.per_booking_offering_ids || []).map(Number).includes(Number(o.id))
      ),
    [hostOnlyOffers, booking.per_booking_offering_ids]
  );


  const defaultPerDayOfferId = useMemo(
    () => pickDefaultAdultOfferId(perDayOffers),
    [perDayOffers]
  );

  const eventStartDate = toDateInput(event?.start_date);
  const eventEndDate = toDateInput(event?.end_date);

  const bookingFromDate = toDateInput(booking?.from_date) || eventStartDate;
  const bookingToDate = toDateInput(booking?.to_date) || eventEndDate;

  const bookingFromTime =
    toTimeHHMM(booking?.from_date) || pickNearestSlot(toTimeHHMM(event?.start_date));
  const bookingToTime =
    toTimeHHMM(booking?.to_date) || pickNearestSlot(toTimeHHMM(event?.end_date));

  const initialPerDayOfferId =
    booking?.per_day_offering_id ?? defaultPerDayOfferId;

  const initialPerBookingIds =
    booking?.per_booking_offering_ids ?? []; // Array von IDs (Controller muss das liefern)

  const {
    data,
    setData,
    put,
    processing,
    errors,
    transform,
  } = useForm({
    from_date: bookingFromDate,
    to_date: bookingToDate,
    from_time: bookingFromTime,
    to_time: bookingToTime,

    glutenfree: !!booking?.glutenfree,
    vegetarian: !!booking?.vegetarian,
    lactose_free: !!booking?.lactose_free,
    single_room: !!booking?.single_room,
    baby_bed: !!booking?.baby_bed,

    per_day: {
      offer_id: initialPerDayOfferId,
      label: booking?.customer_name ?? "",
    },

    per_booking: initialPerBookingIds.map(Number),
  });

  // Zeit-Slots einschränken wie bei New2
  const eventStartTime = eventTimeHHMM(event?.start_date);
  const eventEndTime = eventTimeHHMM(event?.end_date);

  const availableFromSlots = useMemo(() => {
    let slots = TIME_SLOTS;

    if (data.from_date === eventStartDate) {
      const min = toMinutes(eventStartTime);
      slots = slots.filter((t) => toMinutes(t) >= min);
    }

    if (data.from_date === eventEndDate && eventStartDate === eventEndDate) {
      const max = toMinutes(eventEndTime);
      slots = slots.filter((t) => toMinutes(t) <= max);
    }

    return slots;
  }, [data.from_date, eventStartDate, eventEndDate, eventStartTime, eventEndTime]);

  const availableToSlots = useMemo(() => {
    let slots = TIME_SLOTS;

    if (data.to_date === eventEndDate) {
      const max = toMinutes(eventEndTime);
      slots = slots.filter((t) => toMinutes(t) <= max);
    }

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
      setData(
        "to_time",
        availableToSlots[availableToSlots.length - 1] ??
          TIME_SLOTS[TIME_SLOTS.length - 1]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableToSlots]);

  const nights = useMemo(
    () => nightsBetween(data.from_date, data.to_date),
    [data.from_date, data.to_date]
  );

  const perDaySelected = useMemo(
    () =>
      perDayOffers.find((o) => Number(o.id) === Number(data.per_day.offer_id)),
    [perDayOffers, data.per_day.offer_id]
  );

  const perBookingSelected = useMemo(() => {
    const set = new Set((data.per_booking || []).map((x) => Number(x)));
    return perBookingOffers.filter((o) => set.has(Number(o.id)));
  }, [data.per_booking, perBookingOffers]);

  const selectedNameLower = String(perDaySelected?.name ?? "").toLowerCase();
  const isBaby = selectedNameLower.includes("baby");
  const isKleinkind = selectedNameLower.includes("kleinkind");
  const allowBabyBed = isBaby || isKleinkind;

  // Optionen bereinigen (gleiche Logik wie in New2)
  useEffect(() => {
    if (!allowBabyBed && data.baby_bed) {
      setData("baby_bed", false);
    }

    if (isBaby) {
      const othersActive =
        data.glutenfree ||
        data.vegetarian ||
        data.lactose_free ||
        data.single_room;

      if (othersActive) {
        setData((prev) => ({
          ...prev,
          glutenfree: false,
          vegetarian: false,
          lactose_free: false,
          single_room: false,
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
    setData,
  ]);

  // Wenn Paket gewechselt wird: Optionen resetten
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
    const perBookingTotal = perBookingSelected.reduce(
      (sum, o) => sum + Number(o.price ?? 0),
      0
    );
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

  const [periodExpanded, setPeriodExpanded] = useState(true);
  const nameInputRef = useRef(null);
  const periodRef = useRef(null);

  const handleCancel = () => {
    router.visit(route("bookings.overview"));
  };

  const submit = (e) => {
    e.preventDefault();

    transform((form) => ({
      ...form,
      per_day_offering_id: Number(form.per_day.offer_id),
      per_booking_offering_ids: (form.per_booking || []).map(Number),
      customer_name: form.per_day.label,
      from_date: `${form.from_date} ${form.from_time}:00`,
      to_date: `${form.to_date} ${form.to_time}:00`,
    }));

    put(route("bookings.update", [event.id, booking.id]), {
      preserveScroll: true,
      onSuccess: () => {
        transform((d) => d);
        router.visit(route("bookings.overview"));
      },
      onError: () => {
        transform((d) => d);
        requestAnimationFrame(() => {
          nameInputRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          setTimeout(() => nameInputRef?.current?.focus?.(), 150);
        });
      },
    });
  };

  return (
    <AppShell
      title="Anmeldung bearbeiten"
      subtitle="Passe diese Buchung an."
    >
      <Head title="Buchung bearbeiten" />

      <form onSubmit={submit} className="mt-6">
        {/* 🧊 eine große Card für alles */}
        <div className="soft-surface p-6 space-y-8">
          {/* ───────────────── Event Kopf ───────────────── */}
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="text-xs text-slate-500">Event</div>

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-slate-900">
                    {event?.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {event?.description}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500">Ort:</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {event?.location?.name ?? "—"}
                    </span>
                  </div>
                </div>

                {event?.status?.label ? (
                  <div className="shrink-0 pt-1">
                    <span className={statusBadge(event.status.label)}>
                      {event.status.label}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* ───────────────── Name + Paket (2 Spalten) ───────────────── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="block text-base font-semibold text-slate-900">
                Vorname Name*
              </label>
              <input
                ref={nameInputRef}
                value={data.per_day.label}
                onChange={(e) =>
                  setData("per_day", {
                    ...data.per_day,
                    label: e.target.value,
                  })
                }
                placeholder="vollständiger Vor- & Nachname"
                className="form-input mt-2 w-full"
                aria-invalid={!!errors["per_day.label"]}
              />
              {errors["per_day.label"] ? (
                <p className="mt-2 text-sm text-rose-600">
                  Ohne vollständigen Vor- & Nachnamen gibts kein Zimmer!
                </p>
              ) : null}
            </div>

            {/* Paket pro Nacht */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-base font-semibold text-slate-900">
                Kosten pro Nacht &amp; Person
              </div>
              <div className="mt-3">
                <select
                  className="form-select w-full"
                  value={data.per_day.offer_id}
                  onChange={(e) =>
                    setData("per_day", {
                      ...data.per_day,
                      offer_id: e.target.value,
                    })
                  }
                >
                  {perDayOffers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({formatEuro(o.price)} €)
                    </option>
                  ))}
                </select>

                {/* Beschreibung + Einzelpreis */}
                <div className="mt-3 pl-2 sm:pl-3 text-xs text-slate-500 leading-snug">
                  {perDaySelected?.description ? (
                    <div className="line-clamp-2">
                      {perDaySelected.description}
                    </div>
                  ) : null}

                  <div className="mt-0.5">
                    Preis pro Nacht:{" "}
                    <span className="font-semibold text-slate-700">
                      {formatEuro(perDaySelected?.price ?? 0)} €
                    </span>
                  </div>
                </div>

                {errors["per_day.offer_id"] && (
                  <p className="mt-2 text-sm text-rose-600">
                    {errors["per_day.offer_id"]}
                  </p>
                )}
              </div>

              {/* Zwischensumme */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">{perDaySummary.left}</div>
                  <div className="shrink-0 text-slate-900 text-lg font-semibold">
                    {perDaySummary.right}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────── Zeitraum (wie Anmeldung, aber im selben Card) ───────────────── */}
          <div className="border-t border-slate-200/70 pt-5">
            <div
              ref={periodRef}
              className="flex items-start justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Zeitraum
                  </h2>

                  <button
                    type="button"
                    className="icon-btn icon-btn--edit"
                    aria-label={
                      periodExpanded ? "Zeitraum einklappen" : "Zeitraum ausklappen"
                    }
                    onClick={() => setPeriodExpanded((v) => !v)}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        periodExpanded ? "rotate-180" : ""
                      }`}
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
                  <p className="text-sm text-slate-600">
                    Passe An- und Abreise für diese Person an.
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <div className="soft-muted px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">Nächte</span>
                    <span className="text-brand-800 font-semibold">
                      {nights}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {periodExpanded ? (
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Von */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Anreise (Datum)
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
                        {t} Uhr
                      </button>
                    ))}
                  </div>
                  {errors.from_date && (
                    <p className="mt-2 text-sm text-rose-600">
                      {errors.from_date}
                    </p>
                  )}
                  {errors.from_time && (
                    <p className="mt-2 text-sm text-rose-600">
                      {errors.from_time}
                    </p>
                  )}
                </div>

                {/* Bis */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Abreise (Datum)
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
                        {t} Uhr
                      </button>
                    ))}
                  </div>
                  {errors.to_date && (
                    <p className="mt-2 text-sm text-rose-600">
                      {errors.to_date}
                    </p>
                  )}
                  {errors.to_time && (
                    <p className="mt-2 text-sm text-rose-600">
                      {errors.to_time}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* ───────────────── Optionen ───────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-base font-semibold text-slate-900">
              Optionen
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
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

          {/* ───────────────── Pauschal pro Anmeldung ───────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900">
              Pauschal pro Anmeldung
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Selten, aber manchmal nützlich.
            </p>

            <div className="mt-4">
              {perBookingOffers.length === 0 ? (
                <div className="text-sm text-slate-600">
                  Keine einmaligen Buchungspositionen verfügbar.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {userPerBookingOffers.map((o) => {
                    const checked = (data.per_booking || [])
                        .map(Number)
                        .includes(Number(o.id));
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
                            <span className="font-semibold text-slate-900">
                            {o.name}
                            </span>
                        </span>
                        <span className="font-semibold text-slate-900">
                            {formatEuro(o.price)} €
                        </span>
                        </label>
                    );
                    })}

                    {/* Host-only Zuschläge (nur Anzeige, nicht änderbar) */}
                    {hostOnlySelected.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <div className="mb-2 font-semibold">
                        Vom Veranstalter hinzugefügte Zuschläge
                        </div>
                        <div className="space-y-1">
                        {hostOnlySelected.map((o) => (
                            <div
                            key={o.id}
                            className="flex items-center justify-between gap-3"
                            >
                            <span>{o.name}</span>
                            <span className="font-semibold">
                                {formatEuro(o.price)} €
                            </span>
                            </div>
                        ))}
                        </div>
                        <p className="mt-2 text-xs text-amber-800">
                        Diese Positionen wurden vom Veranstalter ergänzt und können nicht über die Bearbeitung entfernt werden.
                        </p>
                    </div>
                    )}


                </div>
              )}
              {errors.per_booking && (
                <p className="mt-2 text-sm text-rose-600">
                  {errors.per_booking}
                </p>
              )}
            </div>
          </div>

          {/* ───────────────── Gesamt + Buttons (beide rechts) ───────────────── */}
          <div className="border-t border-slate-200/70 pt-5">
            <div className="flex flex-wrap justify-end gap-3 items-end">
              <div className="text-right mr-4">
                <div className="text-sm text-slate-500">Gesamt</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatEuro(total)} €
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Abbrechen
              </button>

              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary"
              >
                Änderungen speichern
              </button>
            </div>

            {Object.keys(errors || {}).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                Bitte prüfe deine Eingaben (Name, Zeitraum oder Buchungspositionen).
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </AppShell>
  );
}