import { useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { buildCategoriesFromResources, FALLBACK_VENUE_IMAGE, toCategoryLabel } from "./categoryMeta";
import "./DiscoverVenuesPage.css";

export default function DiscoverVenuesPage() {
  const [city, setCity] = useState("");

  const resourcesQuery = useQuery({
    queryKey: ["discover-page-resources", city],
    queryFn: () => api(`/api/resources${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  });

  const resources = resourcesQuery.data ?? [];
  const categories = useMemo(() => buildCategoriesFromResources(resources), [resources]);

  return (
    <main className="discover-page min-h-screen font-sans antialiased">
      <section className="discover-hero">
        <div className="discover-hero-inner">
          <Link to="/" className="discover-back-link">
            <FiArrowLeft />
            Back to Home
          </Link>
          <span className="discover-eyebrow">Discover</span>
          <h1 className="discover-hero-title">
            Find Your <span>Perfect Venue</span>
          </h1>
          <p className="discover-hero-copy">
            Browse every venue in one place. Filter by city or jump into a category for sport-specific listings.
          </p>
        </div>
      </section>

      <div className="discover-body">
        <div className="discover-filters discover-filters-single">
          <div className="discover-field">
            <label htmlFor="discover-city">Search by city or area</label>
            <input
              id="discover-city"
              type="text"
              placeholder="e.g. Dhaka, Gulshan..."
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
        </div>

        {categories.length ? (
          <>
            <h2 className="discover-section-title">Browse By Category</h2>
            <p className="discover-hint">Quick filters — open a category to see only those venues.</p>
            <div className="discover-categories">
              {categories.map((category) => (
                <Link key={category.key} to={`/discover/${category.key}`} className="discover-category-card">
                  <div>
                    <strong>{category.title}</strong>
                    <small>
                      {category.subtitle}
                      {` · ${category.count} venue${category.count === 1 ? "" : "s"}`}
                    </small>
                  </div>
                  <span className="discover-category-icon" aria-hidden="true">
                    {category.icon}
                  </span>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="discover-section-title">
          All Venues
          {!resourcesQuery.isLoading && resources.length ? (
            <span className="discover-venue-count"> ({resources.length})</span>
          ) : null}
        </h2>

        {resourcesQuery.isLoading ? <p className="discover-status">Loading venues...</p> : null}
        {resourcesQuery.isError ? (
          <p className="discover-status error">Failed to load venues. Please try again.</p>
        ) : null}

        {!resourcesQuery.isLoading && !resourcesQuery.isError ? (
          resources.length ? (
            <div className="discover-venues-grid">
              {resources.map((resource) => (
                <Link key={resource._id} to={`/venue/${resource._id}`} className="discover-venue-card">
                  <div className="discover-venue-image">
                    <img
                      src={resource.images?.[0] || FALLBACK_VENUE_IMAGE}
                      alt={resource.name}
                      loading="lazy"
                    />
                    <span className="discover-venue-badge">{toCategoryLabel(resource.type)}</span>
                  </div>
                  <div className="discover-venue-body">
                    <h3>{resource.name}</h3>
                    {resource.locationName ? (
                      <p className="discover-venue-location">
                        <FiMapPin />
                        {resource.locationName}
                      </p>
                    ) : null}
                    <div className="discover-venue-meta">
                      <span className="discover-venue-price">
                        From <span>{resource.pricePerHour ?? "—"} BDT</span> / hr
                      </span>
                      <span className="discover-venue-cta">
                        View venue
                        <FiArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="discover-empty">
              No venues found{city ? ` in "${city}"` : ""}. Try another city or check back later.
            </p>
          )
        ) : null}
      </div>
    </main>
  );
}
