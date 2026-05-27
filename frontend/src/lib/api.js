export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

let unauthorizedHandler = null;

const PUBLIC_AUTH_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function normalizeAuthUser(raw) {
  if (!raw) return null;
  const id = raw.id ?? raw._id;
  if (!id) return null;
  return {
    id: String(id),
    name: raw.name ?? "",
    email: raw.email ?? "",
    role: raw.role ?? "user",
  };
}

function formatValidationMessage(message) {
  if (typeof message === "string") return message;
  if (!message || typeof message !== "object") return null;
  const fieldErrors = message.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) return String(first);
  }
  const formErrors = message.formErrors;
  if (Array.isArray(formErrors) && formErrors[0]) return String(formErrors[0]);
  return null;
}

export function formatApiError(error) {
  if (typeof error?.message === "string" && error.name === "ApiError") return error.message;
  if (typeof error?.message === "string") return error.message;
  const fromData = formatValidationMessage(error?.data?.message);
  if (fromData) return fromData;
  if (typeof error?.data?.message === "string") return error.data.message;
  return "Request failed";
}

export function getBookingAuthMessage(error) {
  if (error?.status === 403) {
    return "Only customer accounts can book venues. Please log in with a user account.";
  }
  if (error?.status === 401) {
    return "Your session expired. Please log in again.";
  }
  return formatApiError(error);
}

export async function api(path, init) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError("Cannot reach server. Is the backend running on port 5000?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : data?.message
          ? JSON.stringify(data.message)
          : `Request failed (${res.status})`;
    const isPublicAuth = PUBLIC_AUTH_PATHS.some((publicPath) => path.startsWith(publicPath));
    if (res.status === 401 && !isPublicAuth) {
      unauthorizedHandler?.();
    }
    throw new ApiError(message, res.status, data);
  }
  return data;
}

export function getStoredUser() {
  const raw = localStorage.getItem("tm_user");
  if (!raw) return null;
  try {
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    localStorage.removeItem("tm_user");
    return null;
  }
}

export function redirectByRole(role) {
  if (role === "owner") return "/owner";
  if (role === "admin") return "/admin";
  if (role === "staff") return "/staff";
  return "/account/bookings";
}

export function isDashboardRole(role) {
  return role === "owner" || role === "staff" || role === "admin";
}
