/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext"; // to grab backendUrl if you expose it there
import { useContext } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ProductRailSkeleton, ShimmerImage } from "./Skeletons";
import { mockCollectionList, useMockData } from "../lib/mockData";

const CollectionList = () => {
  const { backendUrl } = useContext(ShopContext); 
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (useMockData) {
        setTiles(mockCollectionList.filter((t) => t.active));
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${backendUrl}/api/subcat-tiles/list`);
        const actives = (res.data?.tiles || []).filter(t => t.active);
        setTiles(actives);
      } catch (_) {
        setTiles(mockCollectionList.filter((t) => t.active));
      }
      finally {
        setLoading(false);
      }
    })();
  }, [backendUrl]);

  const scrollByOne = (dir=1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const gap = 24;
    const step = card ? card.clientWidth + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (loading) return <ProductRailSkeleton titleWidth="w-52" />;
  if (!tiles.length) return null;

  return (
    <section className="my-2 py-8">
      <div className="mb-9 text-center">
        <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#c49a5e]">
          <span className="h-px w-10 bg-current" />
          <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
          Scent Families
        </p>
        <h2 className="mt-2 font-serif text-5xl leading-none text-[#1f1b17] sm:text-6xl">
          Collection List
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#8a7462] sm:text-base">
          Explore Levon perfumes by mood, note, and signature trail.
        </p>
      </div>

      <div className="mb-5 flex justify-end px-1">
        <Link
          to="/collection"
          className="hidden items-center rounded-full border border-[#1f1b17]/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#1f1b17] hover:bg-[#1f1b17] hover:text-white sm:inline-flex"
        >
          View all
        </Link>
      </div>

      <div className="relative">
        {/* left */}
        <button
          onClick={() => scrollByOne(-1)}
          className="absolute left-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#d8c2a5] bg-[#fffaf4]/95 text-[#1f1b17] shadow-[0_14px_32px_rgba(62,45,28,0.16)] backdrop-blur transition hover:bg-white md:grid [&>span]:hidden"
          aria-label="Previous"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span className="text-2xl">‹</span>
        </button>

        <div ref={trackRef} className="overflow-x-auto no-scrollbar">
          <div className="flex gap-6 px-2 pb-2">
            {tiles.map(t => (
              <Link
                key={t._id}
                to={`/collection?sub=${encodeURIComponent(t.subKey)}&cat=Fragrance`}
                data-card
                className="group flex-shrink-0 w-[82vw] sm:w-[46vw] lg:w-[31%]"
              >
                <article className="relative overflow-hidden rounded-md bg-[#fffaf4] p-3 shadow-[0_18px_45px_rgba(62,45,28,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(62,45,28,0.16)]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded bg-[#eadfd2]">
                    <ShimmerImage
                      src={t.image}
                      alt={t.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      wrapperClassName="absolute inset-0 w-full h-full"
                      skeletonClassName="bg-[#E9DFD3]"
                      loading="lazy"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b778]">
                        Levon Collection
                      </p>
                      <h3 className="font-serif text-4xl leading-none sm:text-5xl">
                        {t.title}
                      </h3>
                      <span className="mt-5 inline-flex items-center rounded-full bg-[#fff8ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f1b17] transition group-hover:bg-white">
                        Explore
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* right */}
        <button
          onClick={() => scrollByOne(1)}
          className="absolute right-2 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[#d8c2a5] bg-[#fffaf4]/95 text-[#1f1b17] shadow-[0_14px_32px_rgba(62,45,28,0.16)] backdrop-blur transition hover:bg-white md:grid [&>span]:hidden"
          aria-label="Next"
        >
          <FiArrowRight className="h-5 w-5" />
          <span className="text-2xl">›</span>
        </button>
      </div>
    </section>
  );
};

export default CollectionList;
