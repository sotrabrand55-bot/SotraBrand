export const defaultCategoryGroups = [
  {
    label: "Pheromone Touch",
    slug: "pheromone-touch",
    active: true,
    order: 0,
    children: [
      { label: "Pheromone Touch", slug: "pheromone-touch", active: true, order: 0 },
      { label: "Body lotion pheromone", slug: "body-lotion-pheromone", active: true, order: 1 },
      { label: "Body oil pheromone", slug: "body-oil-pheromone", active: true, order: 2 },
      { label: "Body splash pheromone", slug: "body-splash-pheromone", active: true, order: 3 },
      { label: "Body scrub pheromone", slug: "body-scrub-pheromone", active: true, order: 4 },
    ],
  },
  {
    label: "Mystique Set",
    slug: "mystique-set",
    active: true,
    order: 1,
    children: [
      { label: "Mystique parfum", slug: "mystique-parfum", active: true, order: 0 },
      { label: "Body lotion mystique", slug: "body-lotion-mystique", active: true, order: 1 },
      { label: "Body splash mystique", slug: "body-splash-mystique", active: true, order: 2 },
    ],
  },
  {
    label: "Roll-on",
    slug: "roll-on",
    active: true,
    order: 2,
    children: [{ label: "Radiant charm", slug: "radiant-charm", active: true, order: 0 }],
  },
];

export const slugifyCategory = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeCategoryGroups = (groups = defaultCategoryGroups) =>
  (Array.isArray(groups) ? groups : defaultCategoryGroups)
    .map((group, groupIndex) => {
      const label = String(group?.label || "").trim();
      if (!label) return null;
      const children = (Array.isArray(group.children) ? group.children : [])
        .map((child, childIndex) => {
          const childLabel = String(child?.label || "").trim();
          if (!childLabel) return null;
          return {
            label: childLabel,
            slug: child.slug || slugifyCategory(childLabel),
            active: child.active !== false,
            order: Number.isFinite(Number(child.order)) ? Number(child.order) : childIndex,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        label,
        slug: group.slug || slugifyCategory(label),
        active: group.active !== false,
        order: Number.isFinite(Number(group.order)) ? Number(group.order) : groupIndex,
        children,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const getActiveCategoryGroups = (groups = defaultCategoryGroups) =>
  normalizeCategoryGroups(groups)
    .filter((group) => group.active !== false)
    .map((group) => ({
      ...group,
      children: (group.children || []).filter((child) => child.active !== false),
    }));

export const getCategoryNames = (groups = defaultCategoryGroups) =>
  getActiveCategoryGroups(groups).map((group) => group.label);

export const getSubcategoriesForCategory = (groups, categoryLabel) =>
  getActiveCategoryGroups(groups).find((group) => group.label === categoryLabel)?.children || [];

export const getAllSubcategories = (groups = defaultCategoryGroups) =>
  getActiveCategoryGroups(groups).flatMap((group) =>
    (group.children || []).map((child) => ({
      ...child,
      groupLabel: group.label,
      groupSlug: group.slug,
    }))
  );
