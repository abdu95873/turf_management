import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { FiCalendar, FiLayers, FiMapPin, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useNowTicker from "../../../hooks/useNowTicker";
import { api, authHeaders, getBookingAuthMessage } from "../../../lib/api";
import { DEFAULT_ONLINE_PAYMENT_PROVIDER } from "../../../lib/payments";
import { filterFutureSlots, formatTime12h, isSlotPast } from "../../../lib/slotTime";
import { DsFieldLabel, DsInput, DsSelect, HomeSectionHeading } from "../shared/HomeUi";

const MAX_VISIBLE = 9;
const FORMAT_OPTIONS = ["5-a-side", "7-a-side", "11-a-side"];

function getSurfaceLabel(type) {
  if (type === "turf") return "Artificial Turf";
  if (type === "pool") return "Aquatic";
  return "Hybrid Grass";
}

function getVenueStatus(slots, date, isLoading) {
  if (isLoading) return { label: "Checking...", available: false };
  const futureSlots = filterFutureSlots(slots, date);
  const available = futureSlots.filter((slot) => slot.status === "available");
  if (available.length) return { label: "Available", available: true };
  const booked = futureSlots.find((slot) => slot.status === "booked");
  return {
    label: booked?.startTime ? `Busy ${formatTime12h(booked.startTime)}` : "Busy",
    available: false,
  };
}

export default function BookingSearchSection({ resources = [] }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const nowTick = useNowTicker();
  const [showAll, setShowAll] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedFormat, setSelectedFormat] = useState(FORMAT_OPTIONS[0]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [feedback, setFeedback] = useState("");

  const visibleResources = showAll ? resources : resources.slice(0, MAX_VISIBLE);
  const hasMore = resources.length > MAX_VISIBLE;
  const selectedResource = resources.find((resource) => resource._id === selectedResourceId) ?? null;

  useEffect(() => {
    if (resources.length && !selectedResourceId) {
      setSelectedResourceId(resources[0]._id);
    }
  }, [resources, selectedResourceId]);

  const slotPreviews = useQueries({
    queries: visibleResources.map((resource) => ({
      queryKey: ["booking-preview", resource._id, selectedDate],
      queryFn: () => api(`/api/slots?resourceId=${resource._id}&date=${selectedDate}`),
      enabled: Boolean(resource._id && selectedDate),
    })),
  });

  const packagesQuery = useQuery({
    queryKey: ["booking-packages", selectedResourceId],
    enabled: Boolean(selectedResourceId),
    queryFn: () => api(`/api/packages?resourceId=${selectedResourceId}`),
  });

  const slotsQuery = useQuery({
    queryKey: ["booking-slots", selectedResourceId, selectedDate],
    enabled: Boolean(selectedResourceId && selectedDate),
    queryFn: () => api(`/api/slots?resourceId=${selectedResourceId}&date=${selectedDate}`),
  });

  const packages = packagesQuery.data ?? [];
  const allSlots = slotsQuery.data ?? [];
  const bookableSlots = useMemo(
    () => filterFutureSlots(allSlots, selectedDate),
    [allSlots, selectedDate, nowTick]
  );
  const selectedPackage = packages.find((pkg) => pkg._id === selectedPackageId) ?? null;
  const selectedSlot = bookableSlots.find((slot) => slot._id === selectedSlotId) ?? null;

  useEffect(() => {
    if (selectedSlotId && isSlotPast(selectedDate, selectedSlot?.startTime)) {
      setSelectedSlotId("");
    }
  }, [selectedSlotId, selectedDate, selectedSlot?.startTime, nowTick]);

  const bookingTotal = useMemo(() => {
    if (selectedPackage) return selectedPackage.pricePerSlot;
    if (selectedResource) return selectedResource.pricePerHour ?? 0;
    return 0;
  }, [selectedPackage, selectedResource]);

  const bookMutation = useMutation({
    mutationFn: async () => {
      const booking = await api("/api/bookings", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          slotId: selectedSlotId,
          idempotencyKey: `${selectedSlotId}-${Date.now()}`,
        }),
      });

      const payment = await api("/api/payments/initiate", {
        method: "POST",
        headers: {
          ...authHeaders(token),
          "x-idempotency-key": `sslcommerz-${booking._id}-${Date.now()}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          provider: DEFAULT_ONLINE_PAYMENT_PROVIDER,
        }),
      });

      return payment;
    },
    onSuccess: (payment) => {
      setFeedback("Booking confirmed! Opening SSLCommerz payment...");
      if (payment?.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      }
      setSelectedSlotId("");
      slotsQuery.refetch();
    },
    onError: (error) => {
      if (error?.status === 401) {
        navigate("/auth/login", {
          state: { from: "/#venues", notice: getBookingAuthMessage(error) },
        });
        return;
      }
      setFeedback(getBookingAuthMessage(error) || "Booking failed. Please try again.");
    },
  });

  const handleSelectVenue = (resourceId) => {
    setSelectedResourceId(resourceId);
    setSelectedPackageId("");
    setSelectedSlotId("");
    setFeedback("");
  };

  const handleConfirmBooking = () => {
    if (!token) {
      navigate("/auth/login", { state: { from: "/#venues", notice: "Please log in to book a venue." } });
      return;
    }
    if (user?.role && user.role !== "user") {
      setFeedback("Only customer accounts can book venues. Log in with a user account.");
      return;
    }
    if (!guestName.trim() || !guestPhone.trim()) {
      setFeedback("Please enter your name and phone number.");
      return;
    }
    if (!selectedSlotId) {
      setFeedback("Please select a time slot first.");
      return;
    }
    setFeedback("");
    bookMutation.mutate();
  };

  const bookingSummary = selectedSlot
    ? `${selectedFormat} · ${selectedPackage ? `${selectedPackage.durationMinutes} min` : "60 min"} · ${formatTime12h(selectedSlot.startTime)}`
    : "Select a time slot";

  return (
    <section id="venues" className="scroll-mt-24 bg-ds-bg py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <HomeSectionHeading
            align="left"
            className="mb-0"
            eyebrow="Court Booking"
            title="Reserve Your Pitch"
          />
          <Link
            to="/discover"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ds-accent py-2 pl-5 pr-1.5 text-sm font-bold text-ds-dark transition hover:bg-[#b8ef1a]"
          >
            View All Courts
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ds-dark/15 text-base">→</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="space-y-3">
            {visibleResources.map((resource, index) => {
              const status = getVenueStatus(slotPreviews[index]?.data ?? [], selectedDate, slotPreviews[index]?.isLoading);
              const isSelected = selectedResourceId === resource._id;

              return (
                <button
                  key={resource._id}
                  type="button"
                  onClick={() => handleSelectVenue(resource._id)}
                  className={`relative w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                    isSelected
                      ? "border-ds-accent border-l-[5px] pl-[calc(1.25rem-1px)] shadow-md"
                      : "border-slate-200"
                  }`}
                >
                  <span
                    className={`absolute right-4 top-4 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase ${
                      status.available ? "bg-ds-accent text-ds-dark" : "bg-red-500 text-white"
                    }`}
                  >
                    {status.label}
                  </span>

                  <h3 className="pr-28 text-lg font-extrabold uppercase tracking-wide text-ds-secondary">
                    {resource.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ds-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <FiMapPin className="shrink-0 text-ds-primary" />
                      {resource.locationName}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiLayers className="shrink-0 text-ds-primary" />
                      {getSurfaceLabel((resource.type || "").toLowerCase())}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiUsers className="shrink-0 text-ds-primary" />
                      {FORMAT_OPTIONS[0]}
                    </span>
                  </div>
                </button>
              );
            })}

            {!resources.length ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-ds-muted">
                Venues will appear once companies are added to the platform.
              </p>
            ) : null}

            {hasMore ? (
              <div className="pt-2">
                <button
                  type="button"
                  className="text-sm font-bold uppercase tracking-wide text-ds-primary hover:text-ds-secondary"
                  onClick={() => setShowAll((prev) => !prev)}
                >
                  {showAll ? "Show Less" : `See More (${resources.length - MAX_VISIBLE} more)`}
                </button>
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xl lg:sticky lg:top-24">
            {selectedResource ? (
              <>
                <h3 className="text-xl font-extrabold uppercase tracking-wide text-ds-secondary">
                  Book {selectedResource.name}
                </h3>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <DsFieldLabel>Name</DsFieldLabel>
                    <DsInput
                      type="text"
                      placeholder="Enter name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <DsFieldLabel>Phone Number</DsFieldLabel>
                    <DsInput
                      type="tel"
                      placeholder="Enter phone number"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <DsFieldLabel>Date</DsFieldLabel>
                    <div className="relative">
                      <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <DsInput
                        type="date"
                        className="pl-10"
                        min={new Date().toISOString().slice(0, 10)}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlotId("");
                        }}
                      />
                    </div>
                  </label>
                  <label className="block">
                    <DsFieldLabel>Format</DsFieldLabel>
                    <DsSelect
                      value={selectedFormat}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedFormat(value);
                        const pkg = packages.find((item) => item.name === value);
                        setSelectedPackageId(pkg?._id ?? "");
                        setSelectedSlotId("");
                      }}
                    >
                      {FORMAT_OPTIONS.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg.name}>
                          {pkg.name}
                        </option>
                      ))}
                    </DsSelect>
                  </label>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-ds-secondary">Select Time Slot</p>
                  {slotsQuery.isLoading ? (
                    <p className="text-sm text-ds-muted">Loading slots...</p>
                  ) : bookableSlots.length ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {bookableSlots.map((slot) => {
                        const isAvailable = slot.status === "available";
                        const isSelected = selectedSlotId === slot._id;

                        return (
                          <button
                            key={slot._id}
                            type="button"
                            disabled={!isAvailable}
                            className={`m-0 w-auto min-h-0 rounded-lg border px-2 py-2.5 text-xs font-bold transition ${
                              isSelected
                                ? "border-ds-accent bg-ds-accent text-ds-dark"
                                : isAvailable
                                  ? "border-slate-200 bg-white text-ds-secondary hover:border-ds-accent"
                                  : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                            }`}
                            onClick={() => isAvailable && setSelectedSlotId(slot._id)}
                          >
                            {formatTime12h(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-ds-muted">
                      No slots available for this date.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#eef2ee] px-4 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ds-muted">Booking Total</p>
                    <p className="mt-1 text-sm text-ds-secondary">{bookingSummary}</p>
                  </div>
                  <p className="text-2xl font-extrabold text-ds-secondary">{bookingTotal} BDT</p>
                </div>

                {feedback ? <p className="mt-3 text-sm text-ds-muted">{feedback}</p> : null}

                <button
                  type="button"
                  className="mt-4 m-0 w-full min-h-0 rounded-xl bg-ds-accent py-3.5 text-sm font-bold uppercase tracking-wide text-ds-dark transition hover:bg-[#b8ef1a] disabled:opacity-60"
                  onClick={handleConfirmBooking}
                  disabled={bookMutation.isPending || !selectedSlotId}
                >
                  {bookMutation.isPending ? "Processing..." : "Confirm Booking"}
                </button>

                <button
                  type="button"
                  className="mt-3 m-0 w-full min-h-0 bg-transparent text-center text-xs font-semibold uppercase tracking-wide text-ds-primary hover:underline"
                  onClick={() => navigate(`/venue/${selectedResource._id}`)}
                >
                  View full venue page
                </button>
              </>
            ) : (
              <p className="text-sm text-ds-muted">Select a venue to start booking.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
