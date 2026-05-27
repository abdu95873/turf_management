import { useMemo } from "react";
import { FiBriefcase, FiMapPin, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  AnalyticsBreakdown,
  AnalyticsFinanceHint,
  AnalyticsTrendChart,
  AnalyticsVenueRanking,
} from "../../../components/dashboard/OverviewAnalytics";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  buildDailyBookingCounts,
  buildPaymentBreakdown,
  buildStatusBreakdown,
  buildVenueRanking,
  filterBookingsFromDate,
  getLastNDays,
  toDateKey,
} from "../../../lib/bookingAnalytics";
import { DashboardCard, DashboardPage, StatCard, StatGrid } from "../shared/PageChrome";

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const weekStart = getLastNDays(7)[0]?.key ?? toDateKey();

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api("/api/admin/stats", { headers: authHeaders(token) }),
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin-analytics-bookings"],
    queryFn: () => api("/api/bookings/manage", { headers: authHeaders(token) }),
  });

  const resourcesQuery = useQuery({
    queryKey: ["admin-analytics-resources"],
    queryFn: () => api("/api/admin/resources", { headers: authHeaders(token) }),
  });

  const stats = statsQuery.data ?? {};
  const bookings = bookingsQuery.data ?? [];

  const resourceMap = useMemo(() => {
    const map = {};
    (resourcesQuery.data ?? []).forEach((resource) => {
      map[resource._id] = resource.name;
    });
    return map;
  }, [resourcesQuery.data]);

  const weekBookings = useMemo(
    () => filterBookingsFromDate(bookings, weekStart),
    [bookings, weekStart]
  );

  const dailyTrend = useMemo(() => buildDailyBookingCounts(bookings, 7), [bookings]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(weekBookings), [weekBookings]);
  const paymentBreakdown = useMemo(() => buildPaymentBreakdown(weekBookings), [weekBookings]);
  const venueRanking = useMemo(() => buildVenueRanking(weekBookings, resourceMap, 5), [weekBookings, resourceMap]);

  const activeVenues = (resourcesQuery.data ?? []).filter((r) => r.isActive !== false).length;
  const bookingsThisWeek = weekBookings.length;
  const avgDaily = Math.round(bookingsThisWeek / 7);

  return (
    <DashboardPage
      title="Platform analytics"
      subtitle="Growth, booking activity, and marketplace health — financial reports are in Finance."
    >
      <StatGrid>
        <StatCard label="Total bookings" value={stats.totalBookings ?? 0} icon={FiBriefcase} tone="accent" />
        <StatCard label="Bookings this week" value={bookingsThisWeek} hint={`~${avgDaily}/day`} icon={FiTrendingUp} />
        <StatCard label="Active users" value={stats.activeUsers ?? 0} icon={FiUsers} tone="success" />
        <StatCard
          label="Active venues"
          value={activeVenues}
          hint={`${stats.activeOwners ?? 0} owners`}
          icon={FiMapPin}
        />
      </StatGrid>

      <div className="dashboard-split">
        <AnalyticsTrendChart title="Platform bookings — last 7 days" data={dailyTrend} />
        <DashboardCard title="Marketplace snapshot">
          <ul className="analytics-snapshot-list">
            <li>
              <span>Registered owners</span>
              <strong>{stats.activeOwners ?? 0}</strong>
            </li>
            <li>
              <span>Total venues</span>
              <strong>{stats.totalResources ?? 0}</strong>
            </li>
            <li>
              <span>Active venues</span>
              <strong>{activeVenues}</strong>
            </li>
            <li>
              <span>Bookings (7 days)</span>
              <strong>{bookingsThisWeek}</strong>
            </li>
          </ul>
        </DashboardCard>
      </div>

      <div className="dashboard-split">
        <AnalyticsBreakdown title="Booking status mix (7d)" items={statusBreakdown} />
        <AnalyticsBreakdown title="Payment status mix (7d)" items={paymentBreakdown} />
      </div>

      <div className="dashboard-split">
        <AnalyticsVenueRanking title="Top venues platform-wide (7d)" venues={venueRanking} />
        <AnalyticsFinanceHint financePath="/admin/finance" />
      </div>
    </DashboardPage>
  );
}
