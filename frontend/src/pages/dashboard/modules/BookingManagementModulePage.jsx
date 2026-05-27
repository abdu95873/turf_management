import ManagedBookingsPanel from "../../../components/booking/ManagedBookingsPanel";
import { DashboardPage } from "../shared/PageChrome";

export default function BookingManagementModulePage() {
  return (
    <DashboardPage
      title="Booking Management"
      subtitle="Book slots for customers, verify manual payments, and manage reservations."
    >
      <ManagedBookingsPanel title="All bookings" />
    </DashboardPage>
  );
}
