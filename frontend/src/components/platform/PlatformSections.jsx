import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api, API_BASE, authHeaders } from "../../lib/api";
import { downloadBookingInvoice } from "../../lib/bookings";
import {
  DEFAULT_ONLINE_PAYMENT_PROVIDER,
  initiateOnlinePayment,
  paymentStatusLabel,
  submitManualPayment,
  verifySandboxPayment,
} from "../../lib/payments";

export function LinkButton({ label, onClick }) {
  return (
    <button type="button" className="ghost" onClick={onClick}>
      {label}
    </button>
  );
}

export function DiscoveryPanel({ onSelect }) {
  const [city, setCity] = useState("");
  const resourcesQuery = useQuery({
    queryKey: ["discover-resources", city],
    queryFn: () => api(`/api/resources${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  });
  const resources = resourcesQuery.data ?? [];

  return (
    <section className="card">
      <h2>Discover Venues</h2>
      <input placeholder="Filter by city" value={city} onChange={(e) => setCity(e.target.value)} />
      {resourcesQuery.isLoading ? <p>Loading venues...</p> : null}
      {resourcesQuery.isError ? <p>Failed to load venues. Please try again.</p> : null}
      <ul>
        {resources.map((resource) => (
          <li key={resource._id}>
            <span>{resource.name} - {resource.locationName}</span>
            <LinkButton label="Details" onClick={() => onSelect(resource._id)} />
          </li>
        ))}
      </ul>
      {!resourcesQuery.isLoading && !resourcesQuery.isError && resources.length === 0 ? (
        <p>No venues found{city ? ` in "${city}"` : ""}.</p>
      ) : null}
    </section>
  );
}

export function PublicExploreSection() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeResourceId, setActiveResourceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const resourcesQuery = useQuery({
    queryKey: ["public-resources"],
    queryFn: () => api("/api/resources"),
  });

  const slotsQuery = useQuery({
    queryKey: ["public-slots", activeResourceId, date],
    enabled: Boolean(activeResourceId && date),
    queryFn: () => api(`/api/slots?resourceId=${activeResourceId}&date=${date}`),
  });

  return (
    <section className="card">
      <h2>Explore and Check Availability</h2>
      <div className="grid two">
        <div>
          <h3>Choose a Turf/Pool</h3>
          <ul>
            {(resourcesQuery.data ?? []).map((resource) => (
              <li key={resource._id}>
                <button className={activeResourceId === resource._id ? "active" : "ghost"} onClick={() => setActiveResourceId(resource._id)}>
                  {resource.name} - {resource.locationName} - {resource.pricePerHour} BDT/h
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Available Time Slots</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!activeResourceId} />
          <ul>
            {(slotsQuery.data ?? []).map((slot) => (
              <li key={slot._id}>
                <span>{slot.startTime} - {slot.endTime} ({slot.status})</span>
                {slot.status === "available" ? (
                  <button onClick={() => (token ? navigate("/discover") : navigate("/auth/login"))}>
                    {token ? "Go to Booking Dashboard" : "Login to Book"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ResourceDetails({ resourceId, canReview }) {
  const { token } = useAuth();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("5");
  const allResourcesQuery = useQuery({
    queryKey: ["resource-map-all"],
    queryFn: () => api("/api/resources"),
  });
  const detailsQuery = useQuery({
    queryKey: ["resource-details", resourceId],
    enabled: Boolean(resourceId),
    queryFn: () => api(`/api/resources/${resourceId}`),
  });
  const reviewMutation = useMutation({
    mutationFn: () =>
      api("/api/reviews", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          resourceId,
          rating: Number(rating),
          comment: reviewText,
        }),
      }),
    onSuccess: () => {
      detailsQuery.refetch();
      setReviewText("");
    },
  });

  const mapMarkers = useMemo(() => {
    return (allResourcesQuery.data ?? [])
      .map((resource) => ({
        id: resource._id,
        name: resource.name,
        locationName: resource.locationName,
        latitude: Number(resource.latitude),
        longitude: Number(resource.longitude),
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }, [allResourcesQuery.data]);

  if (!resourceId && !mapMarkers.length) return null;
  const details = detailsQuery.data;

  return (
    <section className="card">
      <h2>Resource Details</h2>
      <h3>All Listed Company Locations (Bangladesh)</h3>
      {allResourcesQuery.isLoading ? <p>Loading map markers...</p> : null}
      {allResourcesQuery.isError ? <p>Failed to load map markers.</p> : null}
      {!allResourcesQuery.isLoading && !allResourcesQuery.isError ? (
        mapMarkers.length ? (
          <MapContainer center={[23.685, 90.3563]} zoom={7} style={{ height: "420px", width: "100%", borderRadius: "12px" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {mapMarkers.map((marker) => (
              <CircleMarker
                key={marker.id}
                center={[marker.latitude, marker.longitude]}
                radius={7}
                pathOptions={{
                  color: "#0f766e",
                  fillColor: "#14b8a6",
                  fillOpacity: 0.85,
                  weight: 1,
                }}
              >
                <Popup>
                  <strong>{marker.name}</strong>
                  <br />
                  {marker.locationName}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : (
          <p>No resource has latitude/longitude yet, so no map marker to show.</p>
        )
      ) : null}
      {detailsQuery.isLoading ? <p>Loading details...</p> : null}
      {details?.resource ? (
        <>
          <p><strong>{details.resource.name}</strong> ({details.resource.type})</p>
          <p>Location: {details.resource.locationName}</p>
          <p>Price: {details.resource.pricePerHour} BDT / hour</p>
          <p>Facilities: {(details.resource.facilities ?? []).join(", ") || "N/A"}</p>
          <p>Rating: {details.rating?.avg ?? 0} ({details.rating?.total ?? 0} reviews)</p>
          <p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.resource.locationName)}`} target="_blank" rel="noreferrer">
              Open in Map
            </a>
          </p>
          <iframe
            title="map-preview"
            className="map-preview"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(details.resource.locationName)}&z=15&output=embed`}
            loading="lazy"
          />
          <h3>Reviews</h3>
          <ul>
            {(details.reviews ?? []).map((review) => (
              <li key={review._id}>
                <span>{review.rating}★ - {review.comment || "No comment"}</span>
              </li>
            ))}
          </ul>
          {canReview ? (
            <>
              <h3>Add Review</h3>
              <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
              <input placeholder="Write review" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
              <button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending || !token}>Submit Review</button>
            </>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function BookingHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [manualForms, setManualForms] = useState({});
  const [pendingPayments, setPendingPayments] = useState({});
  const historyQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api("/api/bookings/me", { headers: authHeaders(token) }),
  });
  const cancelMutation = useMutation({
    mutationFn: (bookingId) => api(`/api/bookings/me/${bookingId}/cancel`, { method: "PATCH", headers: authHeaders(token) }),
    onSuccess: () => historyQuery.refetch(),
  });
  const payMutation = useMutation({
    mutationFn: (bookingId) => initiateOnlinePayment(token, bookingId),
    onSuccess: (data, bookingId) => {
      setPendingPayments((current) => ({
        ...current,
        [bookingId]: { transactionId: data.transactionId, provider: DEFAULT_ONLINE_PAYMENT_PROVIDER },
      }));
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      historyQuery.refetch();
    },
  });
  const manualMutation = useMutation({
    mutationFn: ({ bookingId, transactionId, note }) => submitManualPayment(token, bookingId, transactionId, note),
    onSuccess: () => historyQuery.refetch(),
  });
  const verifyMutation = useMutation({
    mutationFn: ({ transactionId, provider }) => verifySandboxPayment(transactionId, provider, token),
    onSuccess: () => historyQuery.refetch(),
  });

  const downloadInvoice = (bookingId) => downloadBookingInvoice(bookingId, token);

  return (
    <section className="card">
      <h2>Booking History</h2>
      <ul className="space-y-4">
        {(historyQuery.data ?? []).map((booking) => {
          const pendingPayment = pendingPayments[booking._id];
          const manualForm = manualForms[booking._id] ?? { transactionId: "", note: "" };

          return (
            <li key={booking._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">
                  {booking.bookingDate} {booking.startTime}-{booking.endTime}
                </span>
                <span className="text-xs font-bold uppercase text-ds-primary">{paymentStatusLabel(booking.paymentStatus)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Booking: {booking.bookingStatus} · {booking.amount} BDT
              </p>
              {booking.manualTransactionId ? (
                <p className="mt-1 text-xs text-slate-500">Trx ID: {booking.manualTransactionId}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {booking.paymentStatus === "paid" ? (
                  <LinkButton label="Invoice" onClick={() => downloadInvoice(booking._id)} />
                ) : null}
                {["manual_pending", "failed"].includes(booking.paymentStatus) ? (
                  <>
                    <button type="button" onClick={() => payMutation.mutate(booking._id)}>
                      Pay Online (SSLCommerz)
                    </button>
                  </>
                ) : null}
                {booking.paymentStatus === "pending" && pendingPayment?.transactionId ? (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() =>
                      verifyMutation.mutate({
                        transactionId: pendingPayment.transactionId,
                        provider: pendingPayment.provider,
                      })
                    }
                  >
                    Verify Sandbox Payment
                  </button>
                ) : null}
                {["pending", "confirmed"].includes(booking.bookingStatus) ? (
                  <button type="button" className="ghost" onClick={() => cancelMutation.mutate(booking._id)}>
                    Cancel
                  </button>
                ) : null}
              </div>

              {["manual_pending", "failed"].includes(booking.paymentStatus) ? (
                <form
                  className="mt-3 space-y-2 rounded-lg border border-dashed border-slate-200 p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    manualMutation.mutate({
                      bookingId: booking._id,
                      transactionId: manualForm.transactionId,
                      note: manualForm.note,
                    });
                  }}
                >
                  <p className="text-xs font-semibold text-slate-600">Or pay manually — send payment, then submit Trx ID:</p>
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    value={manualForm.transactionId}
                    onChange={(event) =>
                      setManualForms((current) => ({
                        ...current,
                        [booking._id]: { ...manualForm, transactionId: event.target.value },
                      }))
                    }
                    className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={manualForm.note}
                    onChange={(event) =>
                      setManualForms((current) => ({
                        ...current,
                        [booking._id]: { ...manualForm, note: event.target.value },
                      }))
                    }
                    className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm"
                  />
                  <button type="submit" disabled={manualMutation.isPending}>
                    Submit for Approval
                  </button>
                </form>
              ) : null}

              {booking.paymentStatus === "awaiting_approval" ? (
                <p className="mt-2 text-xs font-medium text-amber-700">Waiting for owner/staff to verify your payment.</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ResourceAndSlotPanel({ canManage }) {
  const { token } = useAuth();
  const [activeResourceId, setActiveResourceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "turf",
    locationName: "",
    latitude: "23.8103",
    longitude: "90.4125",
    facilities: "parking,lights",
    pricePerHour: "1200",
  });
  const [slotForm, setSlotForm] = useState({
    resourceId: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "06:00",
    endTime: "23:00",
    durationMinutes: "60",
  });

  const resourcesQuery = useQuery({ queryKey: ["resources"], queryFn: () => api("/api/resources") });
  const slotsQuery = useQuery({
    queryKey: ["slots", activeResourceId, date],
    enabled: Boolean(activeResourceId && date),
    queryFn: () => api(`/api/slots?resourceId=${activeResourceId}&date=${date}`),
  });

  const createResourceMutation = useMutation({
    mutationFn: () =>
      api("/api/resources", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          name: resourceForm.name,
          type: resourceForm.type,
          locationName: resourceForm.locationName,
          latitude: Number(resourceForm.latitude),
          longitude: Number(resourceForm.longitude),
          facilities: resourceForm.facilities.split(",").map((item) => item.trim()).filter(Boolean),
          images: [],
          pricePerHour: Number(resourceForm.pricePerHour),
        }),
      }),
    onSuccess: () => {
      resourcesQuery.refetch();
      setMessage("Resource added");
    },
    onError: (err) => setMessage(err.message),
  });

  const generateSlotsMutation = useMutation({
    mutationFn: () =>
      api("/api/slots/generate", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          resourceId: slotForm.resourceId,
          date: slotForm.date,
          startTime: slotForm.startTime,
          endTime: slotForm.endTime,
          durationMinutes: Number(slotForm.durationMinutes),
        }),
      }),
    onSuccess: (data) => setMessage(`Generated ${data.createdCount} slots`),
    onError: (err) => setMessage(err.message),
  });

  const bookMutation = useMutation({
    mutationFn: (slotId) =>
      api("/api/bookings", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ slotId, idempotencyKey: `${slotId}-${Date.now()}` }),
      }),
    onSuccess: () => {
      slotsQuery.refetch();
      setMessage("Booking created");
    },
    onError: (err) => setMessage(err.message),
  });

  const sortedResources = useMemo(() => resourcesQuery.data ?? [], [resourcesQuery.data]);

  return (
    <>
      <small>{message}</small>
      <section className="card">
        <h2>Resources</h2>
        <div className="grid two">
          <div>
            <h3>Create Resource (owner/admin)</h3>
            <input placeholder="Name" value={resourceForm.name} onChange={(e) => setResourceForm((p) => ({ ...p, name: e.target.value }))} />
            <input placeholder="Type (turf/pool/sports)" value={resourceForm.type} onChange={(e) => setResourceForm((p) => ({ ...p, type: e.target.value }))} />
            <input placeholder="Location name" value={resourceForm.locationName} onChange={(e) => setResourceForm((p) => ({ ...p, locationName: e.target.value }))} />
            <input placeholder="Latitude" value={resourceForm.latitude} onChange={(e) => setResourceForm((p) => ({ ...p, latitude: e.target.value }))} />
            <input placeholder="Longitude" value={resourceForm.longitude} onChange={(e) => setResourceForm((p) => ({ ...p, longitude: e.target.value }))} />
            <input placeholder="Facilities comma separated" value={resourceForm.facilities} onChange={(e) => setResourceForm((p) => ({ ...p, facilities: e.target.value }))} />
            <input placeholder="Price per hour" value={resourceForm.pricePerHour} onChange={(e) => setResourceForm((p) => ({ ...p, pricePerHour: e.target.value }))} />
            <button onClick={() => createResourceMutation.mutate()} disabled={createResourceMutation.isPending || !token || !canManage}>Add Resource</button>
          </div>
          <div>
            <h3>All Resources</h3>
            {resourcesQuery.isLoading ? <p>Loading...</p> : null}
            <ul>
              {sortedResources.map((resource) => (
                <li key={resource._id}>
                  <button
                    className={activeResourceId === resource._id ? "active" : "ghost"}
                    onClick={() => {
                      setActiveResourceId(resource._id);
                      setSlotForm((p) => ({ ...p, resourceId: resource._id }));
                    }}
                  >
                    {resource.name} - {resource.locationName} - {resource.pricePerHour} BDT/h
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Slots + Booking</h2>
        <div className="grid two">
          <div>
            <h3>Generate Slots (owner/admin/staff)</h3>
            <input type="date" value={slotForm.date} onChange={(e) => { setSlotForm((p) => ({ ...p, date: e.target.value })); setDate(e.target.value); }} />
            <input type="time" value={slotForm.startTime} onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))} />
            <input type="time" value={slotForm.endTime} onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))} />
            <input placeholder="Duration minutes" value={slotForm.durationMinutes} onChange={(e) => setSlotForm((p) => ({ ...p, durationMinutes: e.target.value }))} />
            <button onClick={() => generateSlotsMutation.mutate()} disabled={generateSlotsMutation.isPending || !token || !slotForm.resourceId || !canManage}>
              Generate Slots
            </button>
          </div>
          <div>
            <h3>Available Slots</h3>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={!activeResourceId} />
            <ul>
              {(slotsQuery.data ?? []).map((slot) => (
                <li key={slot._id}>
                  <span>{slot.startTime} - {slot.endTime} ({slot.status})</span>
                  {slot.status === "available" ? (
                    <button onClick={() => bookMutation.mutate(slot._id)} disabled={!token}>Book</button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
