import { useState } from "react";
import AdminOwnersSection from "./AdminOwnersSection";
import { DashboardPage } from "../shared/PageChrome";

export default function AdminOwnersPage() {
  const [message, setMessage] = useState("");
  return (
    <DashboardPage title="Owner Moderation" subtitle="Approve or suspend owner accounts" message={message}>
      <AdminOwnersSection setMessage={setMessage} />
    </DashboardPage>
  );
}
