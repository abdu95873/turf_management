import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../../../lib/api";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

const INITIAL_FORM = {
  name: "",
  type: "turf",
  locationName: "",
  latitude: "23.8103",
  longitude: "90.4125",
  facilities: "parking,lights,washroom",
  imageUrl: "",
  pricePerHour: "1200",
  ownerId: "",
};

export default function AdminAddCompanyPage({ token }) {
  const MAX_STAFF_ASSIGN = 3;
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedStaffIds, setSelectedStaffIds] = useState(["", "", ""]);
  const [staffCreateForm, setStaffCreateForm] = useState({ name: "", email: "", password: "" });

  const assignableQuery = useQuery({
    queryKey: ["admin-assignable-users"],
    queryFn: () => api("/api/admin/users/assignable", { headers: authHeaders(token) }),
  });

  const staffOptions = useMemo(() => {
    const staff = assignableQuery.data?.staff ?? [];
    if (!form.ownerId) return [];
    return staff.filter((item) => !item.ownerId || String(item.ownerId) === String(form.ownerId));
  }, [assignableQuery.data, form.ownerId]);

  const createCompanyMutation = useMutation({
    mutationFn: () =>
      api("/api/resources", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          locationName: form.locationName.trim(),
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          facilities: form.facilities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
          pricePerHour: Number(form.pricePerHour),
          ownerId: form.ownerId || undefined,
          staffIds: Array.from(new Set(selectedStaffIds.filter(Boolean))).slice(0, MAX_STAFF_ASSIGN),
        }),
      }),
    onSuccess: () => {
      setMessage("Company created and assigned successfully.");
      setForm(INITIAL_FORM);
      setSelectedStaffIds(["", "", ""]);
    },
    onError: (error) => {
      setMessage(error?.message || "Failed to create company.");
    },
  });
  const createStaffUnderOwnerMutation = useMutation({
    mutationFn: () =>
      api("/api/admin/users", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          name: staffCreateForm.name.trim(),
          email: staffCreateForm.email.trim().toLowerCase(),
          password: staffCreateForm.password,
          role: "staff",
          ownerId: form.ownerId,
        }),
      }),
    onSuccess: () => {
      setMessage("Staff created under selected owner.");
      setStaffCreateForm({ name: "", email: "", password: "" });
      assignableQuery.refetch();
    },
    onError: (error) => setMessage(error?.message || "Failed to create staff."),
  });

  return (
    <DashboardPage title="Add Company" subtitle="Create company and assign owner/staff" message={message}>
      <DashboardCard title="Company Setup">
        {assignableQuery.isLoading ? <p className="mb-3 text-sm text-slate-500">Loading owner/staff list...</p> : null}
        {!assignableQuery.isLoading && !(assignableQuery.data?.owners ?? []).length ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            No active owner found. First create an owner from <strong>Add Users</strong> page.
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Company Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Company name" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Type</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="turf">Turf</option>
              <option value="pool">Pool</option>
              <option value="sports">Sports</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Address</label>
            <input
              value={form.locationName}
              onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))}
              placeholder="Area, city"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Price Per Hour (BDT)</label>
            <input value={form.pricePerHour} onChange={(e) => setForm((p) => ({ ...p, pricePerHour: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Latitude</label>
            <input value={form.latitude} onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Longitude</label>
            <input value={form.longitude} onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Facilities (comma separated)</label>
            <input value={form.facilities} onChange={(e) => setForm((p) => ({ ...p, facilities: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Assign Owner</label>
            <select
              value={form.ownerId}
              onChange={(e) => {
                const nextOwnerId = e.target.value;
                setForm((p) => ({ ...p, ownerId: nextOwnerId }));
                setSelectedStaffIds(["", "", ""]);
              }}
            >
              <option value="">Select owner</option>
              {(assignableQuery.data?.owners ?? []).map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Assign Staff 1</label>
            <p className="mb-1 text-xs text-slate-500">Select by name. Staff ID is assigned automatically.</p>
            <select
              value={selectedStaffIds[0] ?? ""}
              disabled={!form.ownerId || !staffOptions.length}
              onChange={(e) =>
                setSelectedStaffIds((prev) => {
                  const next = [...prev];
                  next[0] = e.target.value;
                  return next;
                })
              }
            >
              <option value="">Select staff 1</option>
              {staffOptions.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Assign Staff 2</label>
            <select
              value={selectedStaffIds[1] ?? ""}
              disabled={!form.ownerId || !staffOptions.length}
              onChange={(e) =>
                setSelectedStaffIds((prev) => {
                  const next = [...prev];
                  next[1] = e.target.value;
                  return next;
                })
              }
            >
              <option value="">Select staff 2</option>
              {staffOptions.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Assign Staff 3</label>
            <select
              value={selectedStaffIds[2] ?? ""}
              disabled={!form.ownerId || !staffOptions.length}
              onChange={(e) =>
                setSelectedStaffIds((prev) => {
                  const next = [...prev];
                  next[2] = e.target.value;
                  return next;
                })
              }
            >
              <option value="">Select staff 3</option>
              {staffOptions.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>
            {!staffOptions.length ? (
              <p className="mt-1 text-xs text-amber-600">
                No staff found for this owner. Create staff from Add Users page (role: staff).
              </p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">{selectedStaffIds.filter(Boolean).length}/{MAX_STAFF_ASSIGN} selected</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Add Staff Under Selected Owner</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              placeholder="Staff name"
              value={staffCreateForm.name}
              onChange={(e) => setStaffCreateForm((p) => ({ ...p, name: e.target.value }))}
              disabled={!form.ownerId}
            />
            <input
              placeholder="Staff email"
              value={staffCreateForm.email}
              onChange={(e) => setStaffCreateForm((p) => ({ ...p, email: e.target.value }))}
              disabled={!form.ownerId}
            />
            <input
              type="password"
              placeholder="Staff password (min 6)"
              value={staffCreateForm.password}
              onChange={(e) => setStaffCreateForm((p) => ({ ...p, password: e.target.value }))}
              disabled={!form.ownerId}
            />
          </div>
          <button
            type="button"
            className="mt-2"
            style={{ width: "auto", marginTop: "10px" }}
            onClick={() => createStaffUnderOwnerMutation.mutate()}
            disabled={
              createStaffUnderOwnerMutation.isPending ||
              !form.ownerId ||
              staffCreateForm.name.trim().length < 2 ||
              !staffCreateForm.email.trim() ||
              staffCreateForm.password.length < 6
            }
          >
            {createStaffUnderOwnerMutation.isPending ? "Adding Staff..." : "Add Staff"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => createCompanyMutation.mutate()}
          disabled={
            createCompanyMutation.isPending ||
            !form.name.trim() ||
            !form.locationName.trim() ||
            !form.ownerId ||
            !(assignableQuery.data?.owners ?? []).length ||
            Number.isNaN(Number(form.pricePerHour)) ||
            Number.isNaN(Number(form.latitude)) ||
            Number.isNaN(Number(form.longitude))
          }
          className="mt-3"
          style={{ width: "auto", marginTop: "12px" }}
        >
          {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
        </button>
      </DashboardCard>
    </DashboardPage>
  );
}
