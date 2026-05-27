import { Link } from "react-router-dom";
import { formatStatusLabel } from "../../lib/bookingAnalytics";
import { formatTimeRange } from "../../lib/slotTime";
import { Badge, DashboardCard } from "../../pages/dashboard/shared/PageChrome";

export function AnalyticsTrendChart({ title, data, emptyMessage = "No booking data yet." }) {
  const max = Math.max(...(data ?? []).map((item) => item.count), 1);

  return (
    <DashboardCard title={title}>
      {!data?.length ? <p className="analytics-empty">{emptyMessage}</p> : null}
      {data?.length ? (
        <div className="analytics-bars" role="img" aria-label={title}>
          {data.map((item) => (
            <div key={item.key} className="analytics-bar-col">
              <div className="analytics-bar-track">
                <div className="analytics-bar-fill" style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }} />
              </div>
              <span className="analytics-bar-value">{item.count}</span>
              <span className="analytics-bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </DashboardCard>
  );
}

function breakdownTone(status) {
  if (status === "confirmed" || status === "paid") return "success";
  if (status === "pending" || status === "awaiting_approval" || status === "manual_pending") return "warning";
  if (status === "cancelled" || status === "refunded" || status === "failed" || status === "no_show") return "danger";
  return "neutral";
}

export function AnalyticsBreakdown({ title, items }) {
  return (
    <DashboardCard title={title}>
      {!items?.length ? <p className="analytics-empty">No data yet.</p> : null}
      {items?.length ? (
        <ul className="analytics-breakdown-list">
          {items.map((item) => (
            <li key={item.status} className="analytics-breakdown-item">
              <div className="analytics-breakdown-head">
                <Badge tone={breakdownTone(item.status)}>{formatStatusLabel(item.status)}</Badge>
                <span className="analytics-breakdown-count">
                  {item.count} · {item.percent}%
                </span>
              </div>
              <div className="analytics-breakdown-track">
                <div
                  className={`analytics-breakdown-fill analytics-tone-${breakdownTone(item.status)}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}

export function AnalyticsVenueRanking({ title, venues }) {
  const max = Math.max(...(venues ?? []).map((v) => v.count), 1);

  return (
    <DashboardCard title={title}>
      {!venues?.length ? <p className="analytics-empty">No venue activity yet.</p> : null}
      {venues?.length ? (
        <ul className="analytics-ranking-list">
          {venues.map((venue, index) => (
            <li key={venue.resourceId} className="analytics-ranking-item">
              <span className="analytics-ranking-rank">{index + 1}</span>
              <div className="analytics-ranking-body">
                <div className="analytics-ranking-head">
                  <span className="analytics-ranking-name">{venue.name}</span>
                  <span className="analytics-ranking-count">{venue.count} bookings</span>
                </div>
                <div className="analytics-ranking-track">
                  <div className="analytics-ranking-fill" style={{ width: `${(venue.count / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}

export function AnalyticsSchedule({ title, bookings, resourceMap, emptyMessage }) {
  return (
    <DashboardCard title={title}>
      {!bookings?.length ? <p className="analytics-empty">{emptyMessage}</p> : null}
      {bookings?.length ? (
        <ul className="analytics-schedule-list">
          {bookings.slice(0, 8).map((booking) => (
            <li key={booking._id} className="analytics-schedule-item">
              <div>
                <p className="analytics-schedule-time">{formatTimeRange(booking.startTime, booking.endTime)}</p>
                <p className="analytics-schedule-meta">
                  {resourceMap[booking.resourceId] ?? "Venue"} · {formatStatusLabel(booking.bookingStatus)}
                </p>
              </div>
              <span className="analytics-schedule-amount">{booking.amount} BDT</span>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}

export function AnalyticsFinanceHint({ financePath, roleLabel = "Finance" }) {
  return (
    <DashboardCard title="Revenue & payouts">
      <p className="analytics-finance-copy">
        Detailed earnings, refunds, and commission settings live in the {roleLabel} section.
      </p>
      <Link to={financePath} className="analytics-finance-link">
        Open {roleLabel} →
      </Link>
    </DashboardCard>
  );
}
