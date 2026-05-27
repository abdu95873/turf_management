const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  no_show: "Absent",
};

export function formatBookingStatusLabel(status) {
  if (!status) return "—";
  if (BOOKING_STATUS_LABELS[status]) return BOOKING_STATUS_LABELS[status];
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
