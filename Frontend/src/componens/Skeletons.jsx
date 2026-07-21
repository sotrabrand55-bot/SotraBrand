/* eslint-disable react/prop-types */
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
    const timer = window.setTimeout(() => setMinimumShown(true), 950);
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
          className={`image-loading-shimmer pointer-events-none absolute inset-0 z-10 h-full w-full rounded-none ${skeletonClassName}`}
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
  <section className="relative left-1/2 aspect-[9/16] w-screen -translate-x-1/2 overflow-hidden bg-[#EAEAEA] md:aspect-[2/1] md:w-[calc(100vw-12px)] md:rounded-[16px]">
    <SkeletonBlock className="sotra-cool-shimmer h-full w-full rounded-none bg-[#EAEAEA]" />
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
      <SkeletonBlock className="h-px w-10 rounded-none bg-[#EAEAEA]" />
      <SkeletonBlock className="h-2.5 w-2.5 rotate-45 rounded-none bg-[#EAEAEA]" />
      <SkeletonBlock className="h-px w-10 rounded-none bg-[#EAEAEA]" />
    </div>
    <SkeletonBlock className="mx-auto h-3 w-36 rounded-full bg-[#EAEAEA]" />
    <SkeletonBlock className={`mx-auto mt-4 h-14 ${titleWidth} max-w-full rounded-md bg-[#EAEAEA]`} />
    <SkeletonBlock className="mx-auto mt-4 h-4 w-full max-w-md rounded-full bg-[#EAEAEA]" />
  </div>
);

export const ProductRailSkeleton = ({ titleWidth = "w-56", cards = 3 }) => (
  <section className="my-0 py-5 sm:py-6">
    <SectionHeaderSkeleton titleWidth={titleWidth} />
    <div className="flex justify-end px-2 pb-5">
      <SkeletonBlock className="hidden h-10 w-28 rounded-full bg-[#EAEAEA] sm:block" />
    </div>
    <div className="flex gap-6 overflow-hidden px-2 pb-2">
      {[...Array(cards)].map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[82vw] sm:w-[46vw] lg:w-[32%]"
        >
          <div className="rounded-md bg-white p-3 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <SkeletonBlock className="aspect-[4/5] rounded bg-[#EAEAEA]" />
            <div className="mt-4 flex items-center gap-2">
              <SkeletonBlock className="h-7 w-20 rounded-full bg-[#EAEAEA]" />
              <SkeletonBlock className="h-7 w-16 rounded-full bg-[#EAEAEA]" />
            </div>
            <SkeletonBlock className="mt-4 h-7 w-3/4 rounded-md bg-[#EAEAEA]" />
            <SkeletonBlock className="mt-3 h-4 w-1/2 rounded-full bg-[#EAEAEA]" />
            <SkeletonBlock className="mt-4 h-5 w-24 rounded-full bg-[#EAEAEA]" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const FeaturedProductSkeleton = () => (
  <section
    aria-label="Featured Products loading"
    className="sotra-featured-skeleton relative left-1/2 w-screen -translate-x-1/2 bg-white pb-8 pt-0 sm:pb-12"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-3 flex justify-end gap-2">
        <SkeletonBlock className="h-9 w-9 rounded-full bg-[#eeeeee]" />
        <SkeletonBlock className="h-9 w-9 rounded-full bg-[#eeeeee]" />
      </div>

      <article className="w-[min(100%,25rem)] bg-white text-black sm:w-[24rem] lg:grid lg:w-full lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-12 lg:px-10">
        <SkeletonBlock className="aspect-[4/5] rounded-none bg-[#f2f2f2] lg:h-[42rem] lg:max-h-[72vh]" />

        <div className="px-4 pb-6 pt-4 sm:px-5 lg:max-w-[42rem] lg:px-0 lg:py-12">
          <SkeletonBlock className="h-5 w-28 rounded-md bg-[#ededed] lg:h-12 lg:w-56" />
          <SkeletonBlock className="mt-3 h-5 w-36 rounded-md bg-[#ededed] lg:mt-8 lg:h-9 lg:w-64" />
          <SkeletonBlock className="mt-2 h-3 w-44 rounded-full bg-[#ededed] lg:h-5 lg:w-72" />
          <SkeletonBlock className="mt-5 h-4 w-full rounded-full bg-[#ededed] lg:mt-10 lg:h-7" />
          <SkeletonBlock className="mt-3 h-4 w-4/5 rounded-full bg-[#ededed] lg:h-7" />
          <SkeletonBlock className="mt-4 h-4 w-56 rounded-full bg-[#ededed] lg:h-7 lg:w-80" />

          <div className="-mx-2 mt-3 flex gap-3 px-2 py-2 lg:mt-7 lg:gap-5">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <SkeletonBlock
                key={item}
                className="h-12 w-12 shrink-0 rounded-full bg-[#ededed] sm:h-14 sm:w-14"
              />
            ))}
          </div>

          <div className="lg:mt-10 lg:flex lg:items-center lg:gap-8">
            <div className="mt-5 flex items-center gap-3 lg:mt-0 lg:gap-8">
              <SkeletonBlock className="h-8 w-8 rounded-full bg-[#ededed] lg:h-12 lg:w-12" />
              <SkeletonBlock className="h-4 w-5 rounded-full bg-[#ededed]" />
              <SkeletonBlock className="h-8 w-8 rounded-full bg-[#ededed] lg:h-12 lg:w-12" />
            </div>
            <SkeletonBlock className="mt-5 h-11 w-full rounded-none bg-[#ededed] lg:mt-0 lg:h-[4.4rem] lg:flex-1" />
          </div>

          <SkeletonBlock className="mt-4 h-11 w-full rounded-none bg-[#ededed] lg:mt-8 lg:h-[4.6rem]" />
          <SkeletonBlock className="mt-5 h-5 w-20 rounded-full bg-[#ededed] lg:mt-10 lg:h-7" />
          <SkeletonBlock className="mt-5 h-11 w-full rounded-none bg-[#ededed] lg:mt-10 lg:h-16" />
        </div>
      </article>
    </div>
  </section>
);

export const CollectionGridSkeleton = ({ cards = 8 }) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: cards }).map((_, index) => (
      <article
        key={index}
        className="overflow-hidden bg-white"
      >
        <SkeletonBlock className="aspect-[4/5] rounded-none bg-[#EAEAEA]" />
        <div className="pt-3">
          <div className="flex gap-1.5">
            <SkeletonBlock className="h-5 w-5 rounded-full bg-[#EAEAEA]" />
            <SkeletonBlock className="h-5 w-5 rounded-full bg-[#EAEAEA]" />
            <SkeletonBlock className="h-5 w-5 rounded-full bg-[#EAEAEA]" />
          </div>
          <SkeletonBlock className="mt-3 h-4 w-4/5 rounded-none bg-[#EAEAEA]" />
          <SkeletonBlock className="mt-2 h-5 w-2/5 rounded-none bg-[#EAEAEA]" />
          <SkeletonBlock className="mt-2 h-2.5 w-20 rounded-none bg-[#EAEAEA]" />
        </div>
      </article>
    ))}
  </div>
);
