import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiCalendar, FiMapPin, FiStar } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { api, authHeaders } from "../../lib/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80";

function toTypeLabel(type) {
  if (type === "turf") return "Football";
  if (type === "pool") return "Swimming";
  if (type === "cricket") return "Cricket";
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Sports";
}

export default function CompanyLandingPage() {
  const { resourceId = "" } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [feedback, setFeedback] = useState("");

  const detailsQuery = useQuery({
    queryKey: ["company-landing", resourceId],
    enabled: Boolean(resourceId),
    queryFn: () => api(`/api/resources/${resourceId}`),
  });

  const packagesQuery = useQuery({
    queryKey: ["company-packages", resourceId],
    enabled: Boolean(resourceId),
    queryFn: () => api(`/api/packages?resourceId=${resourceId}`),
  });

  const slotsQuery = useQuery({
    queryKey: ["company-slots", resourceId, selectedDate],
    enabled: Boolean(resourceId && selectedDate),
    queryFn: () => api(`/api/slots?resourceId=${resourceId}&date=${selectedDate}`),
  });

  const bookMutation = useMutation({
    mutationFn: async (slotId) => {
      const booking = await api("/api/bookings", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          slotId,
          idempotencyKey: `${slotId}-${Date.now()}`,
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
      setFeedback("Booking created. Opening bKash checkout...");
      if (payment?.checkoutUrl) {
        window.open(payment.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: (error) => {
      setFeedback(error?.message || "Booking failed.");
    },
  });

  const resource = detailsQuery.data?.resource;
  const packages = packagesQuery.data ?? [];
  const availableSlots = (slotsQuery.data ?? []).filter((slot) => slot.status === "available");

  const handleBook = (slotId) => {
    if (!token) {
      navigate("/auth/login");
      return;
    }
    setFeedback("");
    bookMutation.mutate(slotId);
  };

  if (detailsQuery.isLoading) {
    return (
      <main className="mx-auto max-w-[1180px] px-4 py-10 md:px-6">
        <p className="text-slate-500">Loading company details...</p>
      </main>
    );
  }

  if (detailsQuery.isError || !resource) {
    return (
      <main className="mx-auto max-w-[1180px] px-4 py-10 md:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-500">
          <FiArrowLeft /> Back to home
        </Link>
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Company not found.
        </p>
      </main>
    );
  }

  const coverImage = resource.images?.[0] || FALLBACK_IMAGE;

  return (
    <main className="pb-10">
      <section className="relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw]">
        <div className="relative h-[280px] overflow-hidden md:h-[360px]">
          <img src={coverImage} alt={resource.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1180px] px-4 pb-8 md:px-6">
            <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white">
              <FiArrowLeft /> Back to home
            </Link>
            <span className="mb-2 inline-flex rounded-full bg-violet-500/90 px-3 py-1 text-xs font-semibold uppercase text-white">
              {toTypeLabel((resource.type || "sports").toLowerCase())}
            </span>
            <h1 className="text-3xl font-extrabold text-white md:text-5xl">{resource.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-slate-200">
              <FiMapPin />
              {resource.locationName}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-[1180px] space-y-8 px-4 md:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Price</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{resource.pricePerHour} BDT/h</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Rating</p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-extrabold text-slate-900">
              <FiStar className="text-amber-400" />
              {detailsQuery.data?.rating?.avg ?? 0}
            </p>
            <p className="text-xs text-slate-500">{detailsQuery.data?.rating?.total ?? 0} reviews</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Facilities</p>
            <p className="mt-2 text-sm text-slate-700">
              {(resource.facilities ?? []).join(" · ") || "No facilities listed yet."}
            </p>
          </div>
        </section>

        {packages.length ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Play Packages</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a package before booking your slot.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <article key={pkg._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase text-violet-600">{pkg.sportType}</p>
                  <h3 className="mt-1 font-bold text-slate-900">{pkg.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{pkg.durationMinutes} minutes</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{pkg.pricePerSlot} BDT</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Book a Slot</h2>
          <p className="mt-1 text-sm text-slate-600">Pick a date and choose an available time slot.</p>

          <div className="mt-4 max-w-xs">
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <FiCalendar />
              Select Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              min={new Date().toISOString().slice(0, 10)}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {feedback ? <p className="mt-4 text-sm text-slate-600">{feedback}</p> : null}

          {slotsQuery.isLoading ? <p className="mt-4 text-sm text-slate-500">Loading slots...</p> : null}

          {!slotsQuery.isLoading && availableSlots.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot._id}
                  type="button"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
                  onClick={() => handleBook(slot._id)}
                  disabled={bookMutation.isPending}
                >
                  <p className="font-bold text-slate-900">{slot.startTime} - {slot.endTime}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">Available · Book now</p>
                </button>
              ))}
            </div>
          ) : null}

          {!slotsQuery.isLoading && !availableSlots.length ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No available slots for this date.
            </p>
          ) : null}
        </section>

        {(detailsQuery.data?.reviews ?? []).length ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
            <ul className="mt-4 space-y-3">
              {(detailsQuery.data.reviews ?? []).map((review) => (
                <li key={review._id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-amber-500">{review.rating}★</span>
                  <span className="ml-2 text-slate-700">{review.comment || "No comment"}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <iframe
            title="map-preview"
            className="h-64 w-full"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(resource.locationName)}&z=15&output=embed`}
            loading="lazy"
          />
        </section>
      </div>
    </main>
  );
}
