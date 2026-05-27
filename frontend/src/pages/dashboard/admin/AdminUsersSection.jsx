import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  Badge,
  Button,
  DashboardCard,
  DataTable,
  EmptyState,
  Select,
  StatCard,
  StatGrid,
} from "../shared/PageChrome";

export default function AdminUsersSection({ setMessage }) {
  const { token } = useAuth();
  const [roleFilter, setRoleFilter] = useState("");
  const adminHeaders = authHeaders(token);

  const usersQuery = useQuery({
    queryKey: ["admin-users", roleFilter],
    queryFn: () => {
      const query = roleFilter ? `?role=${roleFilter}` : "";
      return api(`/api/admin/users${query}`, { headers: adminHeaders });
    },
  });

  const users = usersQuery.data ?? [];
  const activeUsers = users.filter((user) => user.isActive).length;

  const userStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) =>
      api(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      setMessage("User status updated successfully.");
      usersQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <>
      <StatGrid>
        <StatCard label="Accounts" value={users.length} />
        <StatCard label="Active" value={activeUsers} tone="success" />
        <StatCard label="Suspended" value={users.length - activeUsers} tone="danger" />
      </StatGrid>

      <DashboardCard title="Platform users" description="Filter by role and activate or suspend accounts.">
        <div className="mb-4 max-w-xs">
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">All roles</option>
            <option value="user">Customers</option>
            <option value="owner">Owners</option>
            <option value="staff">Staff</option>
          </Select>
        </div>

        {usersQuery.isLoading ? <p className="text-sm text-slate-500">Loading users...</p> : null}
        {!usersQuery.isLoading && !users.length ? (
          <EmptyState title="No users found" />
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Name", render: (row) => <strong>{row.name}</strong> },
              { key: "email", label: "Email" },
              {
                key: "role",
                label: "Role",
                render: (row) => <Badge tone="neutral">{row.role}</Badge>,
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <Badge tone={row.isActive ? "success" : "danger"}>{row.isActive ? "Active" : "Suspended"}</Badge>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) =>
                  row.isActive ? (
                    <Button variant="danger" onClick={() => userStatusMutation.mutate({ userId: row._id, isActive: false })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button onClick={() => userStatusMutation.mutate({ userId: row._id, isActive: true })}>Activate</Button>
                  ),
              },
            ]}
            rows={users.map((user) => ({ ...user, id: user._id }))}
          />
        )}
      </DashboardCard>
    </>
  );
}
