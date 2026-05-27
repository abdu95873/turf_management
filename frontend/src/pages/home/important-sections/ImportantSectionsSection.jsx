export default function ImportantSectionsSection() {
  const sectionCards = [
    {
      title: "For Players",
      icon: "🎯",
      copy: "Search by city, inspect venue details, compare ratings, and reserve your preferred slot.",
      badge: "Fast Booking",
      accent: "from-violet-500 to-indigo-500",
    },
    {
      title: "For Venue Owners",
      icon: "🏟️",
      copy: "Manage resources, generate slots, monitor earnings, and control staff access.",
      badge: "Business Control",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      title: "For Staff",
      icon: "🧑‍💼",
      copy: "Handle operational booking status updates without pricing or deletion permissions.",
      badge: "Operations",
      accent: "from-amber-500 to-orange-500",
    },
    {
      title: "For Admin",
      icon: "🛡️",
      copy: "Moderate owners, manage commission, and audit platform-level transactions.",
      badge: "Platform Governance",
      accent: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section id="features" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-600">Platform</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Built for Every Role</h2>
        <p className="mt-2 text-slate-600">One platform covering the full sports booking lifecycle.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sectionCards.map((item) => (
          <article
            key={item.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
          >
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${item.accent}`} />
            <div className="mb-4 flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-xl">{item.icon}</span>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{item.badge}</span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
