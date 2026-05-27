import "./WhatWeOfferSection.css";

const OFFERS = [
  {
    icon: "/assets/img/icons/offer-icon-1.svg",
    iconClass: "icon-1",
    title: "Premium Court Booking",
    description:
      "Real-time availability. Instant confirmation. Book 5-aside, 7-aside, or full 11-aside pitches across premium venues.",
  },
  {
    icon: "/assets/img/icons/offer-icon-2.svg",
    iconClass: "icon-2",
    title: "TOURNAMENTS",
    description:
      "Register teams for weekly leagues and knockout cups. Track brackets, standings, and top scorers in real-time.",
  },
  {
    icon: "/assets/img/icons/offer-icon-3.svg",
    iconClass: "icon-3",
    title: "PRO COACHES",
    description:
      "Discover and book UEFA/AFC certified coaches specialising development, goalkeeping, tactics, more.",
  },
];

export default function WhatWeOfferSection() {
  return (
    <section id="features" className="section offer-section-two relative left-1/2 right-1/2 w-screen ml-[-50vw] mr-[-50vw] scroll-mt-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="section-header-two white">
          <div className="subtitle">What We Offer</div>
          <h2 className="title">
            Built For&nbsp;The <span>Beautiful</span> Game
          </h2>
        </div>

        <div className="offer-row justify-content-center">
          {OFFERS.map((item) => (
            <div key={item.title} className="d-flex">
              <div className="offer-item-two flex-fill">
                <div className="offer-icon">
                  <div className="icon">
                    <img className={`img-fluid ${item.iconClass}`} alt="offer" src={item.icon} />
                  </div>
                </div>
                <div className="offer-content">
                  <h3 className="custom-title">{item.title}</h3>
                  <p className="description">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <img className="img-fluid element-1" alt="Soccer ball in goal net" src="/assets/img/bg/offer-img-1.png" />
    </section>
  );
}
