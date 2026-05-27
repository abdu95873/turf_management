import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../../../components/events/EventCard";
import { UPCOMING_EVENTS } from "../../../data/eventsData";
import "./UpcomingEventsSection.css";

const MAX_EVENTS = 10;
const SLIDE_WIDTH = 434;
const SLIDE_GAP = 24;

const CAROUSEL_EVENTS = UPCOMING_EVENTS.slice(0, MAX_EVENTS);

export default function UpcomingEventsSection() {
  const trackRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (event) => {
    if (event.button !== 0) return;
    const viewport = trackRef.current;
    if (!viewport) return;

    dragRef.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: viewport.scrollLeft,
      moved: 0,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!dragRef.current.active) return;
    event.preventDefault();

    const viewport = trackRef.current;
    if (!viewport) return;

    const delta = event.pageX - dragRef.current.startX;
    dragRef.current.moved = Math.abs(delta);
    viewport.scrollLeft = dragRef.current.scrollLeft - delta;
  };

  const endDrag = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const blockClickIfDragged = (event) => {
    if (dragRef.current.moved > 6) {
      event.preventDefault();
      event.stopPropagation();
    }
    dragRef.current.moved = 0;
  };

  const handleTouchStart = (event) => {
    const viewport = trackRef.current;
    if (!viewport || !event.touches[0]) return;

    dragRef.current = {
      active: true,
      startX: event.touches[0].pageX,
      scrollLeft: viewport.scrollLeft,
      moved: 0,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (event) => {
    if (!dragRef.current.active || !event.touches[0]) return;

    const viewport = trackRef.current;
    if (!viewport) return;

    const delta = event.touches[0].pageX - dragRef.current.startX;
    dragRef.current.moved = Math.abs(delta);
    viewport.scrollLeft = dragRef.current.scrollLeft - delta;
  };

  useEffect(() => {
    window.addEventListener("mouseup", endDrag);
    return () => window.removeEventListener("mouseup", endDrag);
  }, []);

  useEffect(() => {
    const viewport = trackRef.current;
    if (!viewport) return;

    const peekOffset = Math.max(0, (SLIDE_WIDTH + SLIDE_GAP) * 0.35);
    viewport.scrollLeft = peekOffset;
  }, []);

  return (
    <section
      id="upcoming-events"
      className="upcoming-events-section relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw] scroll-mt-24"
    >
      <div className="events-header-wrap">
        <div className="events-header">
          <div className="events-header-text">
            <div className="subtitle">Upcoming Events</div>
            <h2 className="title">
              <span className="compete">Compete</span> <span className="conquer">&amp; Conquer</span>
            </h2>
          </div>
          <Link to="/events" className="view-all-btn">
            View All Tournaments
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="events-slide-two">
        <div
          className={`events-carousel-viewport slick-list ${isDragging ? "is-dragging" : ""}`}
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={endDrag}
          onClickCapture={blockClickIfDragged}
        >
          <div className="events-carousel-track slick-track">
            {CAROUSEL_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} className="event-card-slide" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
