import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowRight } from "react-icons/fi";
import { getMockHomepageSectionItems, useMockData } from "../lib/mockData";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "./Skeletons";

const FeaturedSetPicture = ({ sectionKey = "featured-set-1" }) => {
  const { backendUrl, products } = useContext(ShopContext);
  const navigate = useNavigate();
  const [sectionItem, setSectionItem] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const mockItem = useMemo(
    () => getMockHomepageSectionItems(sectionKey)[0] || null,
    [sectionKey]
  );
  const media = useMemo(
    () => (useMockData && mockItem ? mockItem : sectionItem || mockItem),
    [mockItem, sectionItem]
  );
  const linkedProduct = useMemo(
    () => products.find((product) => product._id === media?.productId) || null,
    [media?.productId, products]
  );
  const activeSrc = isDesktop && media?.desktopSrc ? media.desktopSrc : media?.src;
  const buttonLabel = String(media?.buttonLabel ?? "See Full Set").trim();

  useEffect(() => {
    if (useMockData) return undefined;
    let alive = true;

    const loadSection = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/homepage-sections/${sectionKey}`);
        const item = (res.data?.section?.items || [])
          .filter((entry) => entry.active !== false && entry.src)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

        if (!alive) return;
        setSectionItem(
          item
            ? {
                id: item.id || `${sectionKey}-live`,
                type: "image",
                src: item.src,
                desktopSrc: item.desktopSrc || "",
                alt: item.alt || item.label || "Be Radiant by Nancy set",
                label: item.label || item.alt || "Be Radiant by Nancy set",
                buttonLabel: item.buttonLabel ?? "See Full Set",
                productId: item.productId || "",
              }
            : null
        );
      } catch {
        if (alive) setSectionItem(null);
      }
    };

    loadSection();
    const interval = window.setInterval(loadSection, 10000);
    window.addEventListener("focus", loadSection);
    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadSection);
    };
  }, [backendUrl, sectionKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  if (!activeSrc) return null;

  const openSet = () => {
    const productId = media?.productId || linkedProduct?._id || "";
    if (productId) {
      navigate(`/Product/${productId}`);
      return;
    }
    navigate("/collection");
  };

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-white">
      <button
        type="button"
        onClick={openSet}
        className="group relative mx-auto block aspect-[9/16] w-[calc(100vw-24px)] overflow-hidden bg-[#EAEAEA] text-left md:aspect-[2/1] md:w-[calc(100vw-12px)] md:rounded-[16px]"
        aria-label={buttonLabel || "Open set"}
      >
        <ShimmerImage
          src={activeSrc}
          alt={media?.alt || media?.label || "Be Radiant by Nancy set"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          wrapperClassName="h-full w-full"
          skeletonClassName="bg-[#EAEAEA]"
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent p-5 text-white sm:p-8">
          {media?.label && (
            <span className="block text-xs font-bold uppercase tracking-[0.22em]">
              {media.label}
            </span>
          )}
          {buttonLabel && (
            <span className="mt-3 inline-flex items-center gap-3 border-b border-white pb-1 text-xs font-bold uppercase tracking-[0.22em]">
              {buttonLabel}
              <FiArrowRight className="h-4 w-4" />
            </span>
          )}
        </span>
      </button>
    </section>
  );
};

export default FeaturedSetPicture;
