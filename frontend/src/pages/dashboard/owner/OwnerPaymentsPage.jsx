import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../../../lib/api";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

export default function OwnerPaymentsPage({ token }) {
  const paymentsQuery = useQuery({
    queryKey: ["owner-payments"],
    queryFn: () => api("/api/payments/manage", { headers: authHeaders(token) }),
  });
  const bookingsQuery = useQuery({
    queryKey: ["owner-payments-bookings"],
    queryFn: () => api("/api/bookings/manage", { headers: authHeaders(token) }),
  });
  const resourcesQuery = useQuery({
    queryKey: ["owner-payments-resources"],
    queryFn: () => api("/api/resources"),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ transactionId, provider }) =>
      api("/api/payments/verify", {
        method: "POST",
        body: JSON.stringify({ transactionId, provider, success: true }),
      }),
    onSuccess: () => {
      paymentsQuery.refetch();
      bookingsQuery.refetch();
    },
  });

  const bookingMap = useMemo(() => {
    const map = new Map();
    (bookingsQuery.data ?? []).forEach((booking) => map.set(booking._id, booking));
    return map;
  }, [bookingsQuery.data]);

  const resourceMap = useMemo(() => {
    const map = new Map();
    (resourcesQuery.data ?? []).forEach((resource) => map.set(resource._id, resource));
    return map;
  }, [resourcesQuery.data]);

  return (
    <DashboardPage title="Owner Payments" subtitle="Payment records for your institute bookings">
      <DashboardCard title="Payment Details">
        {paymentsQuery.isLoading ? <p>Loading payment details...</p> : null}
        {!paymentsQuery.isLoading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Payment ID</th>
                  <th className="px-3 py-2 text-left">Institute</th>
                  <th className="px-3 py-2 text-left">Booking Date</th>
                  <th className="px-3 py-2 text-left">Provider</th>
                  <th className="px-3 py-2 text-left">Transaction</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {(paymentsQuery.data ?? []).map((payment) => {
                  const booking = bookingMap.get(payment.bookingId);
                  return (
                    <tr key={payment._id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-xs text-slate-500">{payment._id}</td>
                      <td className="px-3 py-2">{resourceMap.get(booking?.resourceId)?.name ?? "Institute"}</td>
                      <td className="px-3 py-2">{booking?.bookingDate ?? "-"}</td>
                      <td className="px-3 py-2 uppercase">{payment.provider}</td>
                      <td className="px-3 py-2 text-xs">{payment.transactionId || "-"}</td>
                      <td className="px-3 py-2">{payment.amount} BDT</td>
                      <td className="px-3 py-2 capitalize">{payment.status}</td>
                      <td className="px-3 py-2">
                        {payment.transactionId && ["initiated", "failed"].includes(payment.status) ? (
                          <button
                            type="button"
                            className="ghost"
                            style={{ width: "auto", marginTop: 0, minHeight: "30px" }}
                            onClick={() => verifyMutation.mutate({ transactionId: payment.transactionId, provider: payment.provider })}
                            disabled={verifyMutation.isPending}
                          >
                            Verify
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!paymentsQuery.data?.length ? (
                  <tr>
                    <td className="px-3 py-2 text-slate-500" colSpan={8}>
                      No payment records found.
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
