import { HeroCtaButton } from "../../../components/shared/SharedNavbar";
import bannerImage from "../../../assets/banner02.jpg";
import "./ContactUsSection.css";

export default function ContactUsSection() {
  return (
    <section
      id="contact"
      className="contact-us-section relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw] scroll-mt-24"
    >
      <div className="contact-hero">
        <div
          className="contact-hero-bg"
          style={{ backgroundImage: `url(${bannerImage})` }}
          aria-hidden="true"
        />
        <div className="contact-hero-overlay" aria-hidden="true" />

        <div className="contact-hero-inner">
          <div className="contact-hero-copy">
            <h2 className="contact-hero-title">
              <span className="line-white">Complete</span>
              <span className="line-accent">Solution</span>
              <span className="line-outline">With Team.</span>
            </h2>

            <HeroCtaButton to="/contact" variant="white">
              Contact Us
            </HeroCtaButton>
          </div>

          <button type="button" className="contact-play-btn" aria-label="Play video">
            <span className="contact-play-text">
              Play
              <br />
              Video
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
