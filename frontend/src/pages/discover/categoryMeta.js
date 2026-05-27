export const CATEGORY_META = {
  turf: {
    title: "Football",
    icon: "⚽",
    subtitle: "Turf & futsal grounds",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
  },
  pool: {
    title: "Swimming",
    icon: "🏊",
    subtitle: "Pools & aquatic venues",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80",
  },
  sports: {
    title: "Multi-Sport",
    icon: "🏟️",
    subtitle: "Indoor & outdoor courts",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607cdbea6?auto=format&fit=crop&w=1200&q=80",
  },
  cricket: {
    title: "Cricket",
    icon: "🏏",
    subtitle: "Nets & full grounds",
    image: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?auto=format&fit=crop&w=1200&q=80",
  },
};

export const FALLBACK_VENUE_IMAGE =
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80";

export const CATEGORY_ALIASES = {
  football: "turf",
  soccer: "turf",
  swimming: "pool",
  "multi-sport": "sports",
};

export const VALID_CATEGORY_KEYS = ["turf", "pool", "sports", "cricket"];

export function normalizeCategoryKey(category) {
  const key = (category || "").toLowerCase().trim();
  return CATEGORY_ALIASES[key] || key;
}

export function normalizeResourceType(type) {
  const key = (type || "sports").toLowerCase().trim();
  return CATEGORY_ALIASES[key] || key;
}

export function matchesCategory(resource, categoryKey) {
  return normalizeResourceType(resource?.type) === normalizeCategoryKey(categoryKey);
}

export function toCategoryLabel(category) {
  const key = normalizeCategoryKey(category);
  return CATEGORY_META[key]?.title || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Sports");
}

export function toCategoryIcon(category) {
  const key = normalizeCategoryKey(category);
  return CATEGORY_META[key]?.icon || "🏟️";
}

export function getCategoryMeta(category) {
  const key = normalizeCategoryKey(category);
  return (
    CATEGORY_META[key] || {
      title: toCategoryLabel(key),
      icon: "🏟️",
      subtitle: "Premium sports venues",
      image: FALLBACK_VENUE_IMAGE,
    }
  );
}

export function buildCategoriesFromResources(resources) {
  const grouped = new Map();

  (resources ?? []).forEach((resource) => {
    const key = normalizeResourceType(resource?.type);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        title: toCategoryLabel(key),
        icon: toCategoryIcon(key),
        subtitle: CATEGORY_META[key]?.subtitle || "Premium venues",
        image: CATEGORY_META[key]?.image || FALLBACK_VENUE_IMAGE,
        count: 0,
      });
    }
    grouped.get(key).count += 1;
  });

  return Array.from(grouped.values()).filter((category) => category.count > 0);
}

export function filterResourcesByCategory(resources, categoryKey) {
  if (!categoryKey) return [];
  return (resources ?? []).filter((resource) => matchesCategory(resource, categoryKey));
}
