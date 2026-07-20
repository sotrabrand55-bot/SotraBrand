import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiPause, FiPlay } from "react-icons/fi";
import { nancyVideoGallery } from "../lib/videoGalleryData";
import { getMockHomepageSectionItems, useMockData } from "../lib/mockData";
import { enforceVideoClipWindow } from "../utils/videoClip";
import { ShimmerImage } from "./Skeletons";
import { ShopContext } from "../context/ShopContext";

const pauseVideoElement = (video) => {
  if (!video || video.paused) return;
  video.pause();
};

const LuxuryVideoCard = ({ item, index, registerVideo, requestPlay }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(index < 2);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || shouldLoad) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const videoNode = videoRef.current;
    if (!videoNode) return undefined;

    registerVideo(item.id, videoNode);

    const syncPlaying = () => {
      const isPlaying = !videoNode.paused;
      setPlaying(isPlaying);
      setShowButton(!isPlaying);
    };

    videoNode.addEventListener("play", syncPlaying);
    videoNode.addEventListener("pause", syncPlaying);

    return () => {
      registerVideo(item.id, null);
      videoNode.removeEventListener("play", syncPlaying);
      videoNode.removeEventListener("pause", syncPlaying);
    };
  }, [registerVideo, item.id]);

  useEffect(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    if (playing && showButton) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowButton(false);
      }, 1000);
    }

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [playing, showButton]);

  const togglePlayback = () => {
    const videoNode = videoRef.current;
    if (!videoNode) return;

    setShowButton(true);

    if (videoNode.paused) {
      requestPlay(item.id);
      return;
    }

    pauseVideoElement(videoNode);
  };

  return (
    <article
      ref={cardRef}
      onClick={togglePlayback}
      className="nancy-video-card relative overflow-hidden bg-[#EAEAEA]"
      data-gallery-card-id={item.id}
      data-video-card-id={item.id}
    >
      {!loaded && <div className="nancy-video-skeleton absolute inset-0" />}

      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        src={shouldLoad ? item.src : undefined}
        poster={item.poster}
        preload="metadata"
        playsInline
        muted
        loop
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback"
        onLoadedData={() => setLoaded(true)}
        onTimeUpdate={(event) => enforceVideoClipWindow(event.currentTarget)}
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          togglePlayback();
        }}
        className={`nancy-video-toggle absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-black transition duration-300 ${
          showButton ? "opacity-100" : "opacity-0"
        }`}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <FiPause className="h-5 w-5" /> : <FiPlay className="ml-0.5 h-5 w-5" />}
      </button>
    </article>
  );
};

const LuxuryImageCard = ({ item }) => (
  <article
    className="nancy-video-card relative overflow-hidden bg-[#EAEAEA]"
    data-gallery-card-id={item.id}
  >
    <ShimmerImage
      src={item.src}
      alt={item.alt || "SotraBrand gallery image"}
      className="h-full w-full object-cover"
      wrapperClassName="h-full w-full"
      skeletonClassName="bg-[#EAEAEA]"
      draggable="false"
    />
  </article>
);

const LuxuryVideoGallery = () => {
  const { backendUrl } = useContext(ShopContext);
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const videosRef = useRef(new Map());
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionMedia, setSectionMedia] = useState([]);
  const mockSectionMedia = useMemo(
    () => getMockHomepageSectionItems("luxury-gallery"),
    []
  );
  const galleryMedia = useMemo(
    () =>
      useMockData
        ? mockSectionMedia.length
          ? mockSectionMedia
          : nancyVideoGallery
        : sectionMedia.length
          ? sectionMedia
          : nancyVideoGallery,
    [mockSectionMedia, sectionMedia]
  );

  useEffect(() => {
    if (useMockData) return undefined;
    let alive = true;

    const loadSection = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/homepage-sections/luxury-gallery`);
        const items = (res.data?.section?.items || [])
          .filter((item) => item.active !== false && item.src)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item, index) => ({
            id: item.id || `luxury-gallery-${index}`,
            type: item.type === "video" ? "video" : "image",
            src: item.src,
            poster: item.poster || "",
            alt: item.alt || item.label || "SotraBrand gallery media",
            label: item.label || item.alt || "SotraBrand gallery media",
          }));
        if (alive) setSectionMedia(items);
      } catch {
        if (alive) setSectionMedia([]);
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
  }, [backendUrl]);

  const registerVideo = useCallback((id, node) => {
    if (node) {
      videosRef.current.set(id, node);
      return;
    }

    videosRef.current.delete(id);
  }, []);

  const pauseAllExcept = useCallback((activeId) => {
    videosRef.current.forEach((videoNode, id) => {
      if (id !== activeId) pauseVideoElement(videoNode);
    });
  }, []);

  const requestPlay = useCallback((id) => {
    const videoNode = videosRef.current.get(id);
    if (!videoNode) return;

    pauseAllExcept(id);
    videoNode.muted = true;
    videoNode.play().catch(() => {});
  }, [pauseAllExcept]);

  const syncActiveVideo = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const cards = Array.from(rail.querySelectorAll("[data-gallery-card-id]"));
    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - railCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.7
        );

        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.7) {
            const id = entry.target.getAttribute("data-video-card-id");
            pauseVideoElement(videosRef.current.get(id));
          }
        });

        if (!visibleEntries.length) return;

        const activeEntry = visibleEntries.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        )[0];
        const activeId = activeEntry.target.getAttribute("data-video-card-id");
        const activeIndex = galleryMedia.findIndex((item) => item.id === activeId);
        if (activeIndex >= 0) setActiveIndex(activeIndex);
        requestPlay(activeId);
      },
      { threshold: [0, 0.7, 1] }
    );

    section
      .querySelectorAll("[data-video-card-id]")
      .forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      videosRef.current.forEach((videoNode) => pauseVideoElement(videoNode));
    };
  }, [galleryMedia, requestPlay]);

  if (!galleryMedia.length) return null;

  return (
    <section
      id="luxury-media-gallery"
      className="relative left-1/2 mt-8 w-screen -translate-x-1/2 bg-white py-0"
    >
      <div
        ref={sectionRef}
        className="mx-auto w-full max-w-[430px] bg-white lg:max-w-none"
      >
        <div
          ref={railRef}
          onScroll={syncActiveVideo}
          className="nancy-video-grid no-scrollbar"
        >
          {galleryMedia.map((item, index) =>
            item.type === "image" ? (
              <LuxuryImageCard key={item.id} item={item} />
            ) : (
              <LuxuryVideoCard
                key={item.id}
                item={item}
                index={index}
                registerVideo={registerVideo}
                requestPlay={requestPlay}
              />
            )
          )}
        </div>

        <div className="nancy-video-progress" aria-hidden="true">
          <span
            style={{
              width: `${100 / galleryMedia.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default LuxuryVideoGallery;
