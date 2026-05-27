import { Outlet, useLocation } from "react-router-dom";
import SharedFooter from "../components/shared/SharedFooter";
import SharedNavbar from "../components/shared/SharedNavbar";

export default function RootLayout() {
  const location = useLocation();
  const isDashboardPath = ["/owner", "/admin", "/staff"].some((prefix) =>
    location.pathname.startsWith(prefix)
  );
  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <div className={isDashboardPath ? "app app-dashboard" : "w-full font-sans"}>
      {!isDashboardPath ? <SharedNavbar variant="hero" /> : null}
      <div className={!isDashboardPath && !isHome ? "pt-[72px]" : ""}>
        <Outlet />
      </div>
      {!isDashboardPath ? <SharedFooter /> : null}
    </div>
  );
}
