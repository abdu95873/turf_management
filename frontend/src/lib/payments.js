import { api, authHeaders } from "./api";

export const DEFAULT_ONLINE_PAYMENT_PROVIDER =
  import.meta.env.VITE_PAYMENT_PROVIDER ?? "sslcommerz";

export async function createBooking(token, slotId) {
  return api("/api/bookings", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      slotId,
      idempotencyKey: `${slotId}-${Date.now()}`,
    }),
  });
}

export async function submitManualPayment(token, bookingId, transactionId, note = "") {
  return api(`/api/bookings/me/${bookingId}/manual-payment`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ transactionId, note }),
  });
}

export async function initiateOnlinePayment(token, bookingId) {
  return api("/api/payments/initiate", {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "x-idempotency-key": `sslcommerz-${bookingId}-${Date.now()}`,
    },
    body: JSON.stringify({
      bookingId,
      provider: DEFAULT_ONLINE_PAYMENT_PROVIDER,
    }),
  });
}

export async function verifySandboxPayment(transactionId, provider = DEFAULT_ONLINE_PAYMENT_PROVIDER, token = null) {
  return api("/api/payments/verify", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      transactionId,
      provider,
      success: true,
    }),
  });
}

export async function fetchPaymentStatus({ tranId, bookingId }) {
  const params = new URLSearchParams();
  if (tranId) params.set("tran_id", tranId);
  if (bookingId) params.set("bookingId", bookingId);
  return api(`/api/payments/status?${params.toString()}`);
}

export function paymentStatusLabel(status) {
  if (status === "manual_pending") return "Payment required";
  if (status === "awaiting_approval") return "Awaiting verification";
  if (status === "pending") return "Online payment pending";
  if (status === "paid") return "Paid";
  if (status === "failed") return "Payment failed";
  if (status === "refunded") return "Refunded";
  return status;
}
