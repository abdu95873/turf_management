import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiFileText, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { redirectByRole } from "../../lib/api";

const USER_MENU_ITEMS = [
  { label: "My Bookings", to: "/account/bookings", icon: FiCalendar },
  { label: "Invoices", to: "/account/invoices", icon: FiFileText },
  { label: "Profile Setting", to: "/account/settings", icon: FiSettings },
];

function getInitials(name) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export default function UserProfileMenu({ isHome = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!user) return null;

  const initials = getInitials(user.name);
  const isUser = user.role === "user";
  const menuItems = isUser ? USER_MENU_ITEMS : [{ label: "Dashboard", to: redirectByRole(user.role), icon: FiUser }];

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const triggerClass = isHome
    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
    : "border-slate-200 bg-white text-ds-secondary hover:border-ds-primary/30 hover:bg-slate-50";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition ${triggerClass}`}
        title={user.name || "Account"}
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+10px)] z-[60] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-ds-secondary">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-ds-bg hover:text-ds-primary"
              >
                <Icon className="shrink-0 text-base" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <FiLogOut className="shrink-0 text-base" />
            Log Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
