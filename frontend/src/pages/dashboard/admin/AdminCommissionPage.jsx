import { useState } from "react";
import AdminCommissionSection from "./AdminCommissionSection";
import { DashboardPage } from "../shared/PageChrome";

export default function AdminCommissionPage() {
  const [commissionRate, setCommissionRate] = useState("10");
  const [message, setMessage] = useState("");
  return (
    <DashboardPage title="Commission Settings" subtitle="Global commission configuration" message={message}>
      <AdminCommissionSection
        commissionRate={commissionRate}
        setCommissionRate={setCommissionRate}
        setMessage={setMessage}
      />
    </DashboardPage>
  );
}
