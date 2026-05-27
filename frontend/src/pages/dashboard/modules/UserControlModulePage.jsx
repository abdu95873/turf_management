import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import AdminOwnersSection from "../admin/AdminOwnersSection";
import AdminUsersSection from "../admin/AdminUsersSection";
import OwnerStaffSection from "../owner/OwnerStaffSection";
import { Alert, DashboardPage } from "../shared/PageChrome";

export default function UserControlModulePage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  return (
    <DashboardPage
      title="User Control"
      subtitle={
        user?.role === "admin"
          ? "Manage platform users, owners, and staff accounts"
          : "Add and manage staff who can handle bookings"
      }
    >
      {message ? <Alert tone="success">{message}</Alert> : null}
      {user?.role === "admin" ? (
        <>
          <AdminUsersSection setMessage={setMessage} />
          <AdminOwnersSection setMessage={setMessage} />
        </>
      ) : (
        <OwnerStaffSection />
      )}
    </DashboardPage>
  );
}
