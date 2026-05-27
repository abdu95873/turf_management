import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

export default function AdminVenuesSection() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [commissionEdits, setCommissionEdits] = useState({});
  const adminHeaders = authHeaders(token);

  const resourcesQuery = useQuery({
    queryKey: ["admin-resources"],
    queryFn: () => api("/api/admin/resources", { headers: adminHeaders }),
  });

  const resources = resourcesQuery.data ?? [];
  const activeVenues = resources.filter((resource) => resource.isActive !== false).length;

  const commissionMutation = useMutation({
    mutationFn: ({ resourceId, commissionRate }) =>
      api(`/api/admin/resources/${resourceId}/commission`, {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ commissionRate: Number(commissionRate) }),
      }),
    onSuccess: () => {
      setMessage("Venue commission updated.");
      resourcesQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <>
      {message ? <Alert tone="success">{message}</Alert> : null}

      <StatGrid>
        <StatCard label="Total venues" value={resources.length} />
        <StatCard label="Active" value={activeVenues} tone="success" />
        <StatCard label="Inactive" value={resources.length - activeVenues} tone="warning" />
      </StatGrid>

      <DashboardCard title="All venues" description="Override commission rate per venue (overrides global default).">
        {resourcesQuery.isLoading ? <p className="text-sm text-slate-500">Loading venues...</p> : null}
        {!resourcesQuery.isLoading && !resources.length ? (
          <EmptyState title="No venues registered" />
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Venue", render: (row) => <strong>{row.name}</strong> },
              { key: "type", label: "Type", render: (row) => <Badge tone="neutral">{row.type}</Badge> },
              { key: "locationName", label: "Location" },
              {
                key: "commission",
                label: "Commission %",
                render: (row) => (
                  <FormGrid columns={1}>
                    <Field label="" htmlFor={`commission-${row._id}`}>
                      <Input
                        id={`commission-${row._id}`}
                        type="number"
                        min="0"
                        max="100"
                        value={commissionEdits[row._id] ?? row.commissionRate ?? 10}
                        onChange={(event) =>
                          setCommissionEdits((current) => ({ ...current, [row._id]: event.target.value }))
                        }
                      />
                    </Field>
                  </FormGrid>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <Button
                    onClick={() =>
                      commissionMutation.mutate({
                        resourceId: row._id,
                        commissionRate: commissionEdits[row._id] ?? row.commissionRate ?? 10,
                      })
                    }
                  >
                    Save
                  </Button>
                ),
              },
            ]}
            rows={resources.map((resource) => ({ ...resource, id: resource._id }))}
          />
        )}
      </DashboardCard>
    </>
  );
}
