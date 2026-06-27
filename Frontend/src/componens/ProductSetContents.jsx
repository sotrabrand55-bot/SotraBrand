import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ShimmerImage } from "./Skeletons";
import ProductMediaViewer from "./ProductMediaViewer";

const ProductSetContents = ({ product }) => {
  const [viewer, setViewer] = useState(null);
  const railRef = useRef(null);
  const explicitItems = (Array.isArray(product?.setContents) ? product.setContents : [])
    .filter((item) => item?.image)
    .sort((a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999));
  const productName = String(product?.name || "").toLowerCase();
  const isPheromoneSet = productName.includes("pheromone") && productName.includes("set");
  const exampleItems = isPheromoneSet
    ? (() => {
        const groupedItems = new Map();
        (Array.isArray(product?.shadeOptions) ? product.shadeOptions : [])
          .filter(
            (item) =>
              item?.image &&
              !String(item?.label || "").toLowerCase().includes("sponge")
          )
          .sort((a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999))
          .forEach((item) => {
            const key = String(item.label || "set item").trim().toLowerCase();
            if (!groupedItems.has(key)) groupedItems.set(key, []);
            groupedItems.get(key).push(item);
          });

        return [...groupedItems.values()].slice(0, 4).map((group, index) => {
          const item = group[0];
          return {
            id: `pheromone-set-example-${item.id || index}`,
            image: item.image,
            label: String(item.label || `Set item ${index + 1}`).trim(),
            description: "",
            alt: item.label || `${product.name} item ${index + 1}`,
            order: index + 1,
            gallery: group.slice(1).map((detail, detailIndex) => ({
              id: `pheromone-set-example-detail-${detail.id || `${index}-${detailIndex}`}`,
              image: detail.image,
              alt: detail.label || item.label || "",
              order: detailIndex + 1,
            })),
          };
        });
      })()
    : [];
  const items = explicitItems.length ? explicitItems : exampleItems;

  const openItemGallery = (item, itemIndex) => {
    const gallery = (Array.isArray(item.gallery) ? item.gallery : [])
      .filter((image) => image?.image)
      .sort((a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999));
    const seen = new Set();
    const images = [
      {
        id: `${item.id || itemIndex}-main`,
        image: item.image,
        alt: item.alt || item.label || `${product.name} item ${itemIndex + 1}`,
      },
      ...gallery,
    ].filter((image) => {
      if (!image.image || seen.has(image.image)) return false;
      seen.add(image.image);
      return true;
    });

    setViewer({
      label: item.label || `Set item ${itemIndex + 1}`,
      images,
    });
  };

  const scrollRail = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(180, rail.clientWidth * 0.7), behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mt-5 min-w-0 border-t border-black/15 pt-4 text-black lg:mt-7 lg:pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/65 lg:text-sm">
          Inside the Sets
        </p>
        {items.length > 2 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              className="grid h-7 w-7 place-items-center rounded-full text-black transition hover:bg-black hover:text-white"
              aria-label="Scroll set items left"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              className="grid h-7 w-7 place-items-center rounded-full text-black transition hover:bg-black hover:text-white"
              aria-label="Scroll set items right"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div ref={railRef} className="overflow-x-auto scroll-smooth no-scrollbar">
        <div className="flex w-max gap-2 pb-2">
          {items.map((item, index) => (
            <article
              key={item.id || `${item.image}-${index}`}
              className="w-28 shrink-0 text-center lg:w-36"
            >
              <button
                type="button"
                onClick={() => openItemGallery(item, index)}
                className="block aspect-[4/5] w-full overflow-hidden bg-white"
                aria-label={`Open all ${product.name} set images from ${item.label || `item ${index + 1}`}`}
              >
                <ShimmerImage
                  src={item.image}
                  alt={item.alt || item.label || `${product.name} set item ${index + 1}`}
                  className="h-full w-full object-contain"
                  wrapperClassName="h-full w-full"
                  skeletonClassName="bg-[#EAEAEA]"
                  loading="lazy"
                />
              </button>
              <p className="mt-2 line-clamp-2 text-[8px] font-semibold uppercase leading-3 tracking-[0.08em] text-black/65 lg:text-[10px]">
                {item.label || `Set item ${index + 1}`}
              </p>
            </article>
          ))}
        </div>
      </div>

      {viewer && (
        <ProductMediaViewer
          product={{ ...product, name: `${product.name} - ${viewer.label}` }}
          images={viewer.images}
          initialIndex={0}
          onClose={() => setViewer(null)}
          viewerLabel="images"
        />
      )}
    </section>
  );
};

export default ProductSetContents;
