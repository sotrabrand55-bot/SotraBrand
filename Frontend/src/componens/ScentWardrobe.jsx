/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { mockScentWardrobe, useMockData } from "../lib/mockData";
import { ScentWardrobeSkeleton, ShimmerImage } from "./Skeletons";
import { ShopContext } from "../context/ShopContext";

const ScentWardrobe = () => {
  const { backendUrl } = useContext(ShopContext);
  const [backendMoods, setBackendMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMoods = async () => {
      if (useMockData) {
        setBackendMoods([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${backendUrl}/api/scent-wardrobe/list`);
        const data = await res.json();
        if (!cancelled && data?.success) {
          setBackendMoods(data.moods || []);
        }
      } catch (_) {
        if (!cancelled) setBackendMoods([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMoods();
    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

  const moods = useMemo(() => {
    const source = backendMoods.length ? backendMoods : mockScentWardrobe;
    const activeMoods = [...source]
      .filter((item) => item.active)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const slots = Array.from({ length: 4 }, () => null);
    activeMoods.forEach((mood) => {
      const slotIndex = Number(mood.order ?? 0);
      if (slotIndex >= 0 && slotIndex < slots.length && !slots[slotIndex]) {
        slots[slotIndex] = mood;
      }
    });

    return slots.filter(Boolean);
  }, [backendMoods]);

  if (loading) return <ScentWardrobeSkeleton />;
  if (!moods.length) return null;

  return (
    <section className="my-0 py-5 sm:py-6">
      <div className="mb-7 text-center sm:mb-9">
        <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#c49a5e]">
          <span className="h-px w-10 bg-current" />
          <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
          Scent Wardrobe
        </p>
        <h2 className="mt-2 font-serif text-[2.75rem] leading-none text-[#1f1b17] sm:text-6xl">
          Choose Your Mood
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#8a7462] sm:mt-4 sm:text-base">
          Discover Levon scents by the feeling you want to carry.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4 lg:grid-cols-2">
        {moods.map((mood) => (
          <Link
            key={mood._id}
            to={mood.linkTo || "/collection"}
            className="group grid overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffaf4] shadow-[0_12px_28px_rgba(62,45,28,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(62,45,28,0.14)] sm:grid-cols-[0.9fr_1.2fr] sm:shadow-[0_14px_35px_rgba(62,45,28,0.08)]"
          >
            <div
              className="relative min-h-[140px] bg-[#eadfd2] bg-cover bg-center sm:min-h-[260px]"
              style={
                mood.image ? { backgroundImage: `url(${mood.image})` } : undefined
              }
            >
              <ShimmerImage
                src={mood.image}
                alt={mood.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                wrapperClassName="absolute inset-0 h-full w-full"
                skeletonClassName="bg-[#E9DFD3]"
                loading="lazy"
                draggable="false"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#fffaf4]/18" />
            </div>

            <div className="flex min-h-[190px] flex-col justify-between p-3.5 sm:min-h-[230px] sm:p-7">
              <div>
                <div className="mb-3 h-px w-10 bg-[#c49a5e] sm:mb-4 sm:w-12" />
                <h3 className="font-serif text-2xl leading-none text-[#1f1b17] sm:text-4xl">
                  {mood.title}
                </h3>
                <p className="mt-3 line-clamp-3 max-w-sm text-xs leading-5 text-[#7d6756] sm:mt-4 sm:text-sm sm:leading-7">
                  {mood.description}
                </p>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2 sm:mt-6 sm:items-center sm:gap-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(mood.tags || []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#d8c2a5] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#6f5844] sm:px-3 sm:text-xs sm:tracking-[0.12em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1f1b17] text-white transition group-hover:bg-[#c49a5e] sm:h-11 sm:w-11">
                  <FiArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ScentWardrobe;
