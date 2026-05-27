import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { FALLBACK_VENUE_IMAGE } from "../../pages/discover/categoryMeta";

export default function CategoryGrid({ categories = [] }) {
  if (!categories.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No categories available yet. Check back when venues are added.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.key}
          to={`/discover/${category.key}`}
          className="group relative h-64 overflow-hidden rounded-2xl text-left shadow-lg shadow-slate-900/10 transition hover:shadow-xl"
        >
          <img
            src={category.image || FALLBACK_VENUE_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">{category.title}</h3>
            <p className="mt-1 text-sm text-slate-200">{category.subtitle}</p>
            {category.count > 0 ? (
              <p className="mt-1 text-xs font-semibold text-ds-accent">
                {category.count} venue{category.count === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
          <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-ds-accent text-ds-dark opacity-0 transition group-hover:opacity-100">
            <FiArrowRight />
          </span>
        </Link>
      ))}
    </div>
  );
}
