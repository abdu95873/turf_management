import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiArrowRight, FiMapPin, FiSearch } from "react-icons/fi";
import { api } from "../../../lib/api";

export default function DiscoverySection({ onSelect }) {
  const [city, setCity] = useState("");
  const resourcesQuery = useQuery({
    queryKey: ["home-discover-resources", city],
    queryFn: () => api(`/api/resources${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  });

  const resources = resourcesQuery.data ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-600">Discover</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Find Venues Near You</h2>
        <p className="mt-2 text-slate-600">Filter by city and explore available turfs and sports facilities.</p>
      </div>

      <div className="relative mb-6 mt-5 max-w-md">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
          placeholder="Filter by city or area..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {resourcesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : null}

      {resourcesQuery.isError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load venues. Please try again.
        </p>
      ) : null}

      {!resourcesQuery.isLoading && !resourcesQuery.isError ? (
        resources.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {resources.map((resource) => (
              <article
                key={resource._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-violet-200 hover:bg-white hover:shadow-sm"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-900">{resource.name}</h3>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
                    <FiMapPin className="shrink-0" />
                    {resource.locationName}
                  </p>
                  <p className="mt-1 text-xs font-medium text-violet-700">{resource.pricePerHour} BDT/h</p>
                </div>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
                  onClick={() => onSelect(resource._id)}
                >
                  Details
                  <FiArrowRight />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            No venues found{city ? ` in "${city}"` : ""}.
          </p>
        )
      ) : null}
    </section>
  );
}
