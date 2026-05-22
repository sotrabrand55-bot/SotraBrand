import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { HeroSkeleton, SkeletonBlock } from "./Skeletons";

const mapHeaderSlides = (slides = []) =>
  slides
    .filter((slide) => slide.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((slide, index) => ({
      id: slide._id || index,
      image: slide.image,
      title: slide.title || "",
      blurb: slide.blurb || "",
      badges: Array.isArray(slide.badges) ? slide.badges : [],
    }))
    .filter((slide) => slide.image);

const Hero = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let alive = true;

    const loadHeaderSlides = async (initialLoad = false) => {
      try {
        if (initialLoad) setLoading(true);
        const res = await axios.get(`${backendUrl}/api/header-slides/list`);
        if (res.data?.success) {
          const list = mapHeaderSlides(res.data.slides || []);
          if (!alive) return;
          setSlides(list);
          setCurrent((prev) => (list.length ? Math.min(prev, list.length - 1) : 0));
        }
      } catch (error) {
        console.error("Failed to load header slides", error);
        if (initialLoad && alive) setSlides([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadHeaderSlides(true);

    const refresh = () => loadHeaderSlides(false);
    const interval = window.setInterval(refresh, 8000);
    window.addEventListener("focus", refresh);

    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [backendUrl]);

  const trackRef = useRef(null);
  const startX = useRef(0);
  const lastX = useRef(0);
  const isDragging = useRef(false);
  const widthRef = useRef(0);

  useEffect(() => {
    const updateWidth = () => {
      widthRef.current = trackRef.current?.clientWidth || window.innerWidth;
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onStart = (x) => {
    isDragging.current = true;
    startX.current = x;
    lastX.current = x;
  };

  const onMove = (x) => {
    if (!isDragging.current) return;
    lastX.current = x;
  };

  const onEnd = () => {
    if (!isDragging.current || slides.length < 2) return;
    isDragging.current = false;
    const dx = lastX.current - startX.current;
    const threshold = (widthRef.current || window.innerWidth) * 0.16;

    if (dx <= -threshold) setCurrent((p) => (p + 1) % slides.length);
    if (dx >= threshold) setCurrent((p) => (p - 1 + slides.length) % slides.length);
  };

  const shouldLoadSlide = (index) => {
    if (slides.length <= 3) return true;
    const previous = (current - 1 + slides.length) % slides.length;
    const next = (current + 1) % slides.length;
    const afterNext = (current + 2) % slides.length;
    return [previous, current, next, afterNext].includes(index);
  };

  if (loading) return <HeroSkeleton />;
  if (!slides.length) return null;

  const activeSlide = slides[current];
  const gallerySlides = Array.from({ length: 3 }, (_, offset) => {
    const sourceIndex = (current + offset) % slides.length;
    return { ...slides[sourceIndex], sourceIndex };
  });

  const goPrevious = () => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setCurrent((p) => (p + 1) % slides.length);
  };

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#fff7ef] select-none"
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={(e) => {
        e.preventDefault();
        onStart(e.clientX);
      }}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
    >
      <div
        ref={trackRef}
        className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl items-center gap-5 px-4 py-5 sm:min-h-[calc(100vh-5rem)] sm:gap-9 sm:px-6 sm:py-10 md:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14"
      >
        <div className="relative z-10 pt-2 md:pt-0">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b9945d] sm:mb-4 sm:text-xs sm:tracking-[0.34em]">
            Levon Parfum
          </p>
          <h1 className="font-serif text-[clamp(3.15rem,15vw,6.8rem)] leading-[0.88] text-[#1e1a16] sm:text-[clamp(2.75rem,8vw,6.8rem)] sm:leading-[0.95]">
            Signature
            <span className="block text-[#7c5f3a]">Scents</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#665d53] sm:mt-6 sm:text-base">
            {activeSlide.blurb || "Crafted for moments that stay."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
            <button
              type="button"
              onClick={() => navigate("/collection")}
              className="inline-flex items-center gap-3 rounded-full bg-[#1f1b17] px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#342c24] sm:px-6 sm:text-sm"
            >
              Shop Now
              <FiArrowRight className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap gap-2">
              {(activeSlide.badges?.length ? activeSlide.badges : ["Amber", "Oud", "Musk"])
                .slice(0, 3)
                .map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-[#dfd1c1] bg-white/60 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#625647] sm:px-4 sm:text-xs"
                  >
                    {badge}
                  </span>
                ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 sm:mt-9">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrevious}
                aria-label="Previous hero slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#d8c9b7] bg-white/75 text-[#2b241d] transition hover:border-[#b9945d] hover:bg-white sm:h-11 sm:w-11"
              >
                <FiArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next hero slide"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#d8c9b7] bg-white/75 text-[#2b241d] transition hover:border-[#b9945d] hover:bg-white sm:h-11 sm:w-11"
              >
                <FiArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {slides.map((_, idx) => {
                const active = idx === current;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      active ? "w-9 bg-[#1f1b17]" : "w-2.5 bg-[#cdbda8] hover:bg-[#a98c67]"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative h-[32vh] min-h-[220px] sm:h-[62vh] sm:min-h-[390px] lg:h-[70vh]">
          <div className="absolute -left-10 top-8 hidden h-32 w-32 rounded-full border border-[#dcc7ae] md:block" />
          <div className="grid h-full grid-cols-[1.1fr_0.78fr] grid-rows-2 gap-2.5 sm:gap-4">
            {gallerySlides.map((slide, index) => {
              const imageKey = `${slide.id}-${slide.image}`;
              const imageReady = Boolean(loadedImages[imageKey]);
              const loadImage = shouldLoadSlide(slide.sourceIndex) || imageReady;
              const isPrimary = index === 0;

              return (
                <button
                  type="button"
                  key={`${slide.id}-${index}`}
                  onClick={() => setCurrent(slide.sourceIndex)}
                  className={`group relative overflow-hidden rounded-sm bg-[#eadfd2] text-left shadow-[0_14px_34px_rgba(53,39,25,0.14)] sm:shadow-[0_18px_45px_rgba(53,39,25,0.16)] ${
                    isPrimary ? "row-span-2" : ""
                  }`}
                >
                  {loadImage && (
                    <img
                      src={slide.image}
                      alt={slide.title || "Levon perfume"}
                      className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                        imageReady ? "opacity-100" : "opacity-0"
                      }`}
                      draggable="false"
                      loading={slide.sourceIndex === current ? "eager" : "lazy"}
                      decoding="async"
                      onLoad={() =>
                        setLoadedImages((prev) => ({ ...prev, [imageKey]: true }))
                      }
                      onError={() =>
                        setLoadedImages((prev) => ({ ...prev, [imageKey]: true }))
                      }
                    />
                  )}
                  {!imageReady && (
                    <div className="absolute inset-0">
                      <SkeletonBlock className="h-full w-full rounded-none bg-[#E9DFD3]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
                      {isPrimary ? "Featured" : "Note"}
                    </p>
                    <h2
                      className={`${
                        isPrimary ? "text-xl sm:text-4xl" : "text-base sm:text-2xl"
                      } mt-1 font-serif leading-tight`}
                    >
                      {slide.title || "Levon"}
                    </h2>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
