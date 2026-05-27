import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isDashboardRole, redirectByRole } from "../lib/api";
import ContactPage from "../pages/contact/ContactPage";
import EventsPage from "../pages/events/EventsPage";
import PaymentSimulatePage from "../pages/payment/PaymentSimulatePage";
import PaymentPage from "../pages/payment/PaymentPage";
import PaymentSuccessPage from "../pages/payment/PaymentSuccessPage";
import PaymentFailPage from "../pages/payment/PaymentFailPage";
import PaymentCancelPage from "../pages/payment/PaymentCancelPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import HomePage from "../pages/home/home/HomePage";
import DiscoverVenuesPage from "../pages/discover/DiscoverVenuesPage";
import CategoryVenuesPage from "../pages/discover/CategoryVenuesPage";
import VenueLandingPage from "../pages/venue/VenueLandingPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminOverviewPage from "../pages/dashboard/admin/AdminOverviewPage";
import OwnerOverviewPage from "../pages/dashboard/owner/OwnerOverviewPage";
import StaffOverviewPage from "../pages/dashboard/staff/StaffOverviewPage";
import BookingManagementModulePage from "../pages/dashboard/modules/BookingManagementModulePage";
import EventManagementModulePage from "../pages/dashboard/modules/EventManagementModulePage";
import FinanceModulePage from "../pages/dashboard/modules/FinanceModulePage";
import UserControlModulePage from "../pages/dashboard/modules/UserControlModulePage";
import VenueManagementModulePage from "../pages/dashboard/modules/VenueManagementModulePage";
import UserBookingsPage from "../pages/dashboard/user/UserBookingsPage";
import UserInvoicesPage from "../pages/dashboard/user/UserInvoicesPage";
import UserProfileSettingsPage from "../pages/dashboard/user/UserProfileSettingsPage";
import AccountLayout from "../layouts/AccountLayout";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

function RedirectCompanyToVenue() {
  const { resourceId } = useParams();
  return <Navigate to={`/venue/${resourceId}`} replace />;
}

function ProtectedRoute({ allowedRoles, children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={redirectByRole(user?.role)} replace />;
  }
  return children;
}

function LegacyCompanyRedirect() {
  const { resourceId } = useParams();
  return <Navigate to={`/venue/${resourceId}`} replace />;
}

function DashboardGate({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  if (!isDashboardRole(user?.role)) {
    return <Navigate to={redirectByRole(user?.role)} replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { token, user, logout } = useAuth();

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/payment/simulate" element={<PaymentSimulatePage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/fail" element={<PaymentFailPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/discover" element={<DiscoverVenuesPage />} />
        <Route path="/discover/:categoryKey" element={<CategoryVenuesPage />} />
        <Route path="/venue/:resourceId" element={<VenueLandingPage />} />
        <Route path="/company/:resourceId" element={<RedirectCompanyToVenue />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage role="user" />} />
          <Route path="/auth/register-owner" element={<RegisterPage role="owner" />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/register-owner" element={<Navigate to="/auth/register-owner" replace />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/account/bookings" element={<UserBookingsPage />} />
          <Route path="/account/invoices" element={<UserInvoicesPage />} />
          <Route path="/account/settings" element={<UserProfileSettingsPage />} />
          <Route path="/account" element={<Navigate to="/account/bookings" replace />} />
        </Route>

        <Route path="/user/bookings" element={<Navigate to="/account/bookings" replace />} />
        <Route path="/user/invoices" element={<Navigate to="/account/invoices" replace />} />
        <Route path="/user/settings" element={<Navigate to="/account/settings" replace />} />
        <Route path="/user/*" element={<Navigate to="/account/bookings" replace />} />

        <Route
          element={
            <DashboardGate>
              <DashboardLayout onLogout={logout} user={user} />
            </DashboardGate>
          }
        >
          <Route
            path="/owner/overview"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/finance"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <FinanceModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/users"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <UserControlModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/venues"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <VenueManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/events"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <EventManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <BookingManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route path="/owner/resources" element={<Navigate to="/owner/venues" replace />} />
          <Route path="/owner/staff" element={<Navigate to="/owner/users" replace />} />
          <Route path="/owner" element={<Navigate to="/owner/overview" replace />} />

          <Route
            path="/staff/overview"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/bookings"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <BookingManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route path="/staff" element={<Navigate to="/staff/overview" replace />} />

          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FinanceModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserControlModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/venues"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <VenueManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EventManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BookingManagementModulePage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/owners" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/commission" element={<Navigate to="/admin/finance" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={token ? redirectByRole(user?.role) : "/"} replace />}
        />
      </Route>
    </Routes>
  );
}
