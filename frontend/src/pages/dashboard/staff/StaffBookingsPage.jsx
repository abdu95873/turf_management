import ManagedBookingsPanel from "../../../components/booking/ManagedBookingsPanel";
import { DashboardPage } from "../shared/PageChrome";

export default function StaffBookingsPage() {
  return (
    <DashboardPage title="Bookings" subtitle="Handle customer reservations and payment verification">
      <ManagedBookingsPanel title="Assigned bookings" />
    </DashboardPage>
  );
}
