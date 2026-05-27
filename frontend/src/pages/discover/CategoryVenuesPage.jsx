import { useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiCalendar, FiMapPin } from "react-icons/fi";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import BookingPaymentPanel from "../../components/booking/BookingPaymentPanel";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { FALLBACK_VENUE_IMAGE, filterResourcesByCategory, getCategoryMeta, normalizeCategoryKey, toCategoryLabel } from "./categoryMeta";
import "./CategoryVenuesPage.css";

export default function CategoryVenuesPage() {
  const { token } = useAuth();
  const { categoryKey = "" } = useParams();
  const navigate = useNavigate();
  const normalizedCategory = normalizeCategoryKey(categoryKey);
  const categoryMeta = getCategoryMeta(normalizedCategory);
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const dateInputRef = useRef(null);
  const selectedDivision = searchParams.get("division") ?? "";
  const selectedDistrict = searchParams.get("district") ?? "";
  const selectedThana = searchParams.get("thana") ?? "";
  const selectedArea = searchParams.get("area") ?? "";

  const resourcesQuery = useQuery({
    queryKey: ["category-venues", normalizedCategory],
    queryFn: () => api("/api/resources"),
  });

  const categoryResources = useMemo(() => {
    return filterResourcesByCategory(resourcesQuery.data ?? [], normalizedCategory);
  }, [resourcesQuery.data, normalizedCategory]);

  const normalizedResources = useMemo(() => {
    return categoryResources.map((resource) => {
      const explicitDivision = resource.division || "";
      const explicitDistrict = resource.district || "";
      const explicitThana = resource.thana || "";
      const explicitArea = resource.area || "";

      const parts = String(resource.locationName || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      const parsedArea = parts[0] || "";
      const parsedThana = parts[1] || "";
      const parsedDistrict = parts[2] || "";
      const parsedDivision = parts[3] || "";

      return {
        ...resource,
        division: explicitDivision || parsedDivision,
        district: explicitDistrict || parsedDistrict,
        thana: explicitThana || parsedThana,
        area: explicitArea || parsedArea || resource.locationName || "",
      };
    });
  }, [categoryResources]);

  const divisionOptions = useMemo(() => {
    return Array.from(new Set(normalizedResources.map((resource) => resource.division).filter(Boolean)));
  }, [normalizedResources]);

  const districtOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedResources
          .filter((resource) => (selectedDivision ? resource.division === selectedDivision : true))
          .map((resource) => resource.district)
          .filter(Boolean)
      )
    );
  }, [normalizedResources, selectedDivision]);

  const thanaOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedResources
          .filter((resource) => (selectedDivision ? resource.division === selectedDivision : true))
          .filter((resource) => (selectedDistrict ? resource.district === selectedDistrict : true))
          .map((resource) => resource.thana)
          .filter(Boolean)
      )
    );
  }, [normalizedResources, selectedDivision, selectedDistrict]);

  const areaOptions = useMemo(() => {
    return Array.from(
      new Set(
        normalizedResources
          .filter((resource) => (selectedDivision ? resource.division === selectedDivision : true))
          .filter((resource) => (selectedDistrict ? resource.district === selectedDistrict : true))
          .filter((resource) => (selectedThana ? resource.thana === selectedThana : true))
          .map((resource) => resource.area)
          .filter(Boolean)
      )
    );
  }, [normalizedResources, selectedDivision, selectedDistrict, selectedThana]);

  const filteredResources = useMemo(() => {
    return normalizedResources
      .filter((resource) => (selectedDivision ? resource.division === selectedDivision : true))
      .filter((resource) => (selectedDistrict ? resource.district === selectedDistrict : true))
      .filter((resource) => (selectedThana ? resource.thana === selectedThana : true))
      .filter((resource) => (selectedArea ? resource.area === selectedArea : true));
  }, [normalizedResources, selectedDivision, selectedDistrict, selectedThana, selectedArea]);

  const setFilterParam = (key, value, resetKeys = []) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    resetKeys.forEach((resetKey) => nextParams.delete(resetKey));
    setSearchParams(nextParams);
  };

  const slotsQuery = useQuery({
    queryKey: ["category-slots", selectedResourceId, selectedDate],
    enabled: Boolean(selectedResourceId && selectedDate),
    queryFn: () => api(`/api/slots?resourceId=${selectedResourceId}&date=${selectedDate}`),
  });

  const selectedResource = useMemo(() => {
    return filteredResources.find((resource) => resource._id === selectedResourceId) ?? null;
  }, [filteredResources, selectedResourceId]);

  const availableSlots = useMemo(() => {
    return (slotsQuery.data ?? []).filter((slot) => slot.status === "available");
  }, [slotsQuery.data]);

  const filteredResourceIdsKey = useMemo(() => {
    return filteredResources.map((resource) => resource._id).sort().join(",");
  }, [filteredResources]);

  const venueSlotPreviewQuery = useQuery({
    queryKey: ["venue-slot-preview", filteredResourceIdsKey, selectedDate],
    enabled: Boolean(filteredResources.length && selectedDate),
    queryFn: async () => {
      const rows = await Promise.all(
        filteredResources.map(async (resource) => {
          const slots = await api(`/api/slots?resourceId=${resource._id}&date=${selectedDate}`);
          const available = (slots ?? []).filter((slot) => slot.status === "available");
          const firstSlot = available[0] ?? null;
          return {
            resourceId: resource._id,
            startTime: firstSlot?.startTime ?? null,
            endTime: firstSlot?.endTime ?? null,
            status: firstSlot ? "available" : "unavailable",
          };
        })
      );
      return rows;
    },
  });

  const venueSlotPreviewMap = useMemo(() => {
    const map = new Map();
    (venueSlotPreviewQuery.data ?? []).forEach((item) => {
      map.set(item.resourceId, item);
    });
    return map;
  }, [venueSlotPreviewQuery.data]);

  const handleSelectVenue = (resourceId) => {
    setSelectedResourceId(resourceId);
    setSelectedSlotId("");
    setFeedback("");
  };

  const handleQuickBook = () => {
    if (!token) {
      navigate("/auth/login");
    }
  };

  const handlePaymentComplete = () => {
    setSelectedSlotId("");
    setFeedback("Booking request submitted successfully.");
    slotsQuery.refetch();
    venueSlotPreviewQuery.refetch();
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;
    if (typeof dateInputRef.current.showPicker === "function") {
      dateInputRef.current.showPicker();
    } else {
      dateInputRef.current.focus();
    }
  };

  const getPreviewStatus = (resourceId) => {
    if (venueSlotPreviewQuery.isLoading) return { label: "Checking", className: "loading" };
    const preview = venueSlotPreviewMap.get(resourceId);
    if (preview?.status === "available") return { label: "Available", className: "available" };
    return { label: "Full", className: "unavailable" };
  };

  return (
    <main className="category-page">
      <section className="category-hero">
        <div
          className="category-hero-bg"
          style={{ backgroundImage: `url(${categoryMeta.image})` }}
          aria-hidden="true"
        />
        <div className="category-hero-overlay" aria-hidden="true" />
        <div className="category-hero-inner">
          <Link to="/discover" className="category-back-link">
            <FiArrowLeft />
            Back to Discover
          </Link>
          <div className="category-hero-row">
            <div className="category-hero-copy">
              <span className="category-eyebrow">{toCategoryLabel(normalizedCategory)} Venues</span>
              <h1 className="category-hero-title">{categoryMeta.title}</h1>
              <p className="category-hero-subtitle">{categoryMeta.subtitle}</p>
            </div>
            <span className="category-hero-icon" aria-hidden="true">
              {categoryMeta.icon}
            </span>
          </div>
        </div>
      </section>

      <div className="category-body">
        <div className="category-filters">
          <div className="category-field">
            <label htmlFor="filter-division">Division</label>
            <select
              id="filter-division"
              value={selectedDivision}
              onChange={(event) => setFilterParam("division", event.target.value, ["district", "thana", "area"])}
              disabled={!divisionOptions.length}
            >
              <option value="">All divisions</option>
              {divisionOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="category-field">
            <label htmlFor="filter-district">District</label>
            <select
              id="filter-district"
              value={selectedDistrict}
              onChange={(event) => setFilterParam("district", event.target.value, ["thana", "area"])}
              disabled={!districtOptions.length}
            >
              <option value="">All districts</option>
              {districtOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="category-field">
            <label htmlFor="filter-thana">Thana</label>
            <select
              id="filter-thana"
              value={selectedThana}
              onChange={(event) => setFilterParam("thana", event.target.value, ["area"])}
              disabled={!thanaOptions.length}
            >
              <option value="">All thana</option>
              {thanaOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="category-field">
            <label htmlFor="filter-area">Area</label>
            <select
              id="filter-area"
              value={selectedArea}
              onChange={(event) => setFilterParam("area", event.target.value)}
              disabled={!areaOptions.length}
            >
              <option value="">All areas</option>
              {areaOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="category-layout">
          <div>
            <div className="category-venues-head">
              <h2 className="category-section-title">
                {filteredResources.length} Venue{filteredResources.length === 1 ? "" : "s"} Found
              </h2>
              <label className="category-date-chip">
                <FiCalendar />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedSlotId("");
                  }}
                  onClick={openDatePicker}
                />
              </label>
            </div>

            {resourcesQuery.isLoading ? <p className="category-status">Loading venues...</p> : null}
            {resourcesQuery.isError ? (
              <p className="category-status error">Failed to load venues. Please try again.</p>
            ) : null}

            {!resourcesQuery.isLoading && !resourcesQuery.isError ? (
              filteredResources.length ? (
                <div className="category-venues-list">
                  {filteredResources.map((resource) => {
                    const preview = venueSlotPreviewMap.get(resource._id);
                    const status = getPreviewStatus(resource._id);
                    const isSelected = selectedResourceId === resource._id;

                    return (
                      <button
                        key={resource._id}
                        type="button"
                        className={`category-venue-item ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleSelectVenue(resource._id)}
                      >
                        <div className="category-venue-thumb">
                          <img
                            src={resource.images?.[0] || FALLBACK_VENUE_IMAGE}
                            alt={resource.name}
                            loading="lazy"
                          />
                          <span className={`category-venue-status ${status.className}`}>{status.label}</span>
                        </div>
                        <div className="category-venue-content">
                          <h3>{resource.name}</h3>
                          <p className="category-venue-location">
                            <FiMapPin />
                            {resource.locationName}
                          </p>
                          <div className="category-venue-meta">
                            <span className="category-venue-price">
                              <span>{resource.pricePerHour} BDT</span> / hour
                            </span>
                            {preview?.startTime ? (
                              <span className="category-venue-slot">
                                Next: {preview.startTime}
                                {preview.endTime ? ` – ${preview.endTime}` : ""}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
              <p className="category-empty">
                No {toCategoryLabel(normalizedCategory)} venues found for this category
                {selectedArea || selectedDistrict ? " and location filter" : ""}.
              </p>
              )
            ) : null}
          </div>

          <aside className="category-booking-panel">
            {selectedResource ? (
              <>
                <h3>Book Your Slot</h3>
                <p className="venue-name">{selectedResource.name}</p>

                <div className="category-booking-date">
                  <label htmlFor="booking-date">Select Date</label>
                  <input
                    id="booking-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      setSelectedSlotId("");
                    }}
                  />
                </div>

                <p className="category-slots-label">Available Time Slots</p>
                {slotsQuery.isLoading ? (
                  <p className="category-booking-empty">Loading slots...</p>
                ) : availableSlots.length ? (
                  <div className="category-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot._id}
                        type="button"
                        className={`category-slot-btn ${selectedSlotId === slot._id ? "is-selected" : ""}`}
                        onClick={() => setSelectedSlotId(slot._id)}
                      >
                        {slot.startTime} – {slot.endTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="category-booking-empty">No available slots for this date. Try another day.</p>
                )}

                {token ? (
                  <BookingPaymentPanel
                    slotId={selectedSlotId}
                    amount={selectedResource?.pricePerHour}
                    onComplete={handlePaymentComplete}
                  />
                ) : (
                  <button type="button" className="category-book-btn" onClick={handleQuickBook}>
                    Login to Book
                  </button>
                )}

                {feedback ? <p className="category-feedback">{feedback}</p> : null}

                <Link
                  to={`/venue/${selectedResource._id}`}
                  className="category-back-link"
                  style={{ marginTop: 16, marginBottom: 0 }}
                >
                  View full venue details →
                </Link>
              </>
            ) : (
              <div className="category-booking-empty">
                Select a venue from the list to view available slots and book instantly.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
