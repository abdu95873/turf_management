import { API_BASE, authHeaders } from "./api";

export async function downloadBookingInvoice(bookingId, token) {
  const res = await fetch(`${API_BASE}/api/bookings/me/${bookingId}/invoice`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error("Failed to download invoice");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${bookingId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
