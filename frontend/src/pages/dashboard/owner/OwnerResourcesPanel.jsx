import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiMapPin, FiPlus } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  Alert,
  Badge,
  Button,
  DashboardCard,
  EmptyState,
  Field,
  FormGrid,
  Input,
  Select,
  StatCard,
  StatGrid,
} from "../shared/PageChrome";

const RESOURCE_TYPES = [
  { value: "turf", label: "Football / Turf" },
  { value: "pool", label: "Swimming / Pool" },
  { value: "sports", label: "Multi-Sport" },
];

export default function OwnerResourcesPanel() {
  const { token, user } = useAuth();
  const [message, setMessage] = useState("");
  const [activeResourceId, setActiveResourceId] = useState("");
  const [slotDate, setSlotDate] = useState(new Date().toISOString().slice(0, 10));
  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "turf",
    locationName: "",
    latitude: "23.8103",
    longitude: "90.4125",
    facilities: "parking, lights, changing room",
    pricePerHour: "1200",
    imageUrl: "",
    isActive: true,
  });
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: "06:00",
    endTime: "23:00",
    durationMinutes: "60",
  });

  const resourcesQuery = useQuery({
    queryKey: ["owner-resources"],
    queryFn: () => api("/api/resources"),
  });

  const myResources = useMemo(() => {
    return (resourcesQuery.data ?? []).filter((resource) => String(resource.ownerId) === String(user?.id));
  }, [resourcesQuery.data, user?.id]);

  const slotsQuery = useQuery({
    queryKey: ["owner-slots", activeResourceId, slotDate],
    enabled: Boolean(activeResourceId && slotDate),
    queryFn: () => api(`/api/slots?resourceId=${activeResourceId}&date=${slotDate}`),
  });

  const activeResource = myResources.find((resource) => resource._id === activeResourceId) ?? null;
  const availableSlots = (slotsQuery.data ?? []).filter((slot) => slot.status === "available").length;
  const bookedSlots = (slotsQuery.data ?? []).filter((slot) => slot.status === "booked").length;

  const createResourceMutation = useMutation({
    mutationFn: () =>
      api("/api/resources", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          name: resourceForm.name.trim(),
          type: resourceForm.type,
          locationName: resourceForm.locationName.trim(),
          latitude: Number(resourceForm.latitude),
          longitude: Number(resourceForm.longitude),
          facilities: resourceForm.facilities.split(",").map((item) => item.trim()).filter(Boolean),
          images: resourceForm.imageUrl.trim() ? [resourceForm.imageUrl.trim()] : [],
          pricePerHour: Number(resourceForm.pricePerHour),
          isActive: resourceForm.isActive,
        }),
      }),
    onSuccess: () => {
      setMessage("Venue created successfully.");
      resourcesQuery.refetch();
      setResourceForm((current) => ({
        ...current,
        name: "",
        locationName: "",
        imageUrl: "",
      }));
    },
    onError: (error) => setMessage(error.message),
  });

  const generateSlotsMutation = useMutation({
    mutationFn: () =>
      api("/api/slots/generate", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          resourceId: activeResourceId,
          date: slotForm.date,
          startTime: slotForm.startTime,
          endTime: slotForm.endTime,
          durationMinutes: Number(slotForm.durationMinutes),
        }),
      }),
    onSuccess: (data) => {
      setMessage(`Generated ${data.createdCount ?? 0} slots for ${slotForm.date}.`);
      slotsQuery.refetch();
    },
    onError: (error) => setMessage(error.message),
  });

  return (
    <>
      {message ? <Alert tone={message.includes("success") || message.includes("Generated") ? "success" : "info"}>{message}</Alert> : null}

      <StatGrid>
        <StatCard label="My Venues" value={myResources.length} hint="Active listings" icon={FiMapPin} tone="accent" />
        <StatCard label="Selected Venue" value={activeResource?.name ?? "—"} hint="Currently managing" />
        <StatCard label="Available Slots" value={activeResourceId ? availableSlots : "—"} hint={slotDate} tone="success" />
        <StatCard label="Booked Slots" value={activeResourceId ? bookedSlots : "—"} hint={slotDate} tone="warning" />
      </StatGrid>

      <div className="dashboard-split">
        <DashboardCard title="Add New Venue" description="Create a turf, pool, or sports venue for bookings.">
          <FormGrid columns={2}>
            <Field label="Venue name" htmlFor="res-name" required>
              <Input
                id="res-name"
                value={resourceForm.name}
                onChange={(event) => setResourceForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Golden Arena Turf"
              />
            </Field>
            <Field label="Category" htmlFor="res-type" required>
              <Select
                id="res-type"
                value={resourceForm.type}
                onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))}
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Location" htmlFor="res-location" required className="dashboard-field-span-2">
              <Input
                id="res-location"
                value={resourceForm.locationName}
                onChange={(event) => setResourceForm((current) => ({ ...current, locationName: event.target.value }))}
                placeholder="Gulshan, Dhaka"
              />
            </Field>
            <Field label="Latitude" htmlFor="res-lat">
              <Input
                id="res-lat"
                value={resourceForm.latitude}
                onChange={(event) => setResourceForm((current) => ({ ...current, latitude: event.target.value }))}
              />
            </Field>
            <Field label="Longitude" htmlFor="res-lng">
              <Input
                id="res-lng"
                value={resourceForm.longitude}
                onChange={(event) => setResourceForm((current) => ({ ...current, longitude: event.target.value }))}
              />
            </Field>
            <Field label="Price per hour (BDT)" htmlFor="res-price" required>
              <Input
                id="res-price"
                type="number"
                min="0"
                value={resourceForm.pricePerHour}
                onChange={(event) => setResourceForm((current) => ({ ...current, pricePerHour: event.target.value }))}
              />
            </Field>
            <Field label="Cover image URL" htmlFor="res-image" hint="Optional — shown on discover pages">
              <Input
                id="res-image"
                value={resourceForm.imageUrl}
                onChange={(event) => setResourceForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://..."
              />
            </Field>
            <Field label="Facilities" htmlFor="res-facilities" className="dashboard-field-span-2">
              <Input
                id="res-facilities"
                value={resourceForm.facilities}
                onChange={(event) => setResourceForm((current) => ({ ...current, facilities: event.target.value }))}
                placeholder="parking, lights, shower"
              />
            </Field>
          </FormGrid>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={resourceForm.isActive}
              onChange={(event) => setResourceForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Venue is active and visible to customers
          </label>
          <div className="mt-5">
            <Button onClick={() => createResourceMutation.mutate()} disabled={createResourceMutation.isPending}>
              <FiPlus />
              {createResourceMutation.isPending ? "Saving..." : "Create venue"}
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Your Venues" description="Select a venue to manage time slots.">
          {resourcesQuery.isLoading ? <p className="text-sm text-slate-500">Loading venues...</p> : null}
          {!resourcesQuery.isLoading && !myResources.length ? (
            <EmptyState title="No venues yet" description="Create your first venue using the form on the left." />
          ) : (
            <ul className="space-y-2">
              {myResources.map((resource) => (
                <li key={resource._id}>
                  <button
                    type="button"
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      activeResourceId === resource._id
                        ? "border-ds-primary bg-ds-primary/5"
                        : "border-slate-200 bg-slate-50 hover:border-ds-primary/40"
                    }`}
                    onClick={() => {
                      setActiveResourceId(resource._id);
                      setSlotForm((current) => ({ ...current, resourceId: resource._id }));
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-ds-secondary">{resource.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{resource.locationName}</p>
                      </div>
                      <Badge tone={resource.isActive ? "success" : "neutral"}>{resource.isActive ? "Active" : "Hidden"}</Badge>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ds-primary">{resource.pricePerHour} BDT / hr · {resource.type}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      <DashboardCard
        title="Slot generator"
        description={activeResource ? `Managing slots for ${activeResource.name}` : "Select a venue first"}
      >
        <FormGrid columns={3}>
          <Field label="Date" htmlFor="slot-date">
            <Input
              id="slot-date"
              type="date"
              value={slotForm.date}
              onChange={(event) => {
                setSlotForm((current) => ({ ...current, date: event.target.value }));
                setSlotDate(event.target.value);
              }}
              disabled={!activeResourceId}
            />
          </Field>
          <Field label="Start time" htmlFor="slot-start">
            <Input
              id="slot-start"
              type="time"
              value={slotForm.startTime}
              onChange={(event) => setSlotForm((current) => ({ ...current, startTime: event.target.value }))}
              disabled={!activeResourceId}
            />
          </Field>
          <Field label="End time" htmlFor="slot-end">
            <Input
              id="slot-end"
              type="time"
              value={slotForm.endTime}
              onChange={(event) => setSlotForm((current) => ({ ...current, endTime: event.target.value }))}
              disabled={!activeResourceId}
            />
          </Field>
          <Field label="Slot duration (minutes)" htmlFor="slot-duration">
            <Input
              id="slot-duration"
              type="number"
              min="15"
              step="15"
              value={slotForm.durationMinutes}
              onChange={(event) => setSlotForm((current) => ({ ...current, durationMinutes: event.target.value }))}
              disabled={!activeResourceId}
            />
          </Field>
        </FormGrid>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => generateSlotsMutation.mutate()} disabled={!activeResourceId || generateSlotsMutation.isPending}>
            Generate slots
          </Button>
        </div>

        {activeResourceId ? (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-ds-secondary">Slots on {slotDate}</p>
            {slotsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading slots...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(slotsQuery.data ?? []).map((slot) => (
                  <span
                    key={slot._id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      slot.status === "available"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {slot.startTime}–{slot.endTime} · {slot.status}
                  </span>
                ))}
                {!slotsQuery.data?.length ? <p className="text-sm text-slate-500">No slots for this date. Generate above.</p> : null}
              </div>
            )}
          </div>
        ) : null}
      </DashboardCard>
    </>
  );
}
