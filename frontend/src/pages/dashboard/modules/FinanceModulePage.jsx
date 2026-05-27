import { useState } from "react";
import { FiDollarSign, FiPercent, FiTrendingDown, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import AdminCommissionSection from "../admin/AdminCommissionSection";
import { Alert, DashboardCard, DashboardPage, ProgressBar, StatCard, StatGrid } from "../shared/PageChrome";

function OwnerFinancePanel() {
  const { token } = useAuth();
  const earningsQuery = useQuery({
    queryKey: ["owner-earnings"],
    queryFn: () => api("/api/owner/earnings", { headers: authHeaders(token) }),
  });

  const confirmed = earningsQuery.data?.confirmed?.totalAmount ?? 0;
  const pending = earningsQuery.data?.pending?.totalAmount ?? 0;
  const refunded = earningsQuery.data?.refunded?.totalAmount ?? 0;
  const noShow = earningsQuery.data?.no_show?.totalAmount ?? 0;
  const gross = confirmed + pending;
  const refundRate = gross > 0 ? Math.round((refunded / gross) * 100) : 0;
  const noShowRate = gross > 0 ? Math.round((noShow / gross) * 100) : 0;

  return (
    <>
      <StatGrid>
        <StatCard label="Gross revenue" value={`${gross} BDT`} hint="Confirmed + pending" icon={FiDollarSign} tone="accent" />
        <StatCard label="Confirmed" value={`${confirmed} BDT`} hint={`${earningsQuery.data?.confirmed?.count ?? 0} bookings`} icon={FiTrendingUp} tone="success" />
        <StatCard label="Refund rate" value={`${refundRate}%`} hint={`${refunded} BDT`} icon={FiPercent} tone="warning" />
        <StatCard label="Absent rate" value={`${noShowRate}%`} hint={`${noShow} BDT`} icon={FiUsers} tone="danger" />
      </StatGrid>

      <div className="dashboard-split">
        <DashboardCard title="Earnings breakdown">
          {earningsQuery.isLoading ? <p className="dashboard-field-hint">Loading analytics…</p> : null}
          <ul className="dashboard-detail-list">
            <li>
              <span>Confirmed</span>
              <strong>
                {earningsQuery.data?.confirmed?.totalAmount ?? 0} BDT ({earningsQuery.data?.confirmed?.count ?? 0})
              </strong>
            </li>
            <li>
              <span>Pending</span>
              <strong>
                {earningsQuery.data?.pending?.totalAmount ?? 0} BDT ({earningsQuery.data?.pending?.count ?? 0})
              </strong>
            </li>
            <li>
              <span>Refunded</span>
              <strong>
                {refunded} BDT ({earningsQuery.data?.refunded?.count ?? 0})
              </strong>
            </li>
            <li>
              <span>Absent</span>
              <strong>
                {noShow} BDT ({earningsQuery.data?.no_show?.count ?? 0})
              </strong>
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard title="Revenue health">
          <ProgressBar label="Confirmed share" value={confirmed} max={gross || 1} />
          <ProgressBar label="Pending share" value={pending} max={gross || 1} />
        </DashboardCard>
      </div>
    </>
  );
}

function AdminFinancePanel() {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api("/api/admin/stats", { headers: authHeaders(token) }),
  });

  const stats = statsQuery.data ?? {};
  const totalRevenue = stats.totalRevenue ?? 0;
  const totalRefund = stats.totalRefund ?? 0;
  const netRevenue = totalRevenue - totalRefund;

  return (
    <>
      {message ? <Alert tone="success">{message}</Alert> : null}
      <StatGrid>
        <StatCard label="Total revenue" value={`${totalRevenue} BDT`} icon={FiDollarSign} tone="success" />
        <StatCard label="Net revenue" value={`${netRevenue} BDT`} icon={FiTrendingDown} tone="accent" />
      </StatGrid>
      <AdminCommissionSection
        commissionRate={commissionRate}
        setCommissionRate={setCommissionRate}
        setMessage={setMessage}
      />
    </>
  );
}

export default function FinanceModulePage() {
  const { user } = useAuth();

  return (
    <DashboardPage
      title="Finance"
      subtitle={user?.role === "admin" ? "Platform revenue and commission settings" : "Venue earnings and payout health"}
    >
      {user?.role === "admin" ? <AdminFinancePanel /> : <OwnerFinancePanel />}
    </DashboardPage>
  );
}
