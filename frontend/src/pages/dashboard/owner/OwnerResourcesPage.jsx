import OwnerResourcesPanel from "./OwnerResourcesPanel";
import { DashboardPage } from "../shared/PageChrome";

export default function OwnerResourcesPage() {
  return (
    <DashboardPage title="Resources & Slots" subtitle="Create venues, set pricing, and generate bookable time slots">
      <OwnerResourcesPanel />
    </DashboardPage>
  );
}
