import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, authHeaders } from "../../../lib/api";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export default function AdminUsersPage({ token }) {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const createUserMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };
      return api("/api/admin/users", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setMessage(data?.message || "User created successfully.");
      setForm(INITIAL_FORM);
    },
    onError: (error) => {
      setMessage(error?.message || "Failed to create user.");
    },
  });

  return (
    <DashboardPage title="Add Users" subtitle="Admin can create user/owner/staff/admin accounts" message={message}>
      <DashboardCard title="Create New Account">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email address" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Role</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => createUserMutation.mutate()}
          disabled={createUserMutation.isPending || form.name.trim().length < 2 || !form.email.trim() || form.password.length < 6}
          className="mt-3"
          style={{ width: "auto", marginTop: "12px" }}
        >
          {createUserMutation.isPending ? "Creating..." : "Create User"}
        </button>
      </DashboardCard>
    </DashboardPage>
  );
}
