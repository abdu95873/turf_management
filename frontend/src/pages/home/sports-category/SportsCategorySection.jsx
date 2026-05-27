import { useMemo } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import CategoryGrid from "../../../components/categories/CategoryGrid";
import {
  buildCategoriesFromResources,
  CATEGORY_META,
} from "../../discover/categoryMeta";
import { HomeSectionHeading } from "../shared/HomeUi";

const FALLBACK_CATEGORIES = [
  {
    key: "turf",
    title: "Football",
    subtitle: "Artificial turf & futsal grounds",
    image: CATEGORY_META.turf.image,
  },
  {
    key: "pool",
    title: "Swimming",
    subtitle: "Pool & aquatic sports venues",
    image: CATEGORY_META.pool.image,
  },
  {
    key: "sports",
    title: "Multi-Sport",
    subtitle: "Indoor & outdoor courts",
    image: CATEGORY_META.sports.image,
  },
];

export default function SportsCategorySection({ resources = [] }) {
  const categories = useMemo(() => {
    const built = buildCategoriesFromResources(resources);
    return built.length ? built : FALLBACK_CATEGORIES;
  }, [resources]);

  return (
    <section id="sports-categories" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <HomeSectionHeading
          align="left"
          eyebrow="Browse By Sport"
          title="Choose Your"
          accent="Category"
          className="mb-0"
        />
        <Link
          to="/categories"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wide text-ds-primary transition hover:text-ds-secondary"
        >
          View All Categories
          <FiArrowRight />
        </Link>
      </div>

      <CategoryGrid categories={categories} />
    </section>
  );
}
