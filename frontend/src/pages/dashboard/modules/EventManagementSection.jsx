import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  Alert,
  Badge,
  Button,
  DashboardCard,
  DataTable,
  EmptyState,
  Field,
  FormGrid,
  Input,
  Select,
} from "../shared/PageChrome";

const emptyForm = {
  title: "",
  badge: "Open",
  image: "",
  dateLabel: "",
  format: "",
  prizePool: "",
  venue: "",
  filled: 0,
  total: 24,
  status: "draft",
  isPublished: false,
};

function mapEventForCard(event) {
  return {
    id: event._id,
    title: event.title,
    badge: event.badge,
    image: event.image,
    date: event.dateLabel,
    format: event.format,
    prizePool: event.prizePool,
    venue: event.venue,
    filled: event.filled,
    total: event.total,
  };
}

export default function EventManagementSection() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const headers = authHeaders(token);

  const eventsQuery = useQuery({
    queryKey: ["managed-events"],
    queryFn: () => api("/api/events/manage", { headers }),
  });

  const events = eventsQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      api("/api/events/manage", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          filled: Number(form.filled),
          total: Number(form.total),
          isPublished: form.status === "published",
        }),
      }),
    onSuccess: () => {
      setMessage("Event created.");
      setForm(emptyForm);
      eventsQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ eventId, patch }) =>
      api(`/api/events/manage/${eventId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      setMessage("Event updated.");
      eventsQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId) =>
      api(`/api/events/manage/${eventId}`, {
        method: "DELETE",
        headers,
      }),
    onSuccess: () => {
      setMessage("Event deleted.");
      eventsQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <>
      {message ? <Alert tone="success">{message}</Alert> : null}

      <DashboardCard title="Create tournament / event" description="Published events appear on the public /events page.">
        <FormGrid columns={2}>
          <Field label="Title" htmlFor="event-title" required>
            <Input id="event-title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} />
          </Field>
          <Field label="Badge" htmlFor="event-badge">
            <Input id="event-badge" value={form.badge} onChange={(e) => setForm((c) => ({ ...c, badge: e.target.value }))} />
          </Field>
          <Field label="Date label" htmlFor="event-date" required className="dashboard-field-span-2">
            <Input
              id="event-date"
              placeholder="Jul 14–24, 2026"
              value={form.dateLabel}
              onChange={(e) => setForm((c) => ({ ...c, dateLabel: e.target.value }))}
            />
          </Field>
          <Field label="Format" htmlFor="event-format">
            <Input id="event-format" value={form.format} onChange={(e) => setForm((c) => ({ ...c, format: e.target.value }))} />
          </Field>
          <Field label="Prize pool" htmlFor="event-prize">
            <Input id="event-prize" value={form.prizePool} onChange={(e) => setForm((c) => ({ ...c, prizePool: e.target.value }))} />
          </Field>
          <Field label="Venue" htmlFor="event-venue">
            <Input id="event-venue" value={form.venue} onChange={(e) => setForm((c) => ({ ...c, venue: e.target.value }))} />
          </Field>
          <Field label="Image URL" htmlFor="event-image" className="dashboard-field-span-2">
            <Input id="event-image" value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))} />
          </Field>
          <Field label="Filled slots" htmlFor="event-filled">
            <Input
              id="event-filled"
              type="number"
              min="0"
              value={form.filled}
              onChange={(e) => setForm((c) => ({ ...c, filled: e.target.value }))}
            />
          </Field>
          <Field label="Total slots" htmlFor="event-total">
            <Input
              id="event-total"
              type="number"
              min="1"
              value={form.total}
              onChange={(e) => setForm((c) => ({ ...c, total: e.target.value }))}
            />
          </Field>
          <Field label="Status" htmlFor="event-status">
            <Select id="event-status" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>
        </FormGrid>
        <div className="mt-5">
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <FiPlus />
            {createMutation.isPending ? "Creating..." : "Create event"}
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard title="Your events">
        {eventsQuery.isLoading ? <p className="text-sm text-slate-500">Loading events...</p> : null}
        {!eventsQuery.isLoading && !events.length ? (
          <EmptyState title="No events yet" description="Create a tournament to show it on the public events page." />
        ) : (
          <DataTable
            columns={[
              { key: "title", label: "Event", render: (row) => <strong>{row.title}</strong> },
              { key: "dateLabel", label: "Date" },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <Badge tone={row.isPublished ? "success" : "neutral"}>{row.isPublished ? "Published" : row.status}</Badge>
                ),
              },
              {
                key: "slots",
                label: "Slots",
                render: (row) => (
                  <span>
                    {row.filled}/{row.total}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    {row.isPublished ? (
                      <Button
                        variant="ghost"
                        onClick={() => updateMutation.mutate({ eventId: row._id, patch: { isPublished: false, status: "draft" } })}
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        onClick={() => updateMutation.mutate({ eventId: row._id, patch: { isPublished: true, status: "published" } })}
                      >
                        Publish
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => deleteMutation.mutate(row._id)}>
                      <FiTrash2 />
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={events.map((event) => ({ ...event, id: event._id, ...mapEventForCard(event) }))}
          />
        )}
      </DashboardCard>
    </>
  );
}
