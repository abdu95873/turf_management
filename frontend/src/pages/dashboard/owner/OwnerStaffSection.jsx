import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiUserPlus } from "react-icons/fi";
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
  StatCard,
  StatGrid,
} from "../shared/PageChrome";

export default function OwnerStaffSection() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "" });

  const staffQuery = useQuery({
    queryKey: ["owner-staff"],
    queryFn: () => api("/api/owner/staff", { headers: authHeaders(token) }),
  });

  const staffList = staffQuery.data ?? [];
  const activeCount = staffList.filter((staff) => staff.isActive).length;

  const createStaffMutation = useMutation({
    mutationFn: () =>
      api("/api/owner/staff", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(staffForm),
      }),
    onSuccess: () => {
      setMessage("Staff member added successfully.");
      setStaffForm({ name: "", email: "", password: "" });
      staffQuery.refetch();
    },
    onError: (error) => setMessage(error.message),
  });

  const updateStaffStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      api(`/api/owner/staff/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => staffQuery.refetch(),
  });

  return (
    <>
      {message ? <Alert tone="success">{message}</Alert> : null}

      <StatGrid>
        <StatCard label="Total staff" value={staffList.length} />
        <StatCard label="Active" value={activeCount} tone="success" />
        <StatCard label="Disabled" value={staffList.length - activeCount} tone="warning" />
      </StatGrid>

      <div className="dashboard-split">
        <DashboardCard title="Add staff member" description="Staff can manage bookings for your venues.">
          <FormGrid columns={2}>
            <Field label="Full name" htmlFor="staff-name" required>
              <Input
                id="staff-name"
                value={staffForm.name}
                onChange={(event) => setStaffForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Rahim Ahmed"
              />
            </Field>
            <Field label="Email" htmlFor="staff-email" required>
              <Input
                id="staff-email"
                type="email"
                value={staffForm.email}
                onChange={(event) => setStaffForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="staff@venue.com"
              />
            </Field>
            <Field label="Temporary password" htmlFor="staff-pass" required className="dashboard-field-span-2">
              <Input
                id="staff-pass"
                type="password"
                value={staffForm.password}
                onChange={(event) => setStaffForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Min. 8 characters"
              />
            </Field>
          </FormGrid>
          <div className="mt-5">
            <Button onClick={() => createStaffMutation.mutate()} disabled={createStaffMutation.isPending}>
              <FiUserPlus />
              {createStaffMutation.isPending ? "Adding..." : "Add staff"}
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Team directory">
          {staffQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading staff...</p>
          ) : !staffList.length ? (
            <EmptyState title="No staff yet" description="Add team members to help manage bookings." />
          ) : (
            <DataTable
              columns={[
                { key: "name", label: "Name", render: (row) => <strong>{row.name}</strong> },
                { key: "email", label: "Email" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Disabled"}</Badge>,
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <Button
                      variant="ghost"
                      onClick={() => updateStaffStatusMutation.mutate({ id: row._id, isActive: !row.isActive })}
                    >
                      {row.isActive ? "Disable" : "Enable"}
                    </Button>
                  ),
                },
              ]}
              rows={staffList.map((staff) => ({ ...staff, id: staff._id }))}
            />
          )}
        </DashboardCard>
      </div>
    </>
  );
}
