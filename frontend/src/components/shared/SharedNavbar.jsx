import { Link, useLocation } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import UserProfileMenu from "./UserProfileMenu";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Venues", href: "/discover", route: true },
  { label: "Events", href: "/events", route: true },
  { label: "Categories", href: "/categories", route: true },
  { label: "Contact Us", href: "/contact", route: true },
];

export function HeroCtaButton({ to, children, variant = "lime" }) {
  const isLime = variant === "lime";
  const className = `inline-flex items-center gap-3 rounded-full py-2.5 pl-6 pr-1.5 text-sm font-bold transition ${
    isLime
      ? "bg-[#A4DA01] text-[#0a0f14] hover:bg-[#b8ef1a]"
      : "bg-white text-[#0a0f14] hover:bg-slate-100"
  }`;
  const arrow = (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-base ${
        isLime ? "bg-[#0a0f14]/15" : "bg-[#0a0f14]/10"
      }`}
    >
      →
    </span>
  );

  if (to?.startsWith("#")) {
    return (
      <a href={to} className={className}>
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
      {arrow}
    </Link>
  );
}

export default function SharedNavbar({ variant = "default" }) {
  const { token } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  if (variant === "hero") {
    return (
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition ${
          isHome ? "border-b border-white/5 bg-black/25 backdrop-blur-md" : "border-b border-slate-200 bg-white/95 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="text-2xl leading-none" aria-hidden="true">
              ⚽
            </span>
            <span className="relative leading-tight">
              {isHome ? (
                <span className="absolute -top-3.5 left-0 text-[10px] font-bold uppercase tracking-wider text-[#A4DA01]">
                  Football
                </span>
              ) : null}
              <span className={`text-xl font-bold tracking-tight ${isHome ? "text-white" : "text-[#192335]"}`}>
                Turf<span className="text-[#A4DA01]">Pro</span>
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link, index) => {
              const isActiveRoute =
                link.route &&
                (link.href === "/discover"
                  ? location.pathname === "/discover" || location.pathname.startsWith("/discover/")
                  : link.href === "/events"
                    ? location.pathname === "/events" || location.pathname.startsWith("/events/")
                    : link.href === "/categories"
                      ? location.pathname === "/categories" || location.pathname.startsWith("/categories/")
                      : location.pathname === link.href);
              const linkClass = `flex items-center gap-1 text-[15px] font-medium transition ${
                isHome
                  ? index === 0
                    ? "text-[#A4DA01]"
                    : "text-white/90 hover:text-[#A4DA01]"
                  : isActiveRoute
                    ? "text-[#097E52]"
                    : index === 0
                      ? "text-[#097E52]"
                      : "text-slate-700 hover:text-[#097E52]"
              }`;

              if (link.route) {
                return (
                  <Link key={link.label} to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                );
              }

              const hashHref = isHome ? link.href : `/${link.href}`;

              return (
                <a key={link.label} href={hashHref} className={linkClass}>
                  {link.label}
                  {index > 0 && index < 4 ? <FiChevronDown className="text-xs opacity-70" /> : null}
                </a>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {!token ? (
              <>
                <Link
                  to="/auth/login"
                  className={`hidden text-sm font-semibold sm:inline-flex ${isHome ? "text-white/80 hover:text-white" : "text-slate-600"}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#A4DA01] py-2 pl-4 pr-1.5 text-sm font-bold text-[#0a0f14] transition hover:bg-[#b8ef1a]"
                >
                  Get Started
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#0a0f14]/15 text-sm">→</span>
                </Link>
              </>
            ) : (
              <UserProfileMenu isHome={isHome} />
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="landing-nav">
      <div className="brand">TurfPro</div>
      <div className="landing-nav-links">
        <Link to="/">Home</Link>
        <Link to="/auth/login">Login</Link>
        <Link to="/auth/register">Register</Link>
        <Link to="/auth/register-owner">Owner Register</Link>
        <Link to="/auth/forgot-password">Forgot Password</Link>
      </div>
    </nav>
  );
}
