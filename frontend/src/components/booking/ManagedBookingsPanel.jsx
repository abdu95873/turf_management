import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import CreateManagedBookingForm from "./CreateManagedBookingForm";
import { useAuth } from "../../context/AuthContext";
import { api, authHeaders } from "../../lib/api";
import { paymentStatusLabel } from "../../lib/payments";
import { formatBookingStatusLabel } from "../../lib/bookingStatus";
import { formatTimeRange } from "../../lib/slotTime";
import {
  Alert,
  Badge,
  DashboardCard,
  EmptyState,
  Field,
  Input,
  Select,
  StatCard,
  StatGrid,
} from "../../pages/dashboard/shared/PageChrome";

const FILTERS = [
  { key: "all", label: "All bookings" },
  { key: "approval", label: "Payment review" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
];

function bookingBadgeTone(status) {
  if (status === "paid" || status === "confirmed") return "success";
  if (status === "awaiting_approval" || status === "pending" || status === "manual_pending") return "warning";
  if (status === "failed" || status === "cancelled" || status === "refunded" || status === "no_show") return "danger";
  return "neutral";
}

function formatBookingDate(date) {
  if (!date) return "—";
  try {
    const parsed = new Date(`${date}T12:00:00`);
    return parsed.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

function canRefundPayment(booking) {
  return (
    booking.bookingStatus === "cancelled" &&
    ["paid", "awaiting_approval"].includes(booking.paymentStatus)
  );
}

function isPaymentPaid(booking) {
  return booking.paymentStatus === "paid";
}

export default function ManagedBookingsPanel({ title = "Bookings", description }) {
  const { token } = useAuth();
  const [reviewNote, setReviewNote] = useState({});
  const [manualConfirmForm, setManualConfirmForm] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reviewExpandedId, setReviewExpandedId] = useState("");
  const [confirmExpandedId, setConfirmExpandedId] = useState("");

  const managedBookingsQuery = useQuery({
    queryKey: ["managed-bookings"],
    queryFn: () => api("/api/bookings/manage", { headers: authHeaders(token) }),
  });

  const resourcesQuery = useQuery({
    queryKey: ["booking-mgmt-venues"],
    queryFn: () => api("/api/resources"),
  });

  const resourceMap = useMemo(() => {
    const map = {};
    (resourcesQuery.data ?? []).forEach((resource) => {
      map[resource._id] = resource.name;
    });
    return map;
  }, [resourcesQuery.data]);

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, bookingStatus, paymentStatus, transactionId, note }) =>
      api(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          bookingStatus,
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(transactionId ? { transactionId } : {}),
          ...(note ? { note } : {}),
        }),
      }),
    onSuccess: () => {
      setReviewExpandedId("");
      setConfirmExpandedId("");
      managedBookingsQuery.refetch();
    },
  });

  function handleConfirmClick(booking) {
    if (isPaymentPaid(booking)) {
      statusMutation.mutate({ bookingId: booking._id, bookingStatus: "confirmed" });
      return;
    }
    setReviewExpandedId("");
    setConfirmExpandedId((current) => (current === booking._id ? "" : booking._id));
  }

  function submitManualConfirm(booking) {
    const form = manualConfirmForm[booking._id] ?? { transactionId: "", note: "" };
    statusMutation.mutate({
      bookingId: booking._id,
      bookingStatus: "confirmed",
      transactionId: form.transactionId.trim(),
      note: form.note.trim(),
    });
    setManualConfirmForm((current) => ({
      ...current,
      [booking._id]: { transactionId: "", note: "" },
    }));
  }

  const reviewMutation = useMutation({
    mutationFn: ({ bookingId, action, note }) =>
      api(`/api/bookings/${bookingId}/manual-review`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ action, note }),
      }),
    onSuccess: () => {
      setReviewExpandedId("");
      managedBookingsQuery.refetch();
    },
  });

  const bookings = managedBookingsQuery.data ?? [];
  const pendingManual = bookings.filter((booking) => booking.paymentStatus === "awaiting_approval");
  const confirmed = bookings.filter((booking) => booking.bookingStatus === "confirmed");
  const pending = bookings.filter((booking) => booking.bookingStatus === "pending");

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (filter === "approval") list = pendingManual;
    else if (filter === "confirmed") list = bookings.filter((b) => b.bookingStatus === "confirmed");
    else if (filter === "pending") list = bookings.filter((b) => b.bookingStatus === "pending");

    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list.filter((booking) => {
      const venue = resourceMap[booking.resourceId] ?? "";
      const haystack = [
        booking._id,
        booking.bookingDate,
        booking.manualTransactionId,
        venue,
        String(booking.amount),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [bookings, filter, pendingManual, search, resourceMap]);

  const filterCounts = useMemo(
    () => ({
      all: bookings.length,
      approval: pendingManual.length,
      pending: pending.length,
      confirmed: confirmed.length,
    }),
    [bookings.length, pendingManual.length, pending.length, confirmed.length]
  );

  return (
    <>
      <CreateManagedBookingForm onCreated={() => managedBookingsQuery.refetch()} />

      <StatGrid>
        <StatCard label="Total bookings" value={bookings.length} icon={FiCalendar} />
        <StatCard
          label="Awaiting payment review"
          value={pendingManual.length}
          tone="warning"
          icon={FiAlertCircle}
          hint={pendingManual.length ? "Action required" : "All clear"}
        />
        <StatCard label="Confirmed" value={confirmed.length} tone="success" icon={FiCheckCircle} />
        <StatCard label="Pending" value={pending.length} tone="accent" icon={FiClock} />
      </StatGrid>

      {pendingManual.length ? (
        <Alert tone="warning">
          <strong>{pendingManual.length}</strong> manual payment{pendingManual.length === 1 ? "" : "s"} awaiting
          verification — review transaction IDs in the Payment review tab.
        </Alert>
      ) : null}

      <DashboardCard
        title={title}
        description={description ?? "Track reservations, verify payments, and update booking status."}
        className="booking-mgmt-card"
      >
        <div className="booking-mgmt-toolbar">
          <div className="booking-mgmt-search">
            <FiSearch className="booking-mgmt-search-icon" aria-hidden="true" />
            <input
              type="search"
              className="dashboard-input booking-mgmt-search-input"
              placeholder="Search by date, venue, amount, or transaction ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="booking-mgmt-toolbar-actions">
            <Field label="Filter" htmlFor="booking-filter" className="booking-mgmt-filter-field">
              <Select
                id="booking-filter"
                className="booking-mgmt-filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {FILTERS.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} ({filterCounts[item.key] ?? 0})
                  </option>
                ))}
              </Select>
            </Field>
            <button
              type="button"
              className="booking-mgmt-btn booking-mgmt-btn-neutral"
              disabled={managedBookingsQuery.isFetching}
              onClick={() => managedBookingsQuery.refetch()}
            >
              <FiRefreshCw className={managedBookingsQuery.isFetching ? "booking-mgmt-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {managedBookingsQuery.isLoading ? (
          <p className="booking-mgmt-loading">Loading bookings…</p>
        ) : null}

        {managedBookingsQuery.isError ? (
          <Alert tone="danger">Could not load bookings. Please refresh and try again.</Alert>
        ) : null}

        {!managedBookingsQuery.isLoading && !filteredBookings.length ? (
          <EmptyState
            title="No bookings found"
            description={
              search.trim()
                ? "Try a different search term or clear the filter."
                : "Bookings will appear here when customers reserve your venues."
            }
          />
        ) : null}

        {!managedBookingsQuery.isLoading && filteredBookings.length ? (
          <div className="dashboard-table-wrap booking-mgmt-table-wrap">
            <table className="dashboard-table booking-mgmt-table">
              <thead>
                <tr>
                  <th>Schedule</th>
                  <th>Venue</th>
                  <th>Amount</th>
                  <th>Booking</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const needsReview = booking.paymentStatus === "awaiting_approval";
                  const isReviewOpen = reviewExpandedId === booking._id;
                  const isConfirmOpen = confirmExpandedId === booking._id;
                  const isCancelled = booking.bookingStatus === "cancelled";
                  const isFinal = ["refunded", "no_show"].includes(booking.bookingStatus);
                  const showRefund = canRefundPayment(booking);
                  const showManageActions = !needsReview && !isCancelled && !isFinal;

                  return (
                    <Fragment key={booking._id}>
                      <tr className={needsReview ? "booking-mgmt-row-review" : isConfirmOpen ? "booking-mgmt-row-cancel" : ""}>
                        <td>
                          <p className="booking-mgmt-primary">{formatBookingDate(booking.bookingDate)}</p>
                          <p className="booking-mgmt-muted">
                            {formatTimeRange(booking.startTime, booking.endTime)}
                          </p>
                        </td>
                        <td>
                          <p className="booking-mgmt-primary">
                            {resourceMap[booking.resourceId] ?? "Venue"}
                          </p>
                          <p className="booking-mgmt-muted booking-mgmt-id">#{String(booking._id).slice(-8)}</p>
                        </td>
                        <td>
                          <p className="booking-mgmt-amount">{booking.amount} BDT</p>
                          {booking.paymentMethod ? (
                            <p className="booking-mgmt-muted">
                              {String(booking.paymentMethod ?? "")
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                            </p>
                          ) : null}
                        </td>
                        <td>
                          <Badge tone={bookingBadgeTone(booking.bookingStatus)}>
                            {formatBookingStatusLabel(booking.bookingStatus)}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={bookingBadgeTone(booking.paymentStatus)}>
                            {paymentStatusLabel(booking.paymentStatus)}
                          </Badge>
                          {booking.manualTransactionId ? (
                            <p className="booking-mgmt-trx">Trx: {booking.manualTransactionId}</p>
                          ) : null}
                        </td>
                        <td>
                          {needsReview ? (
                            <button
                              type="button"
                              className={`booking-mgmt-btn ${isReviewOpen ? "booking-mgmt-btn-neutral" : "booking-mgmt-btn-review"}`}
                              onClick={() => setReviewExpandedId(isReviewOpen ? "" : booking._id)}
                            >
                              {isReviewOpen ? "Close" : "Review"}
                            </button>
                          ) : isCancelled ? (
                            <div className="booking-mgmt-actions">
                              <button
                                type="button"
                                className={`booking-mgmt-btn ${isConfirmOpen ? "booking-mgmt-btn-neutral" : "booking-mgmt-btn-confirm"}`}
                                disabled={statusMutation.isPending}
                                onClick={() => handleConfirmClick(booking)}
                              >
                                {isConfirmOpen ? "Close" : "Confirm"}
                              </button>
                              {showRefund ? (
                                <button
                                  type="button"
                                  className="booking-mgmt-btn booking-mgmt-btn-danger"
                                  disabled={statusMutation.isPending}
                                  onClick={() =>
                                    statusMutation.mutate({
                                      bookingId: booking._id,
                                      bookingStatus: "refunded",
                                      paymentStatus: "refunded",
                                    })
                                  }
                                >
                                  Refund
                                </button>
                              ) : null}
                            </div>
                          ) : showManageActions ? (
                            <div className="booking-mgmt-actions">
                              <button
                                type="button"
                                className={`booking-mgmt-btn ${isConfirmOpen ? "booking-mgmt-btn-neutral" : "booking-mgmt-btn-confirm"}`}
                                disabled={statusMutation.isPending || booking.bookingStatus === "confirmed"}
                                onClick={() => handleConfirmClick(booking)}
                              >
                                {isConfirmOpen ? "Close" : "Confirm"}
                              </button>
                              <button
                                type="button"
                                className="booking-mgmt-btn booking-mgmt-btn-cancel"
                                disabled={statusMutation.isPending}
                                onClick={() =>
                                  statusMutation.mutate({ bookingId: booking._id, bookingStatus: "cancelled" })
                                }
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="booking-mgmt-btn booking-mgmt-btn-warning"
                                disabled={statusMutation.isPending}
                                onClick={() =>
                                  statusMutation.mutate({ bookingId: booking._id, bookingStatus: "no_show" })
                                }
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <span className="booking-mgmt-muted">—</span>
                          )}
                        </td>
                      </tr>
                      {needsReview && isReviewOpen ? (
                        <tr className="booking-mgmt-review-row">
                          <td colSpan={6}>
                            <div className="booking-mgmt-review-panel">
                              <div className="booking-mgmt-review-meta">
                                <div>
                                  <p className="booking-mgmt-review-label">Transaction ID</p>
                                  <p className="booking-mgmt-review-value">{booking.manualTransactionId || "—"}</p>
                                </div>
                                {booking.manualPaymentNote ? (
                                  <div>
                                    <p className="booking-mgmt-review-label">Customer note</p>
                                    <p className="booking-mgmt-review-value">{booking.manualPaymentNote}</p>
                                  </div>
                                ) : null}
                              </div>
                              <Field label="Review note (optional)" htmlFor={`note-${booking._id}`}>
                                <Input
                                  id={`note-${booking._id}`}
                                  value={reviewNote[booking._id] ?? ""}
                                  onChange={(event) =>
                                    setReviewNote((current) => ({
                                      ...current,
                                      [booking._id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Verified sender number or internal note"
                                />
                              </Field>
                              <div className="booking-mgmt-review-actions">
                                <button
                                  type="button"
                                  className="booking-mgmt-btn booking-mgmt-btn-confirm"
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    reviewMutation.mutate({
                                      bookingId: booking._id,
                                      action: "approve",
                                      note: reviewNote[booking._id] ?? "",
                                    })
                                  }
                                >
                                  <FiCheck />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="booking-mgmt-btn booking-mgmt-btn-danger"
                                  disabled={reviewMutation.isPending}
                                  onClick={() =>
                                    reviewMutation.mutate({
                                      bookingId: booking._id,
                                      action: "reject",
                                      note: reviewNote[booking._id] ?? "",
                                    })
                                  }
                                >
                                  <FiX />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                      {isConfirmOpen ? (
                        <tr className="booking-mgmt-cancel-row">
                          <td colSpan={6}>
                            <div className="booking-mgmt-review-panel booking-mgmt-cancel-panel">
                              <p className="booking-mgmt-cancel-lead">
                                {isPaymentPaid(booking)
                                  ? "Confirm this booking."
                                  : "Record manual payment to confirm this booking."}
                              </p>
                              {!isPaymentPaid(booking) ? (
                                <>
                                  <Field label="Transaction ID" htmlFor={`confirm-trx-${booking._id}`}>
                                    <Input
                                      id={`confirm-trx-${booking._id}`}
                                      value={manualConfirmForm[booking._id]?.transactionId ?? ""}
                                      onChange={(event) =>
                                        setManualConfirmForm((current) => ({
                                          ...current,
                                          [booking._id]: {
                                            transactionId: event.target.value,
                                            note: current[booking._id]?.note ?? "",
                                          },
                                        }))
                                      }
                                      placeholder="bKash / Nagad / cash reference"
                                    />
                                  </Field>
                                  <Field label="Payment note (optional)" htmlFor={`confirm-note-${booking._id}`}>
                                    <Input
                                      id={`confirm-note-${booking._id}`}
                                      value={manualConfirmForm[booking._id]?.note ?? ""}
                                      onChange={(event) =>
                                        setManualConfirmForm((current) => ({
                                          ...current,
                                          [booking._id]: {
                                            transactionId: current[booking._id]?.transactionId ?? "",
                                            note: event.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="Sender number or internal note"
                                    />
                                  </Field>
                                </>
                              ) : null}
                              <div className="booking-mgmt-review-actions">
                                <button
                                  type="button"
                                  className="booking-mgmt-btn booking-mgmt-btn-confirm"
                                  disabled={
                                    statusMutation.isPending ||
                                    (!isPaymentPaid(booking) &&
                                      (manualConfirmForm[booking._id]?.transactionId?.trim().length ?? 0) < 4)
                                  }
                                  onClick={() =>
                                    isPaymentPaid(booking)
                                      ? statusMutation.mutate({ bookingId: booking._id, bookingStatus: "confirmed" })
                                      : submitManualConfirm(booking)
                                  }
                                >
                                  {isPaymentPaid(booking) ? "Confirm booking" : "Confirm with manual payment"}
                                </button>
                                <button
                                  type="button"
                                  className="booking-mgmt-btn booking-mgmt-btn-neutral"
                                  onClick={() => setConfirmExpandedId("")}
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardCard>
    </>
  );
}
