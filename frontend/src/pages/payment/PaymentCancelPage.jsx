import { useNavigate, useSearchParams } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import useBlockBrowserBack from "../../hooks/useBlockBrowserBack";

export default function PaymentCancelPage() {
  useBlockBrowserBack();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-ds-bg px-4">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-lg">
        <FiAlertCircle className="mx-auto text-5xl text-amber-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-ds-secondary">Payment Cancelled</h1>
        <p className="mt-2 text-sm text-slate-600">
          You cancelled the payment. Your slot has been released.
        </p>
        {bookingId ? <p className="mt-2 text-xs text-slate-500">Booking: {bookingId}</p> : null}
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-ds-primary px-4 py-3 text-sm font-bold text-white"
          onClick={() => navigate("/#venues", { replace: true })}
        >
          Back to Booking
        </button>
      </div>
    </main>
  );
}
