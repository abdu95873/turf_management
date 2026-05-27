import "./GetInTouchSection.css";

export const CONTACT_DETAILS = [
  { label: "Location", value: "Dhaka, Bangladesh" },
  { label: "Email", value: "hello@turfpro.com", href: "mailto:hello@turfpro.com" },
  { label: "Phone", value: "+880-1411-1223", href: "tel:+88014111223" },
];

export default function GetInTouchSection() {
  return (
    <section id="get-in-touch" className="get-in-touch-section">
      <div className="get-in-touch-inner">
        <div className="contact-info">
          <p className="contact-eyebrow">Get In Touch</p>
          <h1 className="contact-info-title">We&apos;re Here To Help</h1>
          <p className="contact-info-copy">
            Questions about bookings, tournaments, or venue partnerships? Reach out and our team will get back to you
            shortly.
          </p>

          <ul className="contact-details-list">
            {CONTACT_DETAILS.map((item) => (
              <li key={item.label}>
                <span className="contact-detail-label">{item.label}</span>
                {item.href ? (
                  <a href={item.href} className="contact-detail-value">
                    {item.value}
                  </a>
                ) : (
                  <span className="contact-detail-value">{item.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="contact-form-row">
            <label className="contact-field">
              <span>Name</span>
              <input type="text" name="name" placeholder="Your name" required />
            </label>
            <label className="contact-field">
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
          </div>
          <label className="contact-field">
            <span>Subject</span>
            <input type="text" name="subject" placeholder="How can we help?" required />
          </label>
          <label className="contact-field">
            <span>Message</span>
            <textarea name="message" rows={5} placeholder="Write your message..." required />
          </label>
          <button type="submit" className="contact-submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
