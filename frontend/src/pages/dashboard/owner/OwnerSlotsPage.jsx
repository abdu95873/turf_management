import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, authHeaders, getStoredUser } from "../../../lib/api";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

export default function OwnerSlotsPage({ token }) {
  const [message, setMessage] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState("");
  const [tableResourceId, setTableResourceId] = useState("");
  const [editForm, setEditForm] = useState({
    startTime: "",
    endTime: "",
    status: "available",
    pricePerHour: "",
  });
  const [slotForm, setSlotForm] = useState({
    resourceId: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    startTime: "06:00",
    endTime: "23:00",
    durationMinutes: "60",
  });
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const currentUser = getStoredUser();

  const resourcesQuery = useQuery({
    queryKey: ["owner-resources-for-slots"],
    queryFn: () => api("/api/resources"),
  });

  const ownerResources = useMemo(
    () => (resourcesQuery.data ?? []).filter((item) => String(item.ownerId) === String(currentUser?.id)),
    [resourcesQuery.data, currentUser?.id]
  );
  const slotsQuery = useQuery({
    queryKey: ["owner-slots-table", tableResourceId, filterDate],
    enabled: Boolean(tableResourceId && filterDate),
    queryFn: () => api(`/api/slots?resourceId=${tableResourceId}&date=${filterDate}`),
  });

  const createSlotMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date(`${slotForm.startDate}T00:00:00`);
      const endDate = new Date(`${slotForm.endDate}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new Error("Select valid start and end date.");
      }
      if (endDate < startDate) {
        throw new Error("End date must be same or after start date.");
      }
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      let totalCreated = 0;

      for (let i = 0; i < days; i += 1) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().slice(0, 10);
        const result = await api("/api/slots/generate", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({
            resourceId: slotForm.resourceId,
            date: dateStr,
            startTime: slotForm.startTime,
            endTime: slotForm.endTime,
            durationMinutes: Number(slotForm.durationMinutes),
          }),
        });
        totalCreated += result?.createdCount ?? 0;
      }
      return { totalCreated, days };
    },
    onSuccess: (data) => {
      setMessage(`Created ${data.totalCreated ?? 0} slots across ${data.days ?? 1} day(s).`);
      setFilterDate(slotForm.startDate);
      setTableResourceId(slotForm.resourceId);
      slotsQuery.refetch();
    },
    onError: (err) => setMessage(err?.message || "Failed to create slots."),
  });

  const updateSlotMutation = useMutation({
    mutationFn: async ({ slotId }) => {
      await api(`/api/slots/${slotId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          startTime: editForm.startTime,
          endTime: editForm.endTime,
          status: editForm.status,
          pricePerHour: Number(editForm.pricePerHour),
        }),
      });
    },
    onSuccess: () => {
      setMessage("Slot and price updated successfully.");
      setEditingSlotId("");
      slotsQuery.refetch();
      resourcesQuery.refetch();
    },
    onError: (err) => setMessage(err?.message || "Failed to update slot."),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId) =>
      api(`/api/slots/${slotId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      }),
    onSuccess: () => {
      setMessage("Slot deleted successfully.");
      slotsQuery.refetch();
    },
    onError: (err) => setMessage(err?.message || "Failed to delete slot."),
  });

  return (
    <DashboardPage title="Slot" subtitle="Create and edit institute slots with date filter table" message={message}>
      <DashboardCard title="Create Slot">
        <button
          type="button"
          className="mb-3"
          style={{ width: "auto", marginTop: 0 }}
          onClick={() => setShowCreateForm((p) => !p)}
        >
          {showCreateForm ? "Hide Form" : "Create Slot"}
        </button>

        {showCreateForm ? (
          <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Institute</label>
            <select
              value={slotForm.resourceId}
              onChange={(e) => setSlotForm((p) => ({ ...p, resourceId: e.target.value }))}
              disabled={!ownerResources.length}
            >
              <option value="">Select institute</option>
              {ownerResources.map((resource) => (
                <option key={resource._id} value={resource._id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Start Date</label>
            <input
              type="date"
              value={slotForm.startDate}
              onChange={(e) =>
                setSlotForm((p) => {
                  const nextStart = e.target.value;
                  const nextEnd = p.endDate < nextStart ? nextStart : p.endDate;
                  return { ...p, startDate: nextStart, endDate: nextEnd };
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">End Date</label>
            <input
              type="date"
              value={slotForm.endDate}
              min={slotForm.startDate}
              onChange={(e) => setSlotForm((p) => ({ ...p, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Start Time</label>
            <input
              type="time"
              placeholder="Select start time"
              value={slotForm.startTime}
              onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">End Time</label>
            <input
              type="time"
              placeholder="Select end time"
              value={slotForm.endTime}
              onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Duration Minutes</label>
            <input
              placeholder="e.g. 60"
              value={slotForm.durationMinutes}
              onChange={(e) => setSlotForm((p) => ({ ...p, durationMinutes: e.target.value }))}
            />
            <p className="mt-1 text-xs text-slate-500">Slots will be created for every day between start and end date.</p>
          </div>
          </div>
        ) : null}
        {showCreateForm ? (
          <button
            type="button"
            className="mt-3"
            style={{ width: "auto", marginTop: "12px" }}
            onClick={() => createSlotMutation.mutate()}
            disabled={createSlotMutation.isPending || !slotForm.resourceId || Number.isNaN(Number(slotForm.durationMinutes))}
          >
            {createSlotMutation.isPending ? "Creating..." : "Create Slot"}
          </button>
        ) : null}
      </DashboardCard>

      <DashboardCard title="Slots Table (Date-wise)">
        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Institute</label>
            <select value={tableResourceId} onChange={(e) => setTableResourceId(e.target.value)} disabled={!ownerResources.length}>
              <option value="">Select institute</option>
              {ownerResources.map((resource) => (
                <option key={resource._id} value={resource._id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </div>
          <div className="max-w-[220px]">
          <label className="mb-1 block text-sm text-slate-600">Filter by Date</label>
          <input
            type="date"
            placeholder="Pick date to filter slots"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          </div>
        </div>
        {slotsQuery.isLoading ? <p>Loading slots...</p> : null}
        {!slotsQuery.isLoading && !tableResourceId ? <p>Select an institute first to view slots.</p> : null}
        {!slotsQuery.isLoading && tableResourceId ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Institute</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {(slotsQuery.data ?? []).map((slot) => (
                  <tr key={slot._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{ownerResources.find((item) => item._id === slot.resourceId)?.name ?? "Institute"}</td>
                    <td className="px-3 py-2">{slot.date}</td>
                    <td className="px-3 py-2">
                      {editingSlotId === slot._id ? (
                        <input
                          type="time"
                          value={editForm.startTime}
                          onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))}
                        />
                      ) : (
                        slot.startTime
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingSlotId === slot._id ? (
                        <input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))}
                        />
                      ) : (
                        slot.endTime
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingSlotId === slot._id ? (
                        <input
                          value={editForm.pricePerHour}
                          onChange={(e) => setEditForm((p) => ({ ...p, pricePerHour: e.target.value }))}
                          placeholder="Price"
                        />
                      ) : (
                        `${slot.pricePerHour ?? ownerResources.find((item) => item._id === slot.resourceId)?.pricePerHour ?? 0} BDT/h`
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {editingSlotId === slot._id ? (
                        <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                          <option value="available">available</option>
                          <option value="blocked">blocked</option>
                        </select>
                      ) : (
                        slot.status
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editingSlotId === slot._id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            style={{ width: "auto", marginTop: 0, minHeight: "30px" }}
                            onClick={() => updateSlotMutation.mutate({ slotId: slot._id })}
                            disabled={updateSlotMutation.isPending || Number.isNaN(Number(editForm.pricePerHour))}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            style={{ width: "auto", marginTop: 0, minHeight: "30px" }}
                            onClick={() => setEditingSlotId("")}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="ghost"
                            style={{ width: "auto", marginTop: 0, minHeight: "30px" }}
                            onClick={() => {
                              setEditingSlotId(slot._id);
                              setEditForm({
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                status: slot.status === "booked" ? "available" : slot.status,
                                pricePerHour: String(slot.pricePerHour ?? ownerResources.find((item) => item._id === slot.resourceId)?.pricePerHour ?? ""),
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            style={{ width: "auto", marginTop: 0, minHeight: "30px" }}
                            onClick={() => deleteSlotMutation.mutate(slot._id)}
                            disabled={deleteSlotMutation.isPending || slot.status === "booked"}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!slotsQuery.data?.length ? (
                  <tr>
                    <td className="px-3 py-2 text-slate-500" colSpan={7}>
                      No slots found for selected date.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardCard>
    </DashboardPage>
  );
}
