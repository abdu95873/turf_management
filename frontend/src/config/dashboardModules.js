import {
  FiCalendar,
  FiDollarSign,
  FiGrid,
  FiMapPin,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";

export const DASHBOARD_MODULES = [
  { key: "overview", label: "Analytics", path: "overview", icon: FiGrid, roles: ["owner", "staff", "admin"] },
  { key: "finance", label: "Finance", path: "finance", icon: FiDollarSign, roles: ["owner", "admin"] },
  { key: "users", label: "User Control", path: "users", icon: FiUsers, roles: ["owner", "admin"] },
  { key: "venues", label: "Venue Management", path: "venues", icon: FiMapPin, roles: ["owner", "admin"] },
  { key: "events", label: "Event Management", path: "events", icon: FiCalendar, roles: ["owner", "admin"] },
  { key: "bookings", label: "Booking Management", path: "bookings", icon: FiShoppingCart, roles: ["owner", "staff", "admin"] },
];

export function getDashboardNav(role) {
  const prefix = `/${role ?? "owner"}`;
  return DASHBOARD_MODULES.filter((module) => module.roles.includes(role)).map((module) => ({
    ...module,
    to: `${prefix}/${module.path}`,
  }));
}

export function canAccessModule(role, moduleKey) {
  const module = DASHBOARD_MODULES.find((item) => item.key === moduleKey);
  return module ? module.roles.includes(role) : false;
}
