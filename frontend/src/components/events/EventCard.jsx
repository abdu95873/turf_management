import "./EventCard.css";

export default function EventCard({ event, className = "" }) {
  const fillPercent = Math.round((event.filled / event.total) * 100);

  return (
    <article className={`event-card ${className}`.trim()}>
      <div className="event-card-image">
        <img src={event.image} alt={event.title} loading="lazy" />
        <span className="event-badge">{event.badge}</span>
        <h3 className="event-card-title">{event.title}</h3>
      </div>

      <div className="event-card-body">
        <div className="event-details-grid">
          <div className="event-detail">
            <label>Date</label>
            <span>{event.date}</span>
          </div>
          <div className="event-detail">
            <label>Format</label>
            <span>{event.format}</span>
          </div>
          <div className="event-detail">
            <label>Prize Pool</label>
            <span>{event.prizePool}</span>
          </div>
          <div className="event-detail">
            <label>Venue</label>
            <span>{event.venue}</span>
          </div>
        </div>

        <div className="event-progress-head">
          <span>Slots Filled</span>
          <span>
            {event.filled}/{event.total}
          </span>
        </div>
        <div className="event-progress-track">
          <div className="event-progress-fill" style={{ width: `${fillPercent}%` }} />
        </div>

        <button type="button" className="register-team-btn">
          Register Team
        </button>
      </div>
    </article>
  );
}
