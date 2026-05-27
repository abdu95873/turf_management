import { useMemo } from "react";
import MarqueeImport from "react-fast-marquee";

const Marquee = MarqueeImport?.default ?? MarqueeImport;
const FALLBACK_LOGO = "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=200&q=80";

export default function OurPartnerSection({ resources = [], onSelectCompany }) {
  const companyItems = useMemo(() => {
    if (!resources.length) return [];
    return resources.map((resource) => ({
      id: resource._id,
      name: resource.name || "Unnamed Company",
      logo: resource.logo || resource.logoUrl || resource.images?.[0] || FALLBACK_LOGO,
      type: resource.type || "sports",
    }));
  }, [resources]);

  return (
    <section id="all-companies">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Our Partner</h2>
      <p className="mb-4 text-slate-600">Browse all companies/venues and choose one to continue booking.</p>
      {companyItems.length ? (
        <div className="overflow-hidden rounded-xl bg-white py-2">
          <Marquee autoFill pauseOnHover speed={32} gradient={false}>
            {companyItems.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => onSelectCompany?.(company.id)}
                className="mx-8 flex w-44 flex-col items-center justify-center gap-1 bg-transparent p-0"
                style={{
                  width: "11rem",
                  marginTop: 0,
                  minHeight: "5rem",
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  color: "inherit",
                }}
                aria-label={company.name}
              >
                <img src={company.logo} alt={`${company.name} logo`} className="h-12 w-full object-contain" />
                <p className="max-w-full truncate text-center text-xs font-semibold text-slate-700">{company.name}</p>
              </button>
            ))}
          </Marquee>
        </div>
      ) : (
        <p>Company list will appear after venues are added.</p>
      )}
    </section>
  );
}
