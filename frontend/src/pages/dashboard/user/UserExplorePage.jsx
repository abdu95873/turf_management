import { useState } from "react";
import { DiscoveryPanel, ResourceAndSlotPanel, ResourceDetails } from "../../../components/platform/PlatformSections";
import { DashboardPage } from "../shared/PageChrome";

export default function UserExplorePage() {
  const [selectedResourceId, setSelectedResourceId] = useState("");
  return (
    <DashboardPage title="Discover Venues" subtitle="Find resources and available slots">
      <DiscoveryPanel onSelect={setSelectedResourceId} />
      <ResourceDetails resourceId={selectedResourceId} canReview />
      <ResourceAndSlotPanel canManage={false} />
    </DashboardPage>
  );
}
