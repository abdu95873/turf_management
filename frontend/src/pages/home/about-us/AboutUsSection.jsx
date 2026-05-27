import { Link } from "react-router-dom";
import bannerImage from "../../../assets/banner02.jpg";
import "./AboutUsSection.css";

const ABOUT_IMAGE_SECONDARY = "/assets/img/bg/offer-img-1.png";

export default function AboutUsSection() {
  return (
    <section id="about" className="about-us-section scroll-mt-24">
      <div className="about-us-inner">
        <div className="about-header">
          <span className="about-eyebrow">About Us</span>
          <h2 className="about-headline">
            <span className="about-headline-dark">
              With high-quality turf grounds, easy online booking, flexible time slots, and a strong football community,
            </span>
            <span className="about-headline-muted">
              {" "}
              we create the perfect environment for players to compete, connect, and grow.
            </span>
          </h2>
        </div>

        <div className="about-content">
          <div className="about-copy">
            <p className="about-description">
              We believe football is more than just a sport it&apos;s teamwork, energy, discipline, and unforgettable
              moments. We are dedicated to bringing football lovers together through professionally managed turf
              facilities, competitive matches, training sessions, and a vibrant sports culture.
            </p>

            <Link to="/auth/register" className="about-cta-btn">
              Join &amp; Experience Us
              <span className="about-cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          <div className="about-images">
            <figure className="about-image about-image-primary">
              <img src={bannerImage} alt="Football on premium turf" loading="lazy" />
            </figure>
            <figure className="about-image about-image-secondary">
              <img src={ABOUT_IMAGE_SECONDARY} alt="Players on a football pitch" loading="lazy" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
