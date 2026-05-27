import { useMemo } from "react";
import { FiActivity, FiAlertCircle, FiCalendar, FiMapPin } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import {
  AnalyticsBreakdown,
  AnalyticsFinanceHint,
  AnalyticsSchedule,
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
  getCancellationRate,
  getLastNDays,
  getTodayBookings,
  getUpcomingBookings,
  toDateKey,
} from "../../../lib/bookingAnalytics";
import { DashboardPage, StatCard, StatGrid } from "../shared/PageChrome";

export default function OwnerOverviewPage() {
  const { token, user } = useAuth();
  const today = toDateKey();
  const weekStart = getLastNDays(7)[0]?.key ?? today;

  const bookingsQuery = useQuery({
    queryKey: ["owner-analytics-bookings"],
    queryFn: () => api("/api/bookings/manage", { headers: authHeaders(token) }),
  });

  const resourcesQuery = useQuery({
    queryKey: ["owner-analytics-resources"],
    queryFn: () => api("/api/resources"),
  });

  const myResources = useMemo(
    () => (resourcesQuery.data ?? []).filter((resource) => String(resource.ownerId) === String(user?.id)),
    [resourcesQuery.data, user?.id]
  );

  const resourceMap = useMemo(() => {
    const map = {};
    myResources.forEach((resource) => {
      map[resource._id] = resource.name;
    });
    return map;
  }, [myResources]);

  const bookings = bookingsQuery.data ?? [];

  const weekBookings = useMemo(
    () => filterBookingsFromDate(bookings, weekStart),
    [bookings, weekStart]
  );

  const todayBookings = useMemo(() => getTodayBookings(bookings, today), [bookings, today]);
  const upcomingBookings = useMemo(() => getUpcomingBookings(bookings, today, 7), [bookings, today]);
  const dailyTrend = useMemo(() => buildDailyBookingCounts(bookings, 7), [bookings]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(weekBookings), [weekBookings]);
  const paymentBreakdown = useMemo(() => buildPaymentBreakdown(weekBookings), [weekBookings]);
  const venueRanking = useMemo(() => buildVenueRanking(weekBookings, resourceMap, 5), [weekBookings, resourceMap]);

  const awaitingApproval = bookings.filter((b) => b.paymentStatus === "awaiting_approval").length;
  const cancellationRate = getCancellationRate(weekBookings);
  const activeVenues = myResources.filter((r) => r.isActive !== false).length;

  return (
    <DashboardPage
      title="Analytics"
      subtitle="Booking trends, venue activity, and daily operations — revenue details are in Finance."
    >
      <StatGrid>
        <StatCard label="Today's bookings" value={todayBookings.length} icon={FiCalendar} tone="accent" />
        <StatCard
          label="Next 7 days"
          value={upcomingBookings.length}
          hint="Upcoming reservations"
          icon={FiActivity}
        />
        <StatCard
          label="Payment reviews"
          value={awaitingApproval}
          hint={awaitingApproval ? "Needs action" : "All clear"}
          icon={FiAlertCircle}
          tone="warning"
        />
        <StatCard
          label="Active venues"
          value={activeVenues}
          hint={`${cancellationRate}% cancel rate (7d)`}
          icon={FiMapPin}
          tone="success"
        />
      </StatGrid>

      <div className="dashboard-split">
        <AnalyticsTrendChart title="Bookings — last 7 days" data={dailyTrend} />
        <AnalyticsBreakdown title="Booking status mix (7d)" items={statusBreakdown} />
      </div>

      <div className="dashboard-split">
        <AnalyticsBreakdown title="Payment status mix (7d)" items={paymentBreakdown} />
        <AnalyticsVenueRanking title="Top venues (7d)" venues={venueRanking} />
      </div>

      <div className="dashboard-split">
        <AnalyticsSchedule
          title="Today's schedule"
          bookings={todayBookings}
          resourceMap={resourceMap}
          emptyMessage="No bookings scheduled for today."
        />
        <AnalyticsFinanceHint financePath="/owner/finance" />
      </div>
    </DashboardPage>
  );
}
