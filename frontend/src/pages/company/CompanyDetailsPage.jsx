import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function CompanyDetailsPage() {
  const { resourceId = "" } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const detailsQuery = useQuery({
    queryKey: ["company-details-page", resourceId],
    enabled: Boolean(resourceId),
    queryFn: () => api(`/api/resources/${resourceId}`),
  });

  const slotsQuery = useQuery({
    queryKey: ["company-details-slots", resourceId, selectedDate],
    enabled: Boolean(resourceId && selectedDate),
    queryFn: () => api(`/api/slots?resourceId=${resourceId}&date=${selectedDate}`),
  });

  const details = detailsQuery.data;
  const resource = details?.resource;
  const availableSlots = useMemo(() => (slotsQuery.data ?? []).filter((slot) => slot.status === "available"), [slotsQuery.data]);
  const rating = details?.rating?.avg ?? 0;

  return (
    <main className="space-y-4 pb-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm">
          <Link to="/">← Back to home</Link>
        </p>
        {detailsQuery.isLoading ? <p>Loading company details...</p> : null}
        {detailsQuery.isError ? <p>Failed to load company details.</p> : null}

        {resource ? (
          <>
            <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={resource.images?.[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80"}
                  alt={resource.name}
                  className="h-72 w-full object-cover"
                />
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h1 className="text-2xl font-extrabold text-slate-900">{resource.name}</h1>
                <p className="text-sm text-slate-600">{resource.locationName}</p>
                <p className="text-sm">
                  <span className="font-semibold text-amber-500">
                    {"★".repeat(Math.max(1, Math.min(5, Math.round(rating))))}
                  </span>{" "}
                  <span className="text-slate-700">({details?.rating?.total ?? 0} reviews)</span>
                </p>
                <p className="text-sm text-slate-700">
                  Type: <strong className="uppercase">{resource.type}</strong>
                </p>
                <p className="text-sm text-slate-700">
                  Price: <strong>{resource.pricePerHour ?? 0} BDT/hour</strong>
                </p>
                <p className="text-sm text-slate-700">Facilities: {(resource.facilities ?? []).join(", ") || "N/A"}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.locationName || resource.name || "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Visit on Map
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Book Your Slot</h2>
              <div className="mb-3 max-w-[220px]">
                <label className="mb-1 block text-sm text-slate-600">Select Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </div>
              {slotsQuery.isLoading ? <p className="text-sm text-slate-600">Loading slots...</p> : null}
              {!slotsQuery.isLoading ? (
                availableSlots.length ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <span key={slot._id} className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No available slot on selected date.</p>
                )
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
