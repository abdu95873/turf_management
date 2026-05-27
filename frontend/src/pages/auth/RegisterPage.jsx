import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError, normalizeAuthUser, redirectByRole } from "../../lib/api";

export default function RegisterPage({ role }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  const registerMutation = useMutation({
    mutationFn: () =>
      api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...registerForm, role }),
      }),
    onSuccess: (data) => {
      const authUser = normalizeAuthUser(data.user);
      if (!data.accessToken || !authUser) {
        setMessage("Registration failed: invalid server response.");
        return;
      }
      login(data.accessToken, authUser, data.refreshToken);
      setMessage("Registration successful.");
      navigate(redirectByRole(authUser.role), { replace: true });
    },
    onError: (err) => setMessage(formatApiError(err)),
  });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">TurfPro</h1>
          <p className="mt-1 text-sm text-slate-500">{role === "owner" ? "Owner Registration" : "User Registration"}</p>
          {message ? <p className="mt-2 text-sm text-indigo-600">{message}</p> : null}
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Full Name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Password"
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <button
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>Already have an account? <Link to="/auth/login" className="font-medium text-violet-600 hover:text-violet-500">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
