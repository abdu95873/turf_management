import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import useBlockBrowserBack from "../../hooks/useBlockBrowserBack";
import { fetchPaymentStatus } from "../../lib/payments";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-all font-semibold">{value}</dd>
    </div>
  );
}

export default function PaymentSuccessPage() {
  useBlockBrowserBack();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tranId = searchParams.get("tran_id") || "";
  const bookingId = searchParams.get("bookingId") || "";
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus({ tranId, bookingId })
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
  }, [tranId, bookingId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ds-bg px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-green-200 bg-white p-8 text-center shadow-lg">
        <FiCheckCircle className="mx-auto text-5xl text-green-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-ds-secondary">Payment Successful</h1>
        <p className="mt-2 text-sm text-slate-600">Your booking is confirmed.</p>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading order details...</p>
        ) : details ? (
          <dl className="mt-6 space-y-2 rounded-xl bg-green-50 p-4 text-left text-sm">
            <DetailRow label="Transaction ID" value={details.transactionId} />
            <DetailRow label="Booking ID" value={details.bookingId} />
            <DetailRow
              label="Amount"
              value={details.amount != null ? `${details.amount} BDT` : null}
            />
          </dl>
        ) : null}

        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-ds-accent px-4 py-3 text-sm font-bold text-ds-dark"
          onClick={() => navigate("/", { replace: true })}
        >
          Go to Home
        </button>
        <button
          type="button"
          className="mt-3 w-full text-sm font-semibold text-ds-primary hover:underline"
          onClick={() => navigate("/account/bookings", { replace: true })}
        >
          View My Bookings
        </button>
      </div>
    </main>
  );
}
