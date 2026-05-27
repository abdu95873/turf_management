import { useMutation, useQuery } from "@tanstack/react-query";
import { FiDownload, FiFileText } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { api, authHeaders } from "../../lib/api";
import { downloadBookingInvoice } from "../../lib/bookings";
import { DashboardCard } from "../../pages/dashboard/shared/PageChrome";

export default function InvoiceList() {
  const { token } = useAuth();

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api("/api/bookings/me", { headers: authHeaders(token) }),
    enabled: Boolean(token),
  });

  const downloadMutation = useMutation({
    mutationFn: (bookingId) => downloadBookingInvoice(bookingId, token),
  });

  const bookings = bookingsQuery.data ?? [];
  const invoiceBookings = bookings.filter((booking) =>
    ["paid", "completed", "confirmed"].includes(booking.paymentStatus)
  );

  if (bookingsQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading invoices...</p>;
  }

  if (bookingsQuery.isError) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load invoices.</p>;
  }

  if (!invoiceBookings.length) {
    return (
      <DashboardCard title="No invoices yet">
        <p className="text-sm text-slate-600">
          Invoices appear here after you complete a booking payment. Book a venue to get started.
        </p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-3">
      {invoiceBookings.map((booking) => (
        <article
          key={booking._id}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ds-accent/20 text-ds-secondary">
              <FiFileText />
            </span>
            <div>
              <h3 className="text-sm font-bold text-ds-secondary">
                Booking · {booking.bookingDate}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {booking.startTime} – {booking.endTime} · {booking.paymentStatus}
              </p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-ds-primary">
                {booking.bookingStatus}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ds-secondary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ds-primary disabled:opacity-60"
            disabled={downloadMutation.isPending}
            onClick={() => downloadMutation.mutate(booking._id)}
          >
            <FiDownload />
            Download Invoice
          </button>
        </article>
      ))}
    </div>
  );
}
