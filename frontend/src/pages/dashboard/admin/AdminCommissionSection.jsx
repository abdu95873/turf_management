import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  Alert,
  Button,
  DashboardCard,
  Field,
  FormGrid,
  Input,
  ProgressBar,
  StatCard,
  StatGrid,
} from "../shared/PageChrome";

export default function AdminCommissionSection({ commissionRate, setCommissionRate, setMessage }) {
  const { token } = useAuth();
  const adminHeaders = authHeaders(token);

  const commissionQuery = useQuery({
    queryKey: ["admin-commission"],
    queryFn: () => api("/api/admin/commission", { headers: adminHeaders }),
  });

  useEffect(() => {
    if (commissionQuery.data?.commissionRate !== undefined) {
      setCommissionRate(String(commissionQuery.data.commissionRate));
    }
  }, [commissionQuery.data, setCommissionRate]);

  const commissionMutation = useMutation({
    mutationFn: () =>
      api("/api/admin/commission", {
        method: "PUT",
        headers: adminHeaders,
        body: JSON.stringify({ commissionRate: Number(commissionRate) }),
      }),
    onSuccess: () => {
      setMessage("Commission rate saved successfully.");
      commissionQuery.refetch();
    },
    onError: (err) => setMessage(err.message),
  });

  const rate = Number(commissionRate) || 0;

  return (
    <>
      <StatGrid>
        <StatCard label="Global commission" value={`${rate}%`} tone="accent" />
        <StatCard label="Owner share" value={`${100 - rate}%`} hint="Approx. venue payout" tone="success" />
      </StatGrid>

      <DashboardCard title="Platform commission" description="Default commission taken on each booking before owner payout.">
        <FormGrid>
          <Field label="Commission rate (%)" htmlFor="commission-rate" hint="Between 0 and 100">
            <Input
              id="commission-rate"
              type="number"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(event) => setCommissionRate(event.target.value)}
            />
          </Field>
        </FormGrid>

        <div className="mt-6">
          <ProgressBar label="Platform fee share" value={rate} max={100} />
          <ProgressBar label="Owner revenue share" value={100 - rate} max={100} />
        </div>

        <div className="mt-6">
          <Button onClick={() => commissionMutation.mutate()} disabled={commissionMutation.isPending}>
            {commissionMutation.isPending ? "Saving..." : "Save commission settings"}
          </Button>
        </div>

        {commissionQuery.isLoading ? (
          <Alert tone="info">Loading current settings...</Alert>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Current saved rate: <strong>{commissionQuery.data?.commissionRate ?? 10}%</strong>
          </p>
        )}
      </DashboardCard>
    </>
  );
}
