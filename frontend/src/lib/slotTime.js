export const APP_TIMEZONE = "Asia/Dhaka";

export function toMinutes(hhmm) {
  const [hh, mm] = String(hhmm ?? "").split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

export function getTodayDate(timezone = APP_TIMEZONE) {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

export function getCurrentMinutes(timezone = APP_TIMEZONE) {
  const str = new Date().toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return toMinutes(str);
}

/** True when the slot start time has already passed for the given date (Asia/Dhaka). */
export function isSlotPast(date, startTime, timezone = APP_TIMEZONE) {
  if (!date || !startTime) return false;
  const today = getTodayDate(timezone);
  if (date < today) return true;
  if (date > today) return false;
  return toMinutes(startTime) <= getCurrentMinutes(timezone);
}

/** Remove slots whose start time has passed in real time. */
export function filterFutureSlots(slots, date, timezone = APP_TIMEZONE) {
  return (slots ?? []).filter((slot) => !isSlotPast(date, slot.startTime, timezone));
}

/** "14:30" → "2:30 PM" */
export function formatTime12h(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start, end) {
  if (!end) return formatTime12h(start);
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}
