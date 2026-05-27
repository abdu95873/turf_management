import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function SharedFooter() {
  return (
    <footer className="relative left-1/2 right-1/2 mt-0 w-screen ml-[-50vw] mr-[-50vw] bg-ds-secondary text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-ds-accent text-xs font-extrabold text-ds-dark">
                TP
              </span>
              <span className="text-lg font-extrabold uppercase tracking-wide text-white">TurfPro</span>
            </Link>
            <p className="text-sm leading-7 text-slate-400">
              Book premium turfs, cricket arenas, and sports venues. Real-time slots, secure payments, and unforgettable
              games.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
            <div className="grid gap-2 text-sm text-slate-400">
              <a href="#home" className="transition hover:text-ds-accent">
                Home
              </a>
              <a href="#venues" className="transition hover:text-ds-accent">
                Venues
              </a>
              <Link to="/events" className="transition hover:text-ds-accent">
                Events
              </Link>
              <Link to="/contact" className="transition hover:text-ds-accent">
                Contact Us
              </Link>
              <Link to="/auth/login" className="transition hover:text-ds-accent">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Contact</h3>
            <div className="grid gap-2 text-sm text-slate-400">
              <p>Dhaka, Bangladesh</p>
              <p>hello@turfpro.com</p>
              <p>+880-1411-1223</p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">Follow Us</h3>
            <div className="flex gap-2">
              {[FaXTwitter, FaFacebookF, FaLinkedinIn, FaInstagram].map((Icon, index) => (
                <span
                  key={index}
                  className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-sm transition hover:border-ds-accent hover:bg-ds-accent hover:text-white"
                >
                  <Icon />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} TurfPro. All rights reserved.</p>
          <p>Powered by Turf Management Platform</p>
        </div>
      </div>
    </footer>
  );
}
