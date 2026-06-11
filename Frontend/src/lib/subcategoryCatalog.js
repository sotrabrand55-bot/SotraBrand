export const rawSubcategoryGroups = [
  {
    label: "Pheromone Touch",
    children: [
      { label: "Pheromone Touch", slug: "pheromone-touch" },
      { label: "Body lotion pheromone", slug: "body-lotion-pheromone" },
      { label: "Body oil pheromone", slug: "body-oil-pheromone" },
      { label: "Body splash pheromone", slug: "body-splash-pheromone" },
      { label: "Body scrub pheromone", slug: "body-scrub-pheromone" },
    ],
  },
  {
    label: "Mystique Set",
    children: [
      { label: "Mystique parfum", slug: "mystique-parfum" },
      { label: "Body lotion mystique", slug: "body-lotion-mystique" },
      { label: "Body splash mystique", slug: "body-splash-mystique" },
    ],
  },
  {
    label: "Roll-on",
    children: [{ label: "Radiant charm", slug: "radiant-charm" }],
  },
];

export const slugifySubcategory = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const mapCategoryGroups = (groups = rawSubcategoryGroups) =>
  (Array.isArray(groups) ? groups : rawSubcategoryGroups)
    .filter((group) => group?.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((group) => ({
      label: group.label,
      slug: group.slug || slugifySubcategory(group.label),
      active: group.active !== false,
      order: group.order ?? 0,
      children: (Array.isArray(group.children) ? group.children : [])
        .filter((child) => child?.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((child) => ({
          label: child.label,
          slug: child.slug || slugifySubcategory(child.label),
          active: child.active !== false,
          order: child.order ?? 0,
          to: `/subcategory/${child.slug || slugifySubcategory(child.label)}`,
        })),
    }))
    .filter((group) => group.label && group.children.length);

export const subcategoryGroups = mapCategoryGroups(rawSubcategoryGroups);

export const getSubcategoryItems = (groups = subcategoryGroups) =>
  mapCategoryGroups(groups).flatMap((group) =>
    group.children.map((child) => ({
      ...child,
      groupLabel: group.label,
    }))
  );

export const getSubcategoryBySlugFromGroups = (slug, groups = subcategoryGroups) =>
  getSubcategoryItems(groups).find((item) => item.slug === slug);

export const legacySubcategoryGroups = rawSubcategoryGroups.map((group) => ({
  ...group,
  children: group.children.map((child) => ({
    ...child,
    to: `/subcategory/${child.slug}`,
  })),
}));

export const subcategoryItems = getSubcategoryItems(subcategoryGroups);

export const getSubcategoryBySlug = (slug) =>
  getSubcategoryBySlugFromGroups(slug, subcategoryGroups);

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getProductSearchText = (product) =>
  normalize(
    [
      product?.name,
      product?.category,
      product?.subCategory,
      product?.concentration,
      product?.description,
      ...(Array.isArray(product?.colors) ? product.colors : []),
      ...(Array.isArray(product?.shadeOptions)
        ? product.shadeOptions.flatMap((option) => [
            option?.label,
            option?.cartValue,
            option?.description,
          ])
        : []),
    ].join(" ")
  );

export const productMatchesSubcategory = (product, subcategory) => {
  if (!product || !subcategory) return false;

  const target = normalize(subcategory.label);
  const productSubcategory = normalize(product?.subCategory);
  const productCategory = normalize(product?.category);

  if (productSubcategory === target) return true;
  if (productCategory === target) return true;

  const searchText = getProductSearchText(product);
  if (!target || !searchText) return false;
  if (searchText.includes(target)) return true;

  return target
    .split(" ")
    .filter(Boolean)
    .every((word) => searchText.includes(word));
};
