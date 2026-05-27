import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBookingAuthMessage } from "../../lib/api";
import { verifySandboxPayment } from "../../lib/payments";

export default function PaymentSimulatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const transactionId = searchParams.get("transactionId") || "";
  const bookingId = searchParams.get("bookingId") || "";
  const amount = searchParams.get("amount") || "";
  const [message, setMessage] = useState("");

  const verifyMutation = useMutation({
    mutationFn: () => verifySandboxPayment(transactionId, "sslcommerz", token),
    onSuccess: () => {
      const params = new URLSearchParams();
      if (transactionId) params.set("tran_id", transactionId);
      if (bookingId) params.set("bookingId", bookingId);
      navigate(`/payment/success?${params.toString()}`, { replace: true });
    },
    onError: (error) => {
      if (error?.status === 401) {
        navigate("/auth/login", {
          state: {
            from: `/payment/simulate?${searchParams.toString()}`,
            notice: getBookingAuthMessage(error),
          },
        });
        return;
      }
      setMessage(error?.message || "Payment verification failed.");
    },
  });

  return (
    <main className="min-h-screen bg-ds-bg px-4 py-24 font-sans text-ds-secondary">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <span className="text-xs font-bold uppercase tracking-widest text-ds-primary">Sandbox</span>
        <h1 className="mt-2 text-2xl font-extrabold">SSLCommerz Checkout</h1>
        <p className="mt-3 text-sm text-slate-600">
          This simulates a successful SSLCommerz payment. Click below to confirm your booking.
        </p>

        <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          {amount ? (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-semibold">{amount} BDT</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Transaction ID</dt>
            <dd className="break-all font-semibold">{transactionId || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Booking ID</dt>
            <dd className="break-all font-semibold">{bookingId || "—"}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-ds-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-ds-secondary disabled:opacity-60"
          disabled={!transactionId || verifyMutation.isPending}
          onClick={() => {
            if (!token) {
              navigate("/auth/login", {
                state: {
                  from: `/payment/simulate?${searchParams.toString()}`,
                  notice: "Please log in to complete payment.",
                },
              });
              return;
            }
            verifyMutation.mutate();
          }}
        >
          {verifyMutation.isPending ? "Verifying..." : "Complete Sandbox Payment"}
        </button>

        {message ? <p className="mt-4 text-sm font-medium text-ds-primary">{message}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/account/bookings" className="text-sm font-semibold text-ds-primary hover:underline">
            My Bookings
          </Link>
          <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
