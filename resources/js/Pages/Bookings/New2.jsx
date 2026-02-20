// resources/js/Pages/Bookings/New.jsx
import React, { useMemo, useState } from "react";
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
  // Optional hübscher Badge; falls du später exakte BLUE1 Badges willst, hier anpassen
  if (!statusLabel) return "soft-badge soft-badge-neutral";
  const s = String(statusLabel).toLowerCase();
  if (s.includes("möglich") || s.includes("offen")) return "soft-badge soft-badge-success";
  if (s.includes("im gange")) return "soft-badge soft-badge-info";
  if (s.includes("geschlossen")) return "soft-badge soft-badge-warn";
  if (s.includes("abgesagt")) return "soft-badge soft-badge-danger";
  return "soft-badge soft-badge-neutral";
}

function formatDateTimeDE(iso) {
    if (!iso) return "—";
    const d = new Date(String(iso).replace(" ", "T"));
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  }


function moneyToNumber(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    const s = String(v).trim().replace(/\./g, "").replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }


export default function New({
  event,
  // robust: akzeptiert beide Formen
  offers = [],
  offers_per_day = [],
  offers_per_booking = [],
  chargeTypes,
  flashSuccess,

  user_event_total_amount = 0,
  user_event_booking_count = 0,
  user_event_bookings = [],

}) {
  const PER_BOOKING = chargeTypes?.PER_BOOKING ?? 1;
  const PER_DAY = chargeTypes?.PER_DAY ?? 2;
  const hasBookings = Number(user_event_booking_count) > 0;

  // Normalisierung: falls Backend bereits 2 Arrays liefert -> nutze sie,
  // sonst splitte das flat offers-array nach charge_type.
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

  const eventStartDate = toDateInput(event?.start_date);
  const eventEndDate = toDateInput(event?.end_date);

  const defaultFromTime = pickNearestSlot(toTimeHHMM(event?.start_date));
  const defaultToTime = pickNearestSlot(toTimeHHMM(event?.end_date));

  const { data, setData, post, processing, errors, transform, reset, clearErrors } = useForm({
    // UI-Inputs
    from_date: eventStartDate,
    to_date: eventEndDate,
    from_time: defaultFromTime,
    to_time: defaultToTime,

    // Optionen
    glutenfree: false,
    vegetarian: false,
    lactose_free: false,
    single_room: false,
    baby_bed: false,

    // pro Nacht
    per_day: {
      offer_id: perDayOffers?.[0]?.id ?? "",
      label: "",
    },

    // einmalig
    per_booking: [],
  });

  const nights = useMemo(() => nightsBetween(data.from_date, data.to_date), [data.from_date, data.to_date]);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  const deleteBooking = (bookingId) => {
    if (!confirm("Buchung wirklich löschen?")) return;
  
    router.delete(route("bookings.destroy", [event.id, bookingId]), {
      preserveScroll: true,
    });
  };

  const resetForm = () => {
    clearErrors();
  
    // ✅ zuerst "wirklich" zurücksetzen (useForm internal state)
    reset();
  
    // ✅ dann Defaults explizit setzen (Event-Zeitraum + Slots + erstes Offer)
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
        offer_id: perDayOffers?.[0]?.id ?? "",
        label: "",
      },
  
      per_booking: [],
    });
  };


  const perDaySelected = useMemo(
    () => perDayOffers.find((o) => Number(o.id) === Number(data.per_day.offer_id)),
    [perDayOffers, data.per_day.offer_id]
  );

  const perBookingSelected = useMemo(() => {
    const set = new Set((data.per_booking || []).map((x) => Number(x)));
    return perBookingOffers.filter((o) => set.has(Number(o.id)));
  }, [data.per_booking, perBookingOffers]);

  const total = useMemo(() => {
    const perDayUnit = Number(perDaySelected?.price ?? 0);
    const perDayTotal = perDayUnit * nights;
    const perBookingTotal = perBookingSelected.reduce((sum, o) => sum + Number(o.price ?? 0), 0);
    return Math.round((perDayTotal + perBookingTotal) * 100) / 100;
  }, [perDaySelected, nights, perBookingSelected]);

  const perDayLine = useMemo(() => {
    if (!perDaySelected) return "—";
    const unit = Number(perDaySelected.price ?? 0);
    const line = (unit * nights).toFixed(2);
    return `${unit.toFixed(2)} € × ${nights} = ${line} €`;
  }, [perDaySelected, nights]);

  const perDaySummary = useMemo(() => {
    if (!perDaySelected) return { left: "—", right: "—" };
  
    const unit = Number(perDaySelected.price ?? 0);
    const qty = Number(nights ?? 0);
    const lineTotal = unit * qty;
  
    return {
        left: (
            <>
              {/* Mobile: (pro Nacht) alleine, Rest darunter */}
              <span className="block sm:hidden pl-5">{unit.toFixed(2)} € </span>
              <span className="block sm:hidden pl-5">× {qty} Nächte</span>
          
              {/* Ab sm: alles in einer Zeile */}
              <span className="hidden sm:inline pl-3 text-base">
                 {qty} Nächte × {unit.toFixed(2)} €
              </span>
            </>
          ),
      right: <>{lineTotal.toFixed(2)} €</>
    };
  }, [perDaySelected, nights]);

  const togglePerBooking = (id, checked) => {
    const prev = new Set((data.per_booking || []).map((x) => Number(x)));
    if (checked) prev.add(Number(id));
    else prev.delete(Number(id));
    setData("per_booking", Array.from(prev));
  };

  const toggleOpt = (key) => setData(key, !data[key]);
 
  const submit = (e) => {
    e.preventDefault();
  
    transform((form) => ({
      ...form,
      per_day_offering_id: Number(form.per_day.offer_id),
      per_booking_offering_ids: (form.per_booking || []).map(Number),
  
      // Server bekommt DateTime
      from_date: `${form.from_date} ${form.from_time}:00`,
      to_date: `${form.to_date} ${form.to_time}:00`,
    }));
  
    post(route("bookings.store", event.id), {
      preserveState: false,
      preserveScroll: true,
      
      onBefore: () => {},
      
      onSuccess: () => {
        transform(((d) => d));
        resetForm();             // wirklich zurücksetzen

        setTimeout(() => {window.scrollTo({ top: 0, behavior: "smooth" }); }, 50); // optional
      },
      onFinish: () => {
        transform(((d) => d));
        resetForm(); 
      },
    });
  };

  return (
    <AppShell
      title="Neue Buchung"
      subtitle="Veranstaltung auswählen, Zeitraum festlegen, Offerings wählen und speichern."
      headerRight={
        hasBookings ? (
          <div className="flex items-center gap-3 sm:justify-end">
            {/* Summe */}
            <div className="text-right leading-tight">
              <div className="text-lg font-semibold text-slate-900 tabular-nums">
                {Number(user_event_total_amount).toFixed(2)} €
              </div>
              <div className="text-xs text-slate-500">Summe deiner Buchungen</div>
            </div>

            {/* Count Badge */}
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-brand-500 px-2 text-sm font-bold text-white shadow-xs">
              {user_event_booking_count}
            </span>

            {/* Chevron */}
              <button
                type="button"
                className="icon-btn icon-btn--edit"
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

      headerBottom={
        hasBookings && bookingsOpen ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-3">
              {user_event_bookings.length === 0 ? (
                <div className="text-sm text-slate-600">Keine Buchungen vorhanden.</div>
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
                          {moneyToNumber(b.total_amount).toFixed(2)} €
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
          </div>
        ) : null
      }

    >

      {flashSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {flashSuccess}
        </div>
      ) : null}

      {/* ✅ Event + Zeitraum  */}


      <form onSubmit={submit} className="mt-6 space-y-6">
        {/* Zeitraum */}
        <div className="soft-surface p-6">
          
        <div className="flex items-start justify-between gap-6">
        {/* LINKS */}
        <div className="min-w-0 flex-1">
            {/* ✅ Event-Block (oberhalb Strich) */}
            <div className="space-y-1">
            <div className="text-xs text-slate-500">Event</div>

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-900">{event?.name}</div>
                <div className="text-sm text-slate-600">{event?.description}</div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500">Ort:</span>
                    <span className="text-sm font-semibold text-slate-800">
                    {event?.location?.name ?? "—"}
                    </span>
                </div>
                </div>

                {/* ✅ Status auf Höhe des Titels (rechts oben, oberhalb Strich) */}
                {event?.status?.label ? (
                <div className="shrink-0 pt-1">
                    <span className={statusBadge(event.status.label)}>{event.status.label}</span>
                </div>
                ) : null}
            </div>
            </div>

            {/* ✅ Grauer Divider + etwas Abstand */}
            <div className="my-5 h-px w-full bg-gray-200/60" />

            {/* ✅ Zeitraum-Block (unterhalb Strich) */}
            <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold text-slate-900">Zeitraum</h2>
                <p className="text-sm text-slate-600">
                Buchungszeitraum muss innerhalb des Event-Zeitraums liegen.
                </p>
            </div>

            {/* ✅ Nächte auf Höhe der Zeitraum-Zeile */}
            <div className="shrink-0">
                <div className="soft-muted px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 font-medium">Nächte</span>
                    <span className="text-brand-800 font-semibold tabular-nums">{nights}</span>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Von (Datum)</label>
              <input
                type="date"
                value={data.from_date}
                min={eventStartDate}
                max={eventEndDate}
                onChange={(e) => setData("from_date", e.target.value)}
                className="form-input mt-2 w-full"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {TIME_SLOTS.map((t) => (
                  <button key={t} type="button" onClick={() => setData("from_time", t)} className={bubble(data.from_time === t)}>
                    {t} Uhr
                  </button>
                ))}
              </div>
              {errors.from_date && <p className="mt-2 text-sm text-rose-600">{errors.from_date}</p>}
              {errors.from_time && <p className="mt-2 text-sm text-rose-600">{errors.from_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Bis (Datum)</label>
              <input
                type="date"
                value={data.to_date}
                min={eventStartDate}
                max={eventEndDate}
                onChange={(e) => setData("to_date", e.target.value)}
                className="form-input mt-2 w-full"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {TIME_SLOTS.map((t) => (
                  <button key={t} type="button" onClick={() => setData("to_time", t)} className={bubble(data.to_time === t)}>
                    {t} Uhr
                  </button>
                ))}
              </div>
              {errors.to_date && <p className="mt-2 text-sm text-rose-600">{errors.to_date}</p>}
              {errors.to_time && <p className="mt-2 text-sm text-rose-600">{errors.to_time}</p>}
            </div>
          </div>
        </div>

        {/* ✅ NEUE CARD: Vorname, Name + Optionen */}
        <div className="soft-surface p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <label className="block text-base font-semibold text-slate-900">Vorname, Name*</label>
              <input
                value={data.per_day.label}
                onChange={(e) => setData("per_day", { ...data.per_day, label: e.target.value })}
                placeholder="z.B. Max Mustermann"
                className="form-input mt-2 w-full"
                aria-invalid={!!errors["per_day.label"]}
              />
              {errors["per_day.label"] ? ( <p className="mt-2 text-sm text-rose-600">Bitte Vorname und Name eingeben</p> ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-base font-semibold text-slate-900">Optionen</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["glutenfree", "Glutenfrei"],
                  ["vegetarian", "Vegetarisch"],
                  ["lactose_free", "Laktosefrei"],
                  ["single_room", "Einzelzimmer"],
                  ["baby_bed", "Babybett"],
                ].map(([k, label]) => (
                  <button key={k} type="button" onClick={() => toggleOpt(k)} className={bubble(!!data[k])} aria-pressed={!!data[k]}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pro Nacht */}
        <div className="soft-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Kosten pro Nacht &amp; Person </h2>
          <p className="mt-1 text-sm text-slate-600">Alter der Person auswählen </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            {perDayOffers.length === 0 ? (
              <div className="text-sm text-slate-600">Keine “pro Nacht” Buchungspositionen verfügbar.</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {perDayOffers.map((o) => {
                  const checked = Number(data.per_day.offer_id) === Number(o.id);
                  return (
                    <label
                      key={o.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          className="form-radio"
                          name="per_day_offer"
                          checked={checked}
                          onChange={() => setData("per_day", { ...data.per_day, offer_id: o.id })}
                        />
                        <span className="min-w-0">
                        <span className="block font-semibold text-slate-900 leading-snug">
                            {o.name}
                        </span>

                        {/* Beschreibung (2. Zeile, dezenter) */}
                        {o.description ? (
                            <span className="mt-0.5 block text-xs text-slate-500 leading-snug line-clamp-1">
                            {o.description}
                            </span>
                        ) : null}
                        </span>
                      </span>
                      <span className="font-semibold text-slate-900">{o.price} €</span>
                    </label>
                  );
                })}
              </div>
            )}
            {errors["per_day.offer_id"] && <p className="mt-2 text-sm text-rose-600">{errors["per_day.offer_id"]}</p>}
          </div>

            {/* Zwischensumme direkt in dieser Card */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">{perDaySummary.left}</div>
                    <div className="shrink-0 text-slate-900 text-lg font-semibold tabular-nums">{perDaySummary.right}</div>
                </div>
            </div>
        </div>

        {/* Einmalig */}
        <div className="soft-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Einmalig pro Buchung (beliebig viele)</h2>
          <p className="mt-1 text-sm text-slate-600">Diese Offerings werden einmal pro Buchung abgerechnet.</p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            {perBookingOffers.length === 0 ? (
              <div className="text-sm text-slate-600">Keine einmaligen Buchungspositionen verfügbar.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {perBookingOffers.map((o) => {
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
                      <span className="font-semibold text-slate-900">{o.price} €</span>
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
            {/* Button links von der Summe; bei wenig Platz umbrechen */}
            <div className="order-2 w-full sm:order-1 sm:w-auto sm:mr-1 self-end">
                <button type="submit" disabled={processing} className="btn btn-primary w-full sm:w-auto">
                Buchung speichern
                </button>
            </div>

            {/* Summe immer ganz rechts */}
            <div className="order-1 text-right sm:order-2">
                <div className="text-sm text-slate-500">Gesamt</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{total.toFixed(2)} €</div>
            </div>
        </div>
          {Object.keys(errors || {}).length > 0 ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              Bitte prüfe deine Eingaben (Name, Zeitraum oder Buchungspositionen).
            </div>
          ) : null}
        </div>
      </form>
    </AppShell>
  );
}