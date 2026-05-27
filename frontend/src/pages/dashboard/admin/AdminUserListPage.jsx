import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, authHeaders } from "../../../lib/api";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

export default function AdminUserListPage({ token }) {
  const usersQuery = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => api("/api/admin/users", { headers: authHeaders(token) }),
  });

  const users = usersQuery.data ?? [];
  const counts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        acc[user.role] = (acc[user.role] ?? 0) + 1;
        return acc;
      },
      { total: 0, user: 0, owner: 0, staff: 0, admin: 0 }
    );
  }, [users]);

  return (
    <DashboardPage title="User List" subtitle="All registered users by role">
      <section className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Total: <strong>{counts.total}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">User: <strong>{counts.user}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Owner: <strong>{counts.owner}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Staff: <strong>{counts.staff}</strong></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">Admin: <strong>{counts.admin}</strong></div>
      </section>

      <DashboardCard title="Registered Accounts">
        {usersQuery.isLoading ? <p>Loading users...</p> : null}
        {usersQuery.isError ? <p>Failed to load users.</p> : null}
        {!usersQuery.isLoading && !usersQuery.isError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{user.name}</td>
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2 uppercase">{user.role}</td>
                    <td className="px-3 py-2">{user.isActive ? "Active" : "Inactive"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DashboardCard>
    </DashboardPage>
  );
}
