export const rawSubcategoryGroups = [
  {
    label: "Shop",
    children: [
      { label: "Abaya", slug: "abaya" },
      { label: "Dresses", slug: "dresses" },
      { label: "Hijabs", slug: "hijabs" },
      { label: "Islamic Essentials", slug: "islamic-essentials" },
      { label: "Blouses", slug: "blouses" },
    ],
  },
  {
    label: "Collections",
    children: [
      { label: "New Arrival", slug: "new-arrival" },
      { label: "Everyday Modesty", slug: "everyday-modesty" },
      { label: "Elegant Edit", slug: "elegant-edit" },
      { label: "Hijab Essentials", slug: "hijab-essentials" },
      { label: "On Sale", slug: "on-sale" },
    ],
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
      image: group.image || "",
      imageFileId: group.imageFileId || "",
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

export const productMatchesSubcategory = (product, subcategory) => {
  if (!product || !subcategory) return false;

  const target = normalize(subcategory.label);
  const productSubcategory = normalize(product?.subCategory);
  const productCategory = normalize(product?.category);

  return Boolean(target && (productSubcategory === target || productCategory === target));
};
