import ManagedBookingsPanel from "../../../components/booking/ManagedBookingsPanel";
import { DashboardPage } from "../shared/PageChrome";

export default function OwnerBookingsPage() {
  return (
    <DashboardPage title="Bookings" subtitle="Manage reservations and verify manual payments">
      <ManagedBookingsPanel title="All bookings" />
    </DashboardPage>
  );
}
