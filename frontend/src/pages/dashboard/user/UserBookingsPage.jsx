import { BookingHistory } from "../../../components/platform/PlatformSections";
import { DashboardPage } from "../shared/PageChrome";

export default function UserBookingsPage() {
  return (
    <DashboardPage title="My Bookings" subtitle="Track and manage your reservations">
      <BookingHistory />
    </DashboardPage>
  );
}
