import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiGift } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { ShimmerImage } from "../componens/Skeletons";
import { buildGiftSetPanels } from "../utils/giftSetDisplay";

const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const GiftSets = () => {
  const { products } = useContext(ShopContext);
  const [displaySlots, setDisplaySlots] = useState([]);

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
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const giftSets = useMemo(
    () => buildGiftSetPanels({ displaySlots, products }),
    [displaySlots, products]
  );

  return (
    <main className="bg-[#fffaf4]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-5 border-b border-[#eadfd2] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#b9945d]">
              <FiGift className="h-4 w-4" />
              Levon Gifts
            </p>
            <h1 className="font-serif text-5xl leading-tight text-[#1f1b17] sm:text-6xl">
              Gift Sets
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#6a6258] sm:text-base">
              Curated perfume rituals, ready to give.
            </p>
          </div>

          <Link
            to="/collection?cat=Gift%20Sets"
            className="inline-flex w-fit items-center gap-3 rounded-full border border-[#1f1b17] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1f1b17] transition hover:bg-[#1f1b17] hover:text-white"
          >
            View All Sets
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.9fr]">
          {giftSets.map((set) => (
            <Link
              key={`${set.slot}-${set.title}`}
              to={set.linkTo}
              className={`group relative overflow-hidden rounded-sm bg-[#eadfd2] shadow-[0_18px_45px_rgba(62,45,28,0.12)] ${
                set.slot === 1 ? "min-h-[520px] lg:row-span-2" : "min-h-[250px]"
              }`}
            >
              <ShimmerImage
                src={set.image}
                alt={set.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                wrapperClassName="absolute inset-0 h-full w-full"
                skeletonClassName="bg-[#E9DFD3]"
                draggable="false"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  {set.subtitle}
                </p>
                <h2 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">
                  {set.title}
                </h2>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-[#1f1b17] backdrop-blur transition group-hover:bg-white">
                  {set.buttonText || "Explore"}
                  <FiArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default GiftSets;
