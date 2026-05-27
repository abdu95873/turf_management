import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, formatApiError, normalizeAuthUser, redirectByRole } from "../../lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from;
  const [message, setMessage] = useState(location.state?.notice ?? "");
  const [messageIsError, setMessageIsError] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: () =>
      api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      }),
    onSuccess: (data) => {
      const authUser = normalizeAuthUser(data.user);
      if (!data.accessToken || !authUser) {
        setMessageIsError(true);
        setMessage("Login failed: invalid server response.");
        return;
      }
      login(data.accessToken, authUser, data.refreshToken);
      setMessageIsError(false);
      setMessage("Login successful.");
      if (returnTo && data.user.role === "user") {
        navigate(returnTo, { replace: true });
        return;
      }
      if (returnTo && data.user.role === "user") {
        navigate(returnTo, { replace: true });
        return;
      }
      navigate(redirectByRole(data.user.role), { replace: true });
    },
    onError: (err) => {
      setMessageIsError(true);
      setMessage(formatApiError(err));
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">TurfPro</h1>
          <p className="mt-1 text-sm text-slate-500">Login to continue</p>
          {message ? (
            <p className={`mt-2 text-sm ${messageIsError ? "text-red-600" : "text-emerald-600"}`}>{message}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <button
            className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            onClick={() => loginMutation.mutate()}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </div>
        <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
          <p>New user? <Link to="/auth/register" className="font-medium text-violet-600 hover:text-violet-500">User Registration</Link></p>
          <p>Turf/Pool owner? <Link to="/auth/register-owner" className="font-medium text-violet-600 hover:text-violet-500">Owner Registration</Link></p>
          <p><Link to="/auth/forgot-password" className="font-medium text-violet-600 hover:text-violet-500">Forgot password?</Link></p>
        </div>
      </div>
    </div>
  );
}
