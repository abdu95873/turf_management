import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import EventCard from "../../components/events/EventCard";
import { UPCOMING_EVENTS } from "../../data/eventsData";
import { api } from "../../lib/api";
import "./EventsPage.css";

function mapApiEvent(event) {
  return {
    id: event._id,
    title: event.title,
    badge: event.badge,
    image: event.image,
    date: event.dateLabel,
    format: event.format,
    prizePool: event.prizePool,
    venue: event.venue,
    filled: event.filled,
    total: event.total,
  };
}

export default function EventsPage() {
  const eventsQuery = useQuery({
    queryKey: ["public-events"],
    queryFn: () => api("/api/events"),
  });

  const events = eventsQuery.data?.length ? eventsQuery.data.map(mapApiEvent) : UPCOMING_EVENTS;

  return (
    <main className="events-page min-h-screen font-sans antialiased">
      <section className="events-page-hero">
        <div className="events-page-hero-inner">
          <Link to="/" className="events-page-back">
            <FiArrowLeft />
            Back to Home
          </Link>
          <span className="events-page-eyebrow">Tournaments</span>
          <h1 className="events-page-title">
            Upcoming <span>Events</span>
          </h1>
          <p className="events-page-copy">
            Browse every tournament and league. Register your team before slots fill up.
          </p>
        </div>
      </section>

      <div className="events-page-body">
        <h2 className="events-page-section-title">
          All Events
          <span className="events-page-count"> ({events.length})</span>
        </h2>

        {eventsQuery.isLoading ? <p className="text-sm text-slate-500">Loading events...</p> : null}

        <div className="events-page-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
