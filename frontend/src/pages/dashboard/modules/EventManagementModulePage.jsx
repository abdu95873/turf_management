import { DashboardPage } from "../shared/PageChrome";
import EventManagementSection from "./EventManagementSection";

export default function EventManagementModulePage() {
  return (
    <DashboardPage title="Event Management" subtitle="Create and publish tournaments visible on the public events page">
      <EventManagementSection />
    </DashboardPage>
  );
}
