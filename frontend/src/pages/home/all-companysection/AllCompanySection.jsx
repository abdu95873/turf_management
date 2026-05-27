import { useNavigate } from "react-router-dom";

export default function AllCompanySection({
  areaOptions = [],
  selectedArea = "",
  onSelectArea,
  selectedTimeBand = "evening",
  onSelectTimeBand,
  filteredCompanies = [],
  onChooseTopCompany,
}) {
  const navigate = useNavigate();

  return (
    <>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-slate-600">Area</label>
          <select value={selectedArea} onChange={(e) => onSelectArea?.(e.target.value)} disabled={!areaOptions.length}>
            <option value="">Select Area</option>
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-600">Preferred Time</label>
          <select value={selectedTimeBand} onChange={(e) => onSelectTimeBand?.(e.target.value)}>
            <option value="morning">Morning (6am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 10pm)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="ghost" onClick={() => onChooseTopCompany?.(filteredCompanies[0]?._id || "")} disabled={!filteredCompanies.length}>
            Choose Top Company
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {filteredCompanies.slice(0, 4).map((resource) => (
          <div key={resource._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 overflow-hidden rounded-lg bg-slate-100">
              <img
                src={resource.images?.[0] || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80"}
                alt={resource.name}
                className="h-36 w-full object-cover"
              />
            </div>

            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-amber-500">
                {"★".repeat(Math.max(1, Math.min(5, Math.round(resource.rating?.avg ?? resource.avgRating ?? 0))))}
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700">
                {(resource.type || "sports").toString()}
              </span>
            </div>

            <h3 className="line-clamp-1 text-lg font-bold text-slate-900">{resource.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{resource.locationName || "Address not available"}</p>

            <div className="mt-4 flex gap-2">
              <button
                className="ghost text-xs"
                style={{ width: "auto", marginTop: 0, minHeight: "32px", padding: "6px 10px" }}
                onClick={() => navigate(`/company/${resource._id}`)}
              >
                See More
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.locationName || resource.name || "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Visit
              </a>
            </div>
          </div>
        ))}
        {!filteredCompanies.length ? <p>No company found for selected category/area.</p> : null}
      </div>
    </>
  );
}
