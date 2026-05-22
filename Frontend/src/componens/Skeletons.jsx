/* eslint-disable react/prop-types */
import React from "react";
import { useEffect, useMemo, useState } from "react";

export const SkeletonBlock = ({ className = "" }) => (
  <div className={`skeleton-shimmer rounded-md ${className}`} />
);

export const ShimmerImage = ({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  wrapperClassName = "",
  loading = "lazy",
  draggable,
  onClick,
}) => {
  const sources = useMemo(
    () =>
      (Array.isArray(src) ? src : [src])
        .map((item) =>
          typeof item === "string" ? item.trim() : item?.url || item?.path || ""
        )
        .filter(Boolean),
    [src]
  );
  const sourcesKey = sources.join("|");
  const [sourceIndex, setSourceIndex] = useState(0);
  const imageSrc = sources[sourceIndex] || "";
  const [loaded, setLoaded] = useState(false);
  const [minimumShown, setMinimumShown] = useState(false);
  const showSkeleton = !loaded || !minimumShown;

  useEffect(() => {
    setMinimumShown(false);
    const timer = window.setTimeout(() => setMinimumShown(true), 520);
    return () => window.clearTimeout(timer);
  }, [imageSrc]);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);

    if (!imageSrc) return undefined;

    const image = new Image();
    image.src = imageSrc;

    if (image.complete && image.naturalWidth > 0) {
      setLoaded(true);
    }

    image.onload = () => {
      if (!cancelled && image.naturalWidth > 0) setLoaded(true);
    };
    image.onerror = () => {
      if (cancelled) return;
      if (sourceIndex < sources.length - 1) {
        setSourceIndex((index) => index + 1);
      } else {
        setLoaded(true);
      }
    };

    const fallback = setTimeout(() => {
      if (cancelled) return;
      if (sourceIndex < sources.length - 1) {
        setSourceIndex((index) => index + 1);
      } else {
        setLoaded(true);
      }
    }, 1400);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [imageSrc, sourceIndex, sources.length]);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourcesKey]);

  if (!imageSrc) {
    return (
      <div className={`relative overflow-hidden ${wrapperClassName}`} onClick={onClick}>
        <SkeletonBlock className={`image-loading-shimmer h-full w-full ${skeletonClassName}`} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`} onClick={onClick}>
      {showSkeleton && (
        <SkeletonBlock
          className={`image-loading-shimmer absolute inset-0 h-full w-full rounded-none ${skeletonClassName}`}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} duration-500 ${
          !showSkeleton ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
        loading={loading}
        decoding="async"
        draggable={draggable}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (sourceIndex >= sources.length - 1) setLoaded(true);
        }}
      />
    </div>
  );
};

export const HeroSkeleton = () => (
  <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#fff7ef]">
    <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl items-center gap-5 px-4 py-5 sm:min-h-[calc(100vh-5rem)] sm:gap-9 sm:px-6 sm:py-10 md:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
      <div>
        <SkeletonBlock className="h-3 w-36 rounded-full bg-[#eadfd2]" />
        <SkeletonBlock className="mt-5 h-16 w-72 rounded-md bg-[#eadfd2] sm:h-24 sm:w-[420px]" />
        <SkeletonBlock className="mt-5 h-4 w-full max-w-xl rounded-full bg-[#eadfd2]" />
        <SkeletonBlock className="mt-3 h-4 w-4/5 max-w-lg rounded-full bg-[#eadfd2]" />
        <div className="mt-7 flex flex-wrap gap-3">
          <SkeletonBlock className="h-11 w-32 rounded-full bg-[#eadfd2]" />
          <SkeletonBlock className="h-10 w-20 rounded-full bg-[#eadfd2]" />
          <SkeletonBlock className="h-10 w-20 rounded-full bg-[#eadfd2]" />
        </div>
      </div>
      <div className="grid h-[32vh] min-h-[220px] grid-cols-[1.1fr_0.78fr] grid-rows-2 gap-2.5 sm:h-[62vh] sm:min-h-[390px] sm:gap-4 lg:h-[70vh]">
        <SkeletonBlock className="row-span-2 h-full rounded-sm bg-[#eadfd2]" />
        <SkeletonBlock className="h-full rounded-sm bg-[#eadfd2]" />
        <SkeletonBlock className="h-full rounded-sm bg-[#eadfd2]" />
      </div>
    </div>
  </section>
);

export const ShowcaseSkeleton = () => (
  <section className="w-full mt-9">
    <div className="text-center py-8 mb-11">
      <div className="flex justify-center gap-2">
        <SkeletonBlock className="h-9 w-36" />
        <SkeletonBlock className="h-9 w-52" />
      </div>
      <SkeletonBlock className="mt-5 h-4 w-3/4 max-w-xl mx-auto" />
      <SkeletonBlock className="mt-3 h-4 w-2/3 max-w-lg mx-auto" />
      <SkeletonBlock className="mt-6 h-10 w-28 rounded-full mx-auto" />
    </div>
    <div className="block lg:hidden">
      <SkeletonBlock className="w-[92vw] aspect-[4/5] rounded-xl" />
    </div>
    <div className="hidden lg:grid grid-cols-2 gap-5">
      <SkeletonBlock className="h-[70vh] rounded-sm" />
      <SkeletonBlock className="h-[70vh] rounded-sm" />
    </div>
  </section>
);

export const SectionHeaderSkeleton = ({ titleWidth = "w-64" }) => (
  <div className="mb-8 text-center">
    <div className="mx-auto mb-3 flex w-fit items-center gap-3">
      <SkeletonBlock className="h-px w-10 rounded-none bg-[#dccfbd]" />
      <SkeletonBlock className="h-2.5 w-2.5 rotate-45 rounded-none bg-[#dccfbd]" />
      <SkeletonBlock className="h-px w-10 rounded-none bg-[#dccfbd]" />
    </div>
    <SkeletonBlock className="mx-auto h-3 w-36 rounded-full bg-[#eadfd2]" />
    <SkeletonBlock className={`mx-auto mt-4 h-14 ${titleWidth} max-w-full rounded-md bg-[#eadfd2]`} />
    <SkeletonBlock className="mx-auto mt-4 h-4 w-full max-w-md rounded-full bg-[#eadfd2]" />
  </div>
);

export const ProductRailSkeleton = ({ titleWidth = "w-56", cards = 3 }) => (
  <section className="my-0 py-5 sm:py-6">
    <SectionHeaderSkeleton titleWidth={titleWidth} />
    <div className="flex justify-end px-2 pb-5">
      <SkeletonBlock className="hidden h-10 w-28 rounded-full bg-[#eadfd2] sm:block" />
    </div>
    <div className="flex gap-6 overflow-hidden px-2 pb-2">
      {[...Array(cards)].map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[82vw] sm:w-[46vw] lg:w-[32%]"
        >
          <div className="rounded-md bg-[#fffaf4] p-3 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <SkeletonBlock className="aspect-[4/5] rounded bg-[#eadfd2]" />
            <div className="mt-4 flex items-center gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full bg-[#eadfd2]" />
              <SkeletonBlock className="h-7 w-16 rounded-full bg-[#eadfd2]" />
            </div>
            <SkeletonBlock className="mt-4 h-7 w-3/4 rounded-md bg-[#eadfd2]" />
            <SkeletonBlock className="mt-3 h-4 w-1/2 rounded-full bg-[#eadfd2]" />
            <SkeletonBlock className="mt-4 h-5 w-24 rounded-full bg-[#eadfd2]" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const GiftSetsSectionSkeleton = () => (
  <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#fffaf4] py-8 sm:py-10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeaderSkeleton titleWidth="w-56" />
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-[1.6fr_0.8fr_0.9fr]">
        {[1, 2, 3].map((slot) => (
          <SkeletonBlock
            key={slot}
            className={`rounded-md bg-[#eadfd2] shadow-[0_14px_34px_rgba(62,45,28,0.08)] ${
              slot === 1
                ? "col-span-2 min-h-[270px] sm:min-h-[440px] lg:col-span-1"
                : "min-h-[220px] sm:min-h-[440px]"
            }`}
          />
        ))}
      </div>
      <SkeletonBlock className="mx-auto mt-7 h-12 w-44 rounded-full bg-[#eadfd2]" />
    </div>
  </section>
);

export const ScentWardrobeSkeleton = () => (
  <section className="my-0 py-5 sm:py-6">
    <SectionHeaderSkeleton titleWidth="w-[420px]" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="grid overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffaf4] shadow-[0_12px_28px_rgba(62,45,28,0.08)] sm:grid-cols-[0.9fr_1.2fr]"
        >
          <SkeletonBlock className="min-h-[140px] rounded-none bg-[#eadfd2] sm:min-h-[260px]" />
          <div className="p-3.5 sm:p-7">
            <SkeletonBlock className="h-px w-10 rounded-none bg-[#dccfbd]" />
            <SkeletonBlock className="mt-5 h-9 w-3/4 rounded-md bg-[#eadfd2]" />
            <SkeletonBlock className="mt-4 h-4 w-full rounded-full bg-[#eadfd2]" />
            <SkeletonBlock className="mt-3 h-4 w-4/5 rounded-full bg-[#eadfd2]" />
            <div className="mt-7 flex gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full bg-[#eadfd2]" />
              <SkeletonBlock className="h-7 w-20 rounded-full bg-[#eadfd2]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const BrandStatementSkeleton = () => (
  <section className="-mx-4 bg-[#fffaf4] py-10 sm:-mx-[5vw] sm:py-12 md:-mx-[7vw] lg:-mx-[9vw]">
    <div className="mx-auto grid max-w-[1300px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
      <div>
        <SkeletonBlock className="h-3 w-36 rounded-full bg-[#eadfd2]" />
        <SkeletonBlock className="mt-5 h-16 w-full max-w-lg rounded-md bg-[#eadfd2]" />
        <SkeletonBlock className="mt-6 h-4 w-full max-w-xl rounded-full bg-[#eadfd2]" />
        <SkeletonBlock className="mt-3 h-4 w-5/6 max-w-lg rounded-full bg-[#eadfd2]" />
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-20 rounded-md bg-[#eadfd2]" />
          <SkeletonBlock className="h-20 rounded-md bg-[#eadfd2]" />
        </div>
        <SkeletonBlock className="mt-8 h-12 w-40 rounded-full bg-[#eadfd2]" />
      </div>
      <SkeletonBlock className="min-h-[420px] rounded-md bg-[#eadfd2] sm:min-h-[520px]" />
    </div>
  </section>
);

export const CollectionGridSkeleton = ({ cards = 8 }) => (
  <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: cards }).map((_, index) => (
      <article
        key={index}
        className="overflow-hidden rounded-md border border-[#eadfce] bg-[#fffdf9] shadow-[0_14px_34px_rgba(43,32,22,0.06)]"
      >
        <SkeletonBlock className="aspect-[3/4] rounded-none bg-[#eadfd2]" />
        <div className="p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-6 w-4/5 rounded-md bg-[#eadfd2]" />
              <SkeletonBlock className="mt-2 h-3 w-3/5 rounded-full bg-[#eadfd2]" />
            </div>
            <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full bg-[#eadfd2]" />
          </div>
          <div className="mt-3 flex gap-2">
            <SkeletonBlock className="h-6 w-20 rounded-full bg-[#eadfd2]" />
            <SkeletonBlock className="h-6 w-16 rounded-full bg-[#eadfd2]" />
          </div>
          <SkeletonBlock className="mt-3 h-4 w-24 rounded-full bg-[#eadfd2]" />
        </div>
      </article>
    ))}
  </div>
);
