import { useMemo } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import CategoryGrid from "../../components/categories/CategoryGrid";
import {
  buildCategoriesFromResources,
  CATEGORY_META,
} from "../discover/categoryMeta";
import "./CategoriesPage.css";

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

export default function CategoriesPage() {
  const resourcesQuery = useQuery({
    queryKey: ["categories-page-resources"],
    queryFn: () => api("/api/resources"),
  });

  const categories = useMemo(() => {
    const built = buildCategoriesFromResources(resourcesQuery.data ?? []);
    return built.length ? built : FALLBACK_CATEGORIES;
  }, [resourcesQuery.data]);

  return (
    <main className="categories-page min-h-screen font-sans antialiased">
      <section className="categories-page-hero">
        <div className="categories-page-hero-inner">
          <Link to="/" className="categories-page-back">
            <FiArrowLeft />
            Back to Home
          </Link>
          <span className="categories-page-eyebrow">Sports</span>
          <h1 className="categories-page-title">
            Browse By <span>Category</span>
          </h1>
          <p className="categories-page-copy">
            Choose a sport to see venues for that category only. Every card opens filtered listings.
          </p>
        </div>
      </section>

      <div className="categories-page-body">
        {resourcesQuery.isLoading ? <p className="categories-page-status">Loading categories...</p> : null}
        {resourcesQuery.isError ? (
          <p className="categories-page-status error">Failed to load categories. Please try again.</p>
        ) : null}

        {!resourcesQuery.isLoading && !resourcesQuery.isError ? (
          <>
            <h2 className="categories-page-section-title">
              All Categories
              <span className="categories-page-count"> ({categories.length})</span>
            </h2>
            <CategoryGrid categories={categories} />
          </>
        ) : null}
      </div>
    </main>
  );
}
