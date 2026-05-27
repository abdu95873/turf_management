import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FiExternalLink, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { getDashboardNav } from "../config/dashboardModules";
import "../styles/dashboard.css";

function getInitials(name, role) {
  if (name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (role ?? "U").slice(0, 1).toUpperCase();
}

export default function DashboardLayout({ onLogout, user }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const role = user?.role ?? "owner";
  const navItems = getDashboardNav(role);
  const currentItem = navItems.find((item) => location.pathname.startsWith(item.to)) ?? navItems[0];

  return (
    <div className="dashboard-shell">
      <div className={`dashboard-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="dashboard-sidebar-brand">
          <div className="dashboard-sidebar-logo" aria-hidden="true">
            TP
          </div>
          <div>
            <div className="dashboard-sidebar-brand-text">
              Turf<span>Pro</span>
            </div>
            <span className="dashboard-sidebar-role">{role} panel</span>
          </div>
        </div>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard navigation">
          <p className="dashboard-sidebar-label">Main menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          <NavLink to="/" className="dashboard-nav-link" onClick={() => setOpen(false)}>
            <FiExternalLink />
            View public site
          </NavLink>
          <button type="button" className="dashboard-logout-btn" onClick={onLogout}>
            <FiLogOut />
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="flex items-center gap-3">
            <button type="button" className="dashboard-mobile-menu-btn" onClick={() => setOpen((value) => !value)}>
              {open ? <FiX /> : <FiMenu />}
              Menu
            </button>
            <div>
              <h2 className="dashboard-topbar-title">{currentItem?.label ?? "Dashboard"}</h2>
              <p className="dashboard-topbar-sub">Manage your turf operations</p>
            </div>
          </div>

          <div className="dashboard-topbar-actions">
            <div className="dashboard-topbar-user">
              <span className="dashboard-topbar-avatar">{getInitials(user?.name, user?.role)}</span>
              <div className="dashboard-topbar-user-meta">
                <span className="dashboard-topbar-user-name">{user?.name ?? "User"}</span>
                <span className="dashboard-topbar-user-role">{role}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
