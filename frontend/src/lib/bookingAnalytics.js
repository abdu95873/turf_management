const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getLastNDays(count = 7) {
  const days = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(today.getTime() - offset * DAY_MS);
    const key = toDateKey(day);
    days.push({
      key,
      label: day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
    });
  }

  return days;
}

export function buildDailyBookingCounts(bookings, days = 7) {
  const timeline = getLastNDays(days);
  const counts = Object.fromEntries(timeline.map((day) => [day.key, 0]));

  (bookings ?? []).forEach((booking) => {
    if (counts[booking.bookingDate] != null) {
      counts[booking.bookingDate] += 1;
    }
  });

  return timeline.map((day) => ({
    ...day,
    count: counts[day.key] ?? 0,
  }));
}

export function buildStatusBreakdown(bookings) {
  const totals = {};
  (bookings ?? []).forEach((booking) => {
    const key = booking.bookingStatus || "unknown";
    totals[key] = (totals[key] ?? 0) + 1;
  });

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;

  return Object.entries(totals)
    .map(([status, count]) => ({
      status,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildPaymentBreakdown(bookings) {
  const totals = {};
  (bookings ?? []).forEach((booking) => {
    const key = booking.paymentStatus || "unknown";
    totals[key] = (totals[key] ?? 0) + 1;
  });

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;

  return Object.entries(totals)
    .map(([status, count]) => ({
      status,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function filterBookingsFromDate(bookings, fromDateKey) {
  return (bookings ?? []).filter((booking) => booking.bookingDate >= fromDateKey);
}

export function getTodayBookings(bookings, today = toDateKey()) {
  return (bookings ?? [])
    .filter((booking) => booking.bookingDate === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getUpcomingBookings(bookings, today = toDateKey(), days = 7) {
  const end = new Date(`${today}T12:00:00`);
  end.setDate(end.getDate() + days);
  const endKey = toDateKey(end);

  return (bookings ?? [])
    .filter((booking) => booking.bookingDate > today && booking.bookingDate <= endKey)
    .sort((a, b) => `${a.bookingDate}${a.startTime}`.localeCompare(`${b.bookingDate}${b.startTime}`));
}

export function buildVenueRanking(bookings, resourceMap, limit = 5) {
  const totals = {};
  (bookings ?? []).forEach((booking) => {
    const id = String(booking.resourceId);
    totals[id] = (totals[id] ?? 0) + 1;
  });

  return Object.entries(totals)
    .map(([resourceId, count]) => ({
      resourceId,
      name: resourceMap[resourceId] ?? "Venue",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function formatStatusLabel(status) {
  if (!status) return "Unknown";
  if (status === "no_show") return "Absent";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getCancellationRate(bookings) {
  const list = bookings ?? [];
  if (!list.length) return 0;
  const cancelled = list.filter((b) => ["cancelled", "refunded", "no_show"].includes(b.bookingStatus)).length;
  return Math.round((cancelled / list.length) * 100);
}
