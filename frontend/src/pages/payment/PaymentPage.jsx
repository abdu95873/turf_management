import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getBookingAuthMessage } from "../../lib/api";
import { initiateOnlinePayment } from "../../lib/payments";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/auth/login", {
        replace: true,
        state: { from: `/payment?bookingId=${bookingId}`, notice: "Please log in to pay." },
      });
      return;
    }

    if (!bookingId) {
      setError("Missing booking ID.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const payment = await initiateOnlinePayment(token, bookingId);
        if (cancelled) return;

        if (payment?.checkoutUrl) {
          // replace: drop /payment from history before SSLCommerz so Back won't return here
          window.location.replace(payment.checkoutUrl);
          return;
        }

        setError("Payment gateway URL was not returned.");
      } catch (err) {
        if (!cancelled) {
          setError(getBookingAuthMessage(err) || "Could not start payment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, bookingId, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ds-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        {error ? (
          <>
            <h1 className="text-xl font-extrabold text-red-600">Payment Error</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-ds-primary px-4 py-3 text-sm font-bold text-white"
              onClick={() => navigate(`/payment?bookingId=${bookingId}`, { replace: true })}
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-extrabold text-ds-secondary">Redirecting to SSLCommerz</h1>
            <p className="mt-2 text-sm text-slate-600">Connecting to secure payment gateway...</p>
            <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-ds-accent border-t-transparent" />
          </>
        )}
      </div>
    </main>
  );
}
