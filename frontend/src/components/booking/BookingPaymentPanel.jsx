import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBookingAuthMessage } from "../../lib/api";
import {
  createBooking,
  paymentStatusLabel,
  submitManualPayment,
} from "../../lib/payments";

export default function BookingPaymentPanel({ slotId, amount, onComplete, className = "" }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [pendingBookingId, setPendingBookingId] = useState("");
  const [feedback, setFeedback] = useState("");

  const ensureCanBook = () => {
    if (!token) {
      navigate("/auth/login", { state: { notice: "Please log in to book a venue." } });
      return false;
    }
    if (user?.role && user.role !== "user") {
      setFeedback("Only customer accounts can book venues. Log in with a user account.");
      return false;
    }
    return true;
  };

  const bookMutation = useMutation({
    mutationFn: async () => {
      const booking = await createBooking(token, slotId);
      if (paymentMethod === "manual") {
        setPendingBookingId(booking._id);
        return { booking, mode: "manual" };
      }
      return { booking, mode: "online" };
    },
    onSuccess: (result) => {
      if (result.mode === "online") {
        navigate(`/payment?bookingId=${result.booking._id}`, { replace: true });
        onComplete?.(result.booking);
      } else {
        setFeedback("Booking created. Submit your transaction ID below.");
      }
    },
    onError: (error) => {
      if (error?.status === 401) {
        navigate("/auth/login", { state: { notice: getBookingAuthMessage(error) } });
        return;
      }
      setFeedback(getBookingAuthMessage(error) || "Booking failed.");
    },
  });

  const manualMutation = useMutation({
    mutationFn: () => submitManualPayment(token, pendingBookingId, transactionId.trim(), paymentNote.trim()),
    onSuccess: (result) => {
      setFeedback(result.message || "Payment submitted for review.");
      setPendingBookingId("");
      setTransactionId("");
      setPaymentNote("");
      onComplete?.(result.booking);
    },
    onError: (error) => {
      setFeedback(getBookingAuthMessage(error) || "Failed to submit transaction ID.");
    },
  });

  const handleBook = () => {
    if (!ensureCanBook()) return;
    if (!slotId) {
      setFeedback("Please select a time slot first.");
      return;
    }
    setFeedback("");
    bookMutation.mutate();
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    if (!transactionId.trim()) {
      setFeedback("Transaction ID is required.");
      return;
    }
    setFeedback("");
    manualMutation.mutate();
  };

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Payment Method</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("manual")}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
              paymentMethod === "manual"
                ? "border-ds-primary bg-white text-ds-primary shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-ds-primary/40"
            }`}
          >
            Manual payment
            <span className="mt-0.5 block text-xs font-normal text-slate-500">Trx ID for owner approval</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("online")}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition ${
              paymentMethod === "online"
                ? "border-ds-primary bg-white text-ds-primary shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-ds-primary/40"
            }`}
          >
            SSLCommerz
            <span className="mt-0.5 block text-xs font-normal text-slate-500">Sandbox checkout</span>
          </button>
        </div>
      </div>

      {amount ? (
        <p className="text-sm font-bold text-ds-secondary">
          Amount: <span className="text-ds-primary">{amount} BDT</span>
        </p>
      ) : null}

      {!pendingBookingId ? (
        <button
          type="button"
          className="w-full rounded-xl bg-ds-secondary px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-ds-primary disabled:opacity-60"
          disabled={!slotId || bookMutation.isPending}
          onClick={handleBook}
        >
          {bookMutation.isPending
            ? "Processing..."
            : paymentMethod === "manual"
              ? "Create Booking Request"
              : "Book & Pay with SSLCommerz"}
        </button>
      ) : (
        <form className="space-y-3 rounded-xl border border-ds-accent/40 bg-ds-accent/10 p-4" onSubmit={handleManualSubmit}>
          <p className="text-sm font-semibold text-ds-secondary">
            {paymentStatusLabel("awaiting_approval")} — enter your payment transaction ID.
          </p>
          <div>
            <label htmlFor="manual-trx-id" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Transaction ID
            </label>
            <input
              id="manual-trx-id"
              type="text"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              placeholder="e.g. 8N90ABCD12"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20"
            />
          </div>
          <div>
            <label htmlFor="manual-note" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Note (optional)
            </label>
            <input
              id="manual-note"
              type="text"
              value={paymentNote}
              onChange={(event) => setPaymentNote(event.target.value)}
              placeholder="Sender number or reference"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-ds-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-ds-secondary disabled:opacity-60"
            disabled={manualMutation.isPending}
          >
            {manualMutation.isPending ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>
      )}

      {feedback ? (
        <p className={`text-sm font-medium ${bookMutation.isError || manualMutation.isError ? "text-red-600" : "text-ds-primary"}`}>
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
