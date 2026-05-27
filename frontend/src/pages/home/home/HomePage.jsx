import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import BannerSection from "../banner/BannerSection";
import BookingSearchSection from "../booking-search/BookingSearchSection";
import WhatWeOfferSection from "../what-we-offer/WhatWeOfferSection";
import SportsCategorySection from "../sports-category/SportsCategorySection";
import UpcomingEventsSection from "../upcoming-events/UpcomingEventsSection";
import HowItWorksSection from "../how-it-works/HowItWorksSection";
import ContactUsSection from "../contact-us/ContactUsSection";
import AboutUsSection from "../about-us/AboutUsSection";

export default function HomePage() {
  const resourcesQuery = useQuery({
    queryKey: ["landing-resources"],
    queryFn: () => api("/api/resources"),
  });
  const resources = resourcesQuery.data ?? [];

  return (
    <main className="w-full bg-ds-bg font-sans text-ds-secondary antialiased">
      <BannerSection venueCount={resources.length} />
      <BookingSearchSection resources={resources} />

      <WhatWeOfferSection />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <SportsCategorySection resources={resources} />
      </div>

      <UpcomingEventsSection />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <HowItWorksSection />
      </div>

      <ContactUsSection />
      <AboutUsSection />
    </main>
  );
}
