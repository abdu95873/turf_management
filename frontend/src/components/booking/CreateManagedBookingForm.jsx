import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { api, authHeaders } from "../../lib/api";
import { formatTimeRange } from "../../lib/slotTime";
import {
  Alert,
  Button,
  DashboardCard,
  Field,
  FormGrid,
  Input,
  Select,
  Textarea,
} from "../../pages/dashboard/shared/PageChrome";

const BOOKING_ROLES = new Set(["owner", "staff", "admin"]);

export default function CreateManagedBookingForm({ onCreated }) {
  const { token, user } = useAuth();
  const canCreate = BOOKING_ROLES.has(user?.role);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slotId, setSlotId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");

  const resourcesQuery = useQuery({
    queryKey: ["managed-booking-resources"],
    queryFn: () => api("/api/bookings/manage/resources", { headers: authHeaders(token) }),
    enabled: canCreate && open,
  });

  const slotsQuery = useQuery({
    queryKey: ["managed-booking-slots", resourceId, date],
    queryFn: () => api(`/api/slots?resourceId=${resourceId}&date=${date}`),
    enabled: canCreate && open && Boolean(resourceId && date),
  });

  const customersQuery = useQuery({
    queryKey: ["managed-booking-customers", customerQuery],
    queryFn: () =>
      api(`/api/bookings/manage/customers?q=${encodeURIComponent(customerQuery.trim())}`, {
        headers: authHeaders(token),
      }),
    enabled: canCreate && open && customerQuery.trim().length >= 2 && !selectedCustomer,
  });

  const availableSlots = useMemo(
    () => (slotsQuery.data ?? []).filter((slot) => slot.status === "available"),
    [slotsQuery.data]
  );

  const selectedSlot = availableSlots.find((slot) => slot._id === slotId) ?? null;
  const selectedResource = (resourcesQuery.data ?? []).find((resource) => resource._id === resourceId) ?? null;

  useEffect(() => {
    setSlotId("");
  }, [resourceId, date]);

  useEffect(() => {
    if (!selectedCustomer) return;
    if (customerQuery !== selectedCustomer.email) {
      setSelectedCustomer(null);
    }
  }, [customerQuery, selectedCustomer]);

  const createMutation = useMutation({
    mutationFn: () =>
      api("/api/bookings/manage", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          userId: selectedCustomer.id,
          slotId,
          idempotencyKey: `managed-${slotId}-${Date.now()}`,
          transactionId: transactionId.trim(),
          note: note.trim(),
        }),
      }),
    onSuccess: (result) => {
      setMessage(
        `Booking confirmed for ${result.customer?.name ?? "customer"} — ${result.booking?.amount ?? ""} BDT`
      );
      setError("");
      setSlotId("");
      setTransactionId("");
      setNote("");
      setCustomerQuery("");
      setSelectedCustomer(null);
      onCreated?.();
    },
    onError: (err) => {
      setError(err?.message ?? "Could not create booking");
      setMessage("");
    },
  });

  if (!canCreate) return null;

  const canSubmit =
    Boolean(selectedCustomer && slotId && transactionId.trim().length >= 4) && !createMutation.isPending;

  return (
    <DashboardCard
      title="Book for customer"
      description="Manual payment booking for a registered user."
      actions={
        <Button type="button" variant="ghost" className="dashboard-btn-sm" onClick={() => setOpen((current) => !current)}>
          <FiPlus aria-hidden="true" />
          {open ? "Close" : "New booking"}
        </Button>
      }
    >
      {open ? (
        <div className="dashboard-form-stack">
          {message ? <Alert tone="success">{message}</Alert> : null}
          {error ? <Alert tone="danger">{error}</Alert> : null}

          <FormGrid columns={2}>
            <Field label="Venue" htmlFor="managed-booking-venue">
              <Select
                id="managed-booking-venue"
                value={resourceId}
                onChange={(event) => setResourceId(event.target.value)}
              >
                <option value="">Select venue</option>
                {(resourcesQuery.data ?? []).map((resource) => (
                  <option key={resource._id} value={resource._id}>
                    {resource.name}
                    {resource.isActive === false ? " (inactive)" : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Date" htmlFor="managed-booking-date">
              <Input
                id="managed-booking-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Field>
          </FormGrid>

          <Field label="Available slot" htmlFor="managed-booking-slot">
            <Select
              id="managed-booking-slot"
              value={slotId}
              disabled={!resourceId || slotsQuery.isLoading}
              onChange={(event) => setSlotId(event.target.value)}
            >
              <option value="">
                {slotsQuery.isLoading
                  ? "Loading slots…"
                  : !resourceId
                    ? "Select a venue first"
                    : availableSlots.length
                      ? "Select time slot"
                      : "No available slots for this date"}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot._id} value={slot._id}>
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </option>
              ))}
            </Select>
          </Field>

          {selectedSlot && selectedResource ? (
            <p className="dashboard-form-summary">
              {selectedResource.name} · {formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)} ·{" "}
              <strong>{selectedResource.pricePerHour} BDT</strong>
            </p>
          ) : null}

          <Field label="Customer" htmlFor="managed-booking-customer">
            <div className="dashboard-search-field">
              <FiSearch className="dashboard-search-field-icon" aria-hidden="true" />
              <Input
                id="managed-booking-customer"
                type="search"
                placeholder="Search by customer email or name…"
                value={customerQuery}
                onChange={(event) => setCustomerQuery(event.target.value)}
              />
            </div>
          </Field>

          {selectedCustomer ? (
            <div className="dashboard-pick-selected">
              <FiUser aria-hidden="true" />
              <span>
                {selectedCustomer.name} · {selectedCustomer.email}
              </span>
              <button type="button" onClick={() => setSelectedCustomer(null)}>
                Change
              </button>
            </div>
          ) : null}

          {!selectedCustomer && customerQuery.trim().length >= 2 ? (
            <div className="dashboard-pick-list">
              {customersQuery.isLoading ? <p className="dashboard-field-hint">Searching…</p> : null}
              {!customersQuery.isLoading && !(customersQuery.data ?? []).length ? (
                <p className="dashboard-field-hint">No customer found. User must have a registered account.</p>
              ) : null}
              {(customersQuery.data ?? []).map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="dashboard-pick-option"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setCustomerQuery(customer.email);
                  }}
                >
                  <strong>{customer.name}</strong>
                  <span>{customer.email}</span>
                </button>
              ))}
            </div>
          ) : null}

          <FormGrid columns={2}>
            <Field label="Transaction ID" htmlFor="managed-booking-trx">
              <Input
                id="managed-booking-trx"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="bKash / Nagad / cash reference"
              />
            </Field>

            <Field label="Payment note (optional)" htmlFor="managed-booking-note">
              <Textarea
                id="managed-booking-note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Sender number or internal note"
              />
            </Field>
          </FormGrid>

          <div className="dashboard-form-actions">
            <Button type="button" disabled={!canSubmit} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Booking…" : "Confirm manual booking"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="dashboard-field-hint">Use this to book a slot for walk-in or phone customers with manual payment.</p>
      )}
    </DashboardCard>
  );
}
