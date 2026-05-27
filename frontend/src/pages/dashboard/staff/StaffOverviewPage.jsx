import { useMemo } from "react";
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  AnalyticsBreakdown,
  AnalyticsSchedule,
  AnalyticsTrendChart,
} from "../../../components/dashboard/OverviewAnalytics";
import { useAuth } from "../../../context/AuthContext";
import { api, authHeaders } from "../../../lib/api";
import {
  buildDailyBookingCounts,
  buildStatusBreakdown,
  filterBookingsFromDate,
  getLastNDays,
  getTodayBookings,
  toDateKey,
} from "../../../lib/bookingAnalytics";
import { DashboardPage, StatCard, StatGrid } from "../shared/PageChrome";

export default function StaffOverviewPage() {
  const { token } = useAuth();
  const today = toDateKey();
  const weekStart = getLastNDays(7)[0]?.key ?? today;

  const bookingsQuery = useQuery({
    queryKey: ["staff-analytics-bookings"],
    queryFn: () => api("/api/bookings/manage", { headers: authHeaders(token) }),
  });

  const resourcesQuery = useQuery({
    queryKey: ["staff-analytics-resources"],
    queryFn: () => api("/api/resources"),
  });

  const resourceMap = useMemo(() => {
    const map = {};
    (resourcesQuery.data ?? []).forEach((resource) => {
      map[resource._id] = resource.name;
    });
    return map;
  }, [resourcesQuery.data]);

  const bookings = bookingsQuery.data ?? [];
  const todayBookings = useMemo(() => getTodayBookings(bookings, today), [bookings, today]);
  const weekBookings = useMemo(
    () => filterBookingsFromDate(bookings, weekStart),
    [bookings, weekStart]
  );

  const metrics = useMemo(() => {
    const awaitingApproval = bookings.filter((b) => b.paymentStatus === "awaiting_approval");
    const confirmedToday = todayBookings.filter((b) => b.bookingStatus === "confirmed");
    const pendingToday = todayBookings.filter((b) => b.bookingStatus === "pending");

    return {
      awaitingApproval: awaitingApproval.length,
      confirmedToday: confirmedToday.length,
      pendingToday: pendingToday.length,
    };
  }, [bookings, todayBookings]);

  const dailyTrend = useMemo(() => buildDailyBookingCounts(bookings, 7), [bookings]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(weekBookings), [weekBookings]);

  return (
    <DashboardPage title="Operations analytics" subtitle="Today's workload and weekly booking activity">
      <StatGrid>
        <StatCard label="Today's bookings" value={todayBookings.length} icon={FiCalendar} tone="accent" />
        <StatCard label="Payment reviews" value={metrics.awaitingApproval} icon={FiAlertCircle} tone="warning" />
        <StatCard label="Confirmed today" value={metrics.confirmedToday} icon={FiCheckCircle} tone="success" />
        <StatCard label="Pending today" value={metrics.pendingToday} icon={FiClock} />
      </StatGrid>

      <div className="dashboard-split">
        <AnalyticsTrendChart title="Weekly booking volume" data={dailyTrend} />
        <AnalyticsBreakdown title="Booking status mix (7d)" items={statusBreakdown} />
      </div>

      <AnalyticsSchedule
        title="Today's schedule"
        bookings={todayBookings}
        resourceMap={resourceMap}
        emptyMessage="No bookings on today's calendar."
      />
    </DashboardPage>
  );
}
