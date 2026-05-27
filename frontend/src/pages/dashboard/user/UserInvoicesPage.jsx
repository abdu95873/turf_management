import InvoiceList from "../../../components/user/InvoiceList";
import { DashboardPage } from "../shared/PageChrome";

export default function UserInvoicesPage() {
  return (
    <DashboardPage title="Invoices" subtitle="Download receipts for your completed bookings">
      <InvoiceList />
    </DashboardPage>
  );
}
