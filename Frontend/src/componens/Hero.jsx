import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { mockHeaderSlides, useMockData } from "../lib/mockData";
import { HeroSkeleton, SkeletonBlock } from "./Skeletons";

const HERO_AUTOPLAY_MS = 2500;

const mapHeaderSlides = (slides = []) =>
  slides
    .filter((slide) => slide.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((slide, index) => ({
      id: slide._id || index,
      image: slide.image,
      desktopImage: slide.desktopImage || "",
    }))
    .filter((slide) => slide.image);

const Hero = () => {
  const { backendUrl } = useContext(ShopContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let alive = true;

    if (useMockData) {
      const list = mapHeaderSlides(mockHeaderSlides);
      setSlides(list);
      setCurrent(0);
      setLoading(false);
      return () => {
        alive = false;
      };
    }

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

  const startX = useRef(0);
  const lastX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (slides.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, HERO_AUTOPLAY_MS);

    return () => window.clearInterval(interval);
  }, [slides.length, current]);

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
    const threshold = window.innerWidth * 0.16;

    if (dx <= -threshold) setCurrent((p) => (p + 1) % slides.length);
    if (dx >= threshold) setCurrent((p) => (p - 1 + slides.length) % slides.length);
  };

  if (loading) return <HeroSkeleton />;
  if (!slides.length) return null;

  const activeSlide = slides[current];
  const imageKey = `${activeSlide.id}-${activeSlide.image}-${activeSlide.desktopImage}`;
  const imageReady = Boolean(loadedImages[imageKey]);

  return (
    <section
      className="relative left-1/2 aspect-[9/16] w-screen -translate-x-1/2 overflow-hidden bg-[#EAEAEA] select-none md:aspect-[2/1] md:w-[calc(100vw-12px)] md:rounded-[16px]"
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
      aria-label="Be Radiant by Nancy hero"
    >
      {slides.map((slide, index) => {
        const key = `${slide.id}-${slide.image}-${slide.desktopImage}`;
        const isActive = index === current;

        return (
          <picture key={key} className="absolute inset-0">
            <source media="(min-width: 768px)" srcSet={slide.desktopImage || slide.image} />
            <img
              src={slide.image}
              alt={isActive ? "Be Radiant by Nancy perfume" : ""}
              aria-hidden={!isActive}
              className={`nancy-velvet-fade-slide h-full w-full object-cover object-center ${
                isActive && loadedImages[key] ? "is-active opacity-100" : "opacity-0"
              }`}
              draggable="false"
              loading="eager"
              decoding="async"
              onLoad={() => setLoadedImages((prev) => ({ ...prev, [key]: true }))}
              onError={() => setLoadedImages((prev) => ({ ...prev, [key]: true }))}
            />
          </picture>
        );
      })}

      {!imageReady && (
        <div className="absolute inset-0">
          <SkeletonBlock className="nancy-cool-shimmer h-full w-full rounded-none bg-[#EAEAEA]" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/10 to-transparent" />

    </section>
  );
};

export default Hero;
