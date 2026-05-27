import { useAuth } from "../../../context/AuthContext";
import { HeroCtaButton } from "../../../components/shared/SharedNavbar";
import bannerImage from "../../../assets/banner02.jpg";

const STAT_CARDS = [
  { valueKey: "courts", fallback: "48", label: "Premium Courts" },
  { value: "89+", label: "Verified Coaches" },
  { value: "12+", label: "Active Players" },
];

export default function BannerSection({ venueCount }) {
  const { token } = useAuth();
  const courtCount = venueCount > 0 ? `${venueCount}` : STAT_CARDS[0].fallback;

  return (
    <section
      id="home"
      className="relative left-1/2 right-1/2 h-screen min-h-[640px] w-screen ml-[-50vw] mr-[-50vw] overflow-hidden bg-[#0a0f14]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bannerImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f14]/95 via-[#0a0f14]/75 to-[#0a0f14]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14]/60 via-transparent to-[#0a0f14]/30" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-16 pt-28 md:px-6 md:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-8">
          <div className="max-w-xl lg:max-w-2xl">
            <h1 className="select-none font-black uppercase leading-[0.92] tracking-tight">
              <span className="block text-[clamp(3.5rem,12vw,7.5rem)] text-white">Own</span>
              <span className="block text-[clamp(3.5rem,12vw,7.5rem)] text-[#A4DA01]">The</span>
              <span
                className="block text-[clamp(3.5rem,12vw,7.5rem)] text-transparent"
                style={{ WebkitTextStroke: "2px rgba(255,255,255,0.95)" }}
              >
                Pitch
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
              Book premium football courts, connect with{" "}
              <strong className="font-semibold text-white">certified coaches</strong>, track every goal with{" "}
              <strong className="font-semibold text-white">live scorecards</strong>, and compete in city-wide
              tournaments.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <HeroCtaButton to={token ? "/discover" : "/auth/register"} variant="lime">
                Book a Court
              </HeroCtaButton>
              <HeroCtaButton to="#upcoming-events" variant="white">
                View Tournaments
              </HeroCtaButton>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:items-end lg:min-w-[220px]">
            {STAT_CARDS.map((stat, index) => {
              const displayValue = index === 0 ? courtCount : stat.value;
              return (
                <div
                  key={stat.label}
                  className="w-full max-w-[240px] rounded-2xl border border-[#A4DA01]/40 bg-black/35 px-6 py-5 backdrop-blur-md sm:ml-auto"
                >
                  <strong className="block text-4xl font-black leading-none text-[#A4DA01] md:text-5xl">
                    {displayValue}
                  </strong>
                  <span className="mt-2 block text-sm font-medium text-white/90">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
