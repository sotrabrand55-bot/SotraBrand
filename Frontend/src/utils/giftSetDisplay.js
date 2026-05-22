export const fallbackGiftSetPanels = [
  {
    slot: 1,
    title: "Discovery Set",
    subtitle: "Five scents. Endless possibilities.",
    buttonText: "Shop Set",
    linkTo: "/gift-sets",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85",
    active: true,
  },
  {
    slot: 2,
    title: "For Her",
    subtitle: "Elegant. Feminine. Timeless.",
    buttonText: "Shop Set",
    linkTo: "/collection?cat=Gift%20Sets&sub=For%20Her",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1400&q=85",
    active: true,
  },
  {
    slot: 3,
    title: "For Him",
    subtitle: "Bold. Refined. Confident.",
    buttonText: "Shop Set",
    linkTo: "/collection?cat=Gift%20Sets&sub=For%20Him",
    image:
      "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1400&q=85",
    active: true,
  },
];

export const firstProductImage = (item) =>
  item?.image?.[0] ||
  item?.images?.[0] ||
  item?.image1 ||
  item?.image2 ||
  item?.image3 ||
  item?.image4 ||
  item?.image ||
  "";

const productIdText = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.$oid || "");
  return String(value);
};

export const buildGiftSetPanels = ({ displaySlots = [], products = [] } = {}) => {
  const productMap = new Map((products || []).map((product) => [String(product._id), product]));
  const bySlot = new Map();

  (displaySlots || []).forEach((slot) => {
    const slotNumber = Number(slot.slot);
    if (slotNumber >= 1 && slotNumber <= 3) bySlot.set(slotNumber, slot);
  });

  const panels = fallbackGiftSetPanels.map((fallback) => {
    const slot = bySlot.get(fallback.slot);
    if (!slot) return fallback;

    const populatedProduct =
      slot.productId && typeof slot.productId === "object" ? slot.productId : null;
    const mappedProduct = productMap.get(productIdText(slot.productId));
    const product = mappedProduct || populatedProduct;
    const productId = productIdText(product?._id || slot.productId);

    return {
      slot: fallback.slot,
      title: slot.title || product?.name || fallback.title,
      subtitle:
        slot.subtitle ||
        product?.subCategory ||
        product?.concentration ||
        (Array.isArray(product?.sizes) ? product.sizes.slice(0, 2).join(" / ") : "") ||
        fallback.subtitle,
      buttonText: slot.buttonText || fallback.buttonText,
      image: slot.image || firstProductImage(product) || fallback.image,
      linkTo:
        slot.linkTo ||
        (productId ? `/Product/${productId}` : fallback.linkTo),
      active: slot.active !== false,
    };
  });

  return panels.filter((panel) => panel.active).slice(0, 3);
};
