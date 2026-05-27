import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  Badge,
  Button,
  DashboardCard,
  DataTable,
  EmptyState,
  StatCard,
  StatGrid,
} from "../shared/PageChrome";

export default function AdminOwnersSection({ setMessage }) {
  const { token } = useAuth();
  const adminHeaders = authHeaders(token);

  const ownersQuery = useQuery({
    queryKey: ["admin-owners"],
    queryFn: () => api("/api/admin/owners", { headers: adminHeaders }),
  });

  const owners = ownersQuery.data ?? [];
  const activeOwners = owners.filter((owner) => owner.isActive).length;

  const ownerStatusMutation = useMutation({
    mutationFn: ({ ownerId, isActive }) =>
      api(`/api/admin/owners/${ownerId}/status`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      setMessage("Owner status updated successfully.");
      ownersQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <>
      <StatGrid>
        <StatCard label="Total owners" value={owners.length} />
        <StatCard label="Active" value={activeOwners} tone="success" />
        <StatCard label="Suspended" value={owners.length - activeOwners} tone="danger" />
      </StatGrid>

      <DashboardCard title="Owner accounts" description="Approve new turf owners or suspend accounts.">
        {ownersQuery.isLoading ? <p className="text-sm text-slate-500">Loading owners...</p> : null}
        {!ownersQuery.isLoading && !owners.length ? (
          <EmptyState title="No owners registered" />
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Owner", render: (row) => <strong>{row.name}</strong> },
              { key: "email", label: "Email" },
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
                    <Button variant="danger" onClick={() => ownerStatusMutation.mutate({ ownerId: row._id, isActive: false })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button onClick={() => ownerStatusMutation.mutate({ ownerId: row._id, isActive: true })}>Activate</Button>
                  ),
              },
            ]}
            rows={owners.map((owner) => ({ ...owner, id: owner._id }))}
          />
        )}
      </DashboardCard>
    </>
  );
}
