import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { FiArrowRight, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import { HomeSectionHeading } from "../shared/HomeUi";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80";
const MAX_VISIBLE = 9;

function toTypeLabel(type) {
  if (type === "turf") return "Football";
  if (type === "pool") return "Swimming";
  if (type === "cricket") return "Cricket";
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Sports";
}

function getSurfaceLabel(type) {
  if (type === "turf") return "Artificial Turf";
  if (type === "pool") return "Aquatic";
  return "Hybrid Grass";
}

export default function AllVenuesSection({ resources = [] }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [feedback, setFeedback] = useState("");

  const visibleResources = showAll ? resources : resources.slice(0, MAX_VISIBLE);
  const hasMore = resources.length > MAX_VISIBLE;
  const selectedResource = resources.find((r) => r._id === selectedResourceId) ?? null;

  useEffect(() => {
    if (resources.length && !selectedResourceId) {
      setSelectedResourceId(resources[0]._id);
    }
  }, [resources, selectedResourceId]);

  const slotPreviews = useQueries({
    queries: visibleResources.map((resource) => ({
      queryKey: ["reserve-preview", resource._id, selectedDate],
      queryFn: () => api(`/api/slots?resourceId=${resource._id}&date=${selectedDate}`),
      enabled: Boolean(resource._id && selectedDate),
    })),
  });

  const packagesQuery = useQuery({
    queryKey: ["reserve-packages", selectedResourceId],
    enabled: Boolean(selectedResourceId),
    queryFn: () => api(`/api/packages?resourceId=${selectedResourceId}`),
  });

  const slotsQuery = useQuery({
    queryKey: ["reserve-slots", selectedResourceId, selectedDate],
    enabled: Boolean(selectedResourceId && selectedDate),
    queryFn: () => api(`/api/slots?resourceId=${selectedResourceId}&date=${selectedDate}`),
  });

  const packages = packagesQuery.data ?? [];
  const availableSlots = (slotsQuery.data ?? []).filter((slot) => slot.status === "available");
  const selectedPackage = packages.find((pkg) => pkg._id === selectedPackageId) ?? null;
  const selectedSlot = availableSlots.find((slot) => slot._id === selectedSlotId) ?? null;

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
          "x-idempotency-key": `bkash-${booking._id}-${Date.now()}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          provider: "bkash",
        }),
      });

      return payment;
    },
    onSuccess: (payment) => {
      setFeedback("Booking confirmed! Opening payment...");
      if (payment?.checkoutUrl) {
        window.open(payment.checkoutUrl, "_blank", "noopener,noreferrer");
      }
      setSelectedSlotId("");
      slotsQuery.refetch();
    },
    onError: (error) => {
      setFeedback(error?.message || "Booking failed. Please try again.");
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
      navigate("/auth/login");
      return;
    }
    if (!selectedSlotId) {
      setFeedback("Please select a time slot first.");
      return;
    }
    setFeedback("");
    bookMutation.mutate();
  };

  const getVenueStatus = (index) => {
    const slots = slotPreviews[index]?.data ?? [];
    const available = slots.some((slot) => slot.status === "available");
    if (slotPreviews[index]?.isLoading) return { label: "Checking...", tone: "bg-slate-500" };
    return available
      ? { label: "Available", tone: "bg-[#097E52]" }
      : { label: "Busy", tone: "bg-amber-600" };
  };

  return (
    <section id="venues" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <HomeSectionHeading
          align="left"
          eyebrow="Court Booking"
          title="Reserve Your"
          accent="Pitch"
          description="Select a venue, pick your date and time slot, then confirm your booking instantly."
        />
        <Link
          to="/discover"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#097E52] hover:text-[#192335]"
        >
          View All Courts
          <FiArrowRight />
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleResources.map((resource, index) => {
              const status = getVenueStatus(index);
              const isSelected = selectedResourceId === resource._id;
              return (
                <button
                  key={resource._id}
                  type="button"
                  onClick={() => handleSelectVenue(resource._id)}
                  className={`overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:shadow-md ${
                    isSelected ? "border-[#097E52] ring-2 ring-[#097E52]/20" : "border-slate-200"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={resource.images?.[0] || FALLBACK_IMAGE}
                      alt={resource.name}
                      className="h-full w-full object-cover"
                    />
                    <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase text-white ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-extrabold uppercase tracking-wide text-[#192335]">{resource.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <FiMapPin className="shrink-0 text-[#097E52]" />
                      {resource.locationName}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                        {getSurfaceLabel((resource.type || "").toLowerCase())}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                        {toTypeLabel((resource.type || "sports").toLowerCase())}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {!resources.length ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
              Venues will appear once companies are added to the platform.
            </p>
          ) : null}

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="rounded-md border-2 border-[#097E52] px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-[#097E52] transition hover:bg-[#097E52] hover:text-white"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Show Less" : `See More (${resources.length - MAX_VISIBLE} more)`}
              </button>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-lg lg:sticky lg:top-24">
          {selectedResource ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-[#097E52]">Book Now</p>
              <h3 className="mt-1 text-lg font-extrabold uppercase text-[#192335]">{selectedResource.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{selectedResource.locationName}</p>

              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <FiCalendar className="text-[#097E52]" />
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#192335] outline-none focus:border-[#097E52] focus:ring-2 focus:ring-[#097E52]/20"
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlotId("");
                    }}
                  />
                </div>

                {packages.length ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                      Format / Package
                    </label>
                    <select
                      className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#192335] outline-none focus:border-[#097E52]"
                      value={selectedPackageId}
                      onChange={(e) => setSelectedPackageId(e.target.value)}
                    >
                      <option value="">Standard hourly</option>
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.name} — {pkg.durationMinutes} min — {pkg.pricePerSlot} BDT
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <FiClock className="text-[#097E52]" />
                    Select Time Slot
                  </label>
                  {slotsQuery.isLoading ? (
                    <p className="text-sm text-slate-500">Loading slots...</p>
                  ) : availableSlots.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot._id}
                          type="button"
                          className={`rounded-md border px-2 py-2 text-xs font-bold transition ${
                            selectedSlotId === slot._id
                              ? "border-[#097E52] bg-[#097E52] text-white"
                              : "border-slate-200 bg-slate-50 text-[#192335] hover:border-[#097E52]"
                          }`}
                          onClick={() => setSelectedSlotId(slot._id)}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500">
                      No slots available for this date.
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-[#192335] p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Booking Total</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {selectedSlot
                      ? `${selectedSlot.startTime} – ${selectedSlot.endTime}`
                      : "Select a time slot"}
                    {selectedPackage ? ` · ${selectedPackage.name}` : ""}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-[#A4DA01]">{bookingTotal} BDT</p>
                </div>

                {feedback ? <p className="text-sm text-slate-600">{feedback}</p> : null}

                <button
                  type="button"
                  className="w-full rounded-md bg-[#097E52] py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#192335] disabled:opacity-60"
                  onClick={handleConfirmBooking}
                  disabled={bookMutation.isPending || !selectedSlotId}
                >
                  {bookMutation.isPending ? "Processing..." : "Confirm Booking"}
                </button>

                <button
                  type="button"
                  className="w-full text-center text-xs font-semibold uppercase tracking-wide text-[#097E52] hover:underline"
                  onClick={() => navigate(`/venue/${selectedResource._id}`)}
                >
                  View full venue page
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a venue to start booking.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
