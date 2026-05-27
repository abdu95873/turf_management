import OwnerStaffSection from "./OwnerStaffSection";
import { DashboardPage } from "../shared/PageChrome";

export default function OwnerStaffPage() {
  return (
    <DashboardPage title="Staff management" subtitle="Add staff accounts and control access to your venues">
      <OwnerStaffSection />
    </DashboardPage>
  );
}
