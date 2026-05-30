import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { GiftSetsSectionSkeleton, ShimmerImage } from "./Skeletons";
import { ShopContext } from "../context/ShopContext";
import { buildGiftSetPanels } from "../utils/giftSetDisplay";

const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const GiftSetsPreview = () => {
  const { products, productsLoading } = useContext(ShopContext);
  const [displaySlots, setDisplaySlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${backendUrl}/api/gift-set-display`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success) {
          setDisplaySlots(data.display?.slots || []);
        }
      })
      .catch(() => {
        if (!cancelled) setDisplaySlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const panels = useMemo(
    () => buildGiftSetPanels({ displaySlots, products }),
    [displaySlots, products]
  );

  if (loading || productsLoading) return <GiftSetsSectionSkeleton />;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#fffaf4] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <h2 className="font-serif text-[2.85rem] leading-none text-[#1f1b17] sm:text-6xl">
            Gift Sets
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#8a7462] sm:mt-4 sm:text-base">
            Curated perfume rituals, ready to give.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[1.6fr_0.8fr_0.9fr]">
          {panels.map((panel) => (
            <Link
              key={`${panel.slot}-${panel.title}`}
              to="/gift-sets"
              className={`group relative overflow-hidden rounded-md bg-[#eadfd2] shadow-[0_14px_34px_rgba(62,45,28,0.11)] sm:shadow-[0_18px_45px_rgba(62,45,28,0.12)] ${
                panel.slot === 1
                  ? "col-span-2 min-h-[270px] sm:min-h-[440px] lg:col-span-1"
                  : "min-h-[220px] sm:min-h-[440px]"
              }`}
            >
              <ShimmerImage
                src={panel.image}
                alt={panel.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                wrapperClassName="absolute inset-0 h-full w-full"
                skeletonClassName="bg-[#E9DFD3]"
                draggable="false"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/12 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-8">
                <h3
                  className={`font-serif leading-tight ${
                    panel.slot === 1
                      ? "text-4xl sm:text-5xl"
                      : "text-2xl sm:text-4xl"
                  }`}
                >
                  {panel.title}
                </h3>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8b778] sm:text-[11px] sm:tracking-[0.18em]">
                  {panel.subtitle}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff8ee] px-4 py-2 text-xs font-semibold text-[#1f1b17] transition group-hover:bg-white sm:mt-5 sm:gap-3 sm:px-5 sm:py-2.5 sm:text-sm">
                  {panel.buttonText || "Shop Set"}
                  <FiArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex justify-center sm:mt-8">
          <Link
            to="/gift-sets"
            className="inline-flex items-center gap-3 rounded-full border border-[#1f1b17] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f1b17] transition hover:bg-[#1f1b17] hover:text-white sm:px-6 sm:text-sm"
          >
            View Sets Page
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GiftSetsPreview;
