import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

export default function UserProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Name is required.");
      return;
    }
    updateUser({ name: trimmed });
    setMessage("Profile updated successfully.");
  };

  return (
    <DashboardPage title="Profile Settings" subtitle="Manage your account details">
      <DashboardCard title="Account Information">
        <form className="mx-auto max-w-lg space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-ds-secondary">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ds-secondary outline-none transition focus:border-ds-accent focus:ring-2 focus:ring-ds-accent/20"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-ds-secondary">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ds-secondary">Role</label>
            <input
              type="text"
              value={user?.role ?? "user"}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-ds-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ds-secondary"
          >
            Save Changes
          </button>
          {message ? <p className="text-sm font-medium text-ds-primary">{message}</p> : null}
        </form>
      </DashboardCard>
    </DashboardPage>
  );
}
