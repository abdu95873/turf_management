import { FiCalendar, FiCreditCard, FiLogIn, FiSearch } from "react-icons/fi";
import "./HowItWorksSection.css";

const STEPS = [
  {
    step: "01",
    icon: FiSearch,
    title: "Explore Venues",
    copy: "Browse turfs and sports venues with photos, facilities, and real-time availability.",
  },
  {
    step: "02",
    icon: FiCalendar,
    title: "Pick a Slot",
    copy: "Select your date and choose from available time slots instantly.",
  },
  {
    step: "03",
    icon: FiLogIn,
    title: "Confirm Booking",
    copy: "Login or register to secure your slot in a few clicks.",
  },
  {
    step: "04",
    icon: FiCreditCard,
    title: "Pay & Play",
    copy: "Pay via SSLCommerz and download your invoice instantly.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="how-it-works-section relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw] scroll-mt-24"
    >
      <div className="how-it-works-inner">
        <div className="how-it-works-header">
          <span className="how-it-works-eyebrow">How It Works</span>
          <h2 className="how-it-works-title">
            Book In <span>Four Steps</span>
          </h2>
          <p className="how-it-works-description">
            From discovery to payment — a seamless booking experience.
          </p>
        </div>

        <div className="how-it-works-grid">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.step} className="how-it-works-card">
                <div className="how-it-works-card-head">
                  <span className="how-it-works-icon">
                    <Icon />
                  </span>
                  <span className="how-it-works-step">{item.step}</span>
                </div>
                <h3 className="how-it-works-card-title">{item.title}</h3>
                <p className="how-it-works-card-copy">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
