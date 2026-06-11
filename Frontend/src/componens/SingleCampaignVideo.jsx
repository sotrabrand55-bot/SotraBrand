import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiPause, FiPlay } from "react-icons/fi";
import { singleCampaignVideo } from "../lib/singleCampaignVideoData";
import { getMockHomepageSectionItems, useMockData } from "../lib/mockData";
import { ShopContext } from "../context/ShopContext";
import { enforceVideoClipWindow } from "../utils/videoClip";
import { ShimmerImage } from "./Skeletons";

const SingleCampaignVideo = () => {
  const { backendUrl } = useContext(ShopContext);
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  const visibleRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sectionItem, setSectionItem] = useState(null);
  const mockSectionItem = useMemo(
    () => getMockHomepageSectionItems("single-campaign")[0] || null,
    []
  );
  const media = useMemo(
    () =>
      useMockData && mockSectionItem
        ? mockSectionItem
        : sectionItem || { ...singleCampaignVideo, type: "video" },
    [mockSectionItem, sectionItem]
  );
  const activeSrc =
    isDesktop && media.desktopSrc ? media.desktopSrc : media.src;

  useEffect(() => {
    if (useMockData) return undefined;
    let alive = true;

    const loadSection = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/homepage-sections/single-campaign`);
        const item = (res.data?.section?.items || [])
          .filter((entry) => entry.active !== false && entry.src)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];

        if (!alive) return;
        setSectionItem(
          item
            ? {
                id: item.id || "single-campaign-live",
                type: item.type === "video" ? "video" : "image",
                src: item.src,
                desktopSrc: item.desktopSrc || "",
                poster: item.poster || "",
                alt: item.alt || item.label || "Be Radiant by Nancy campaign media",
                label: item.label || item.alt || "Be Radiant by Nancy campaign media",
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
  }, [backendUrl]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (media.type !== "video") return undefined;
    const frame = frameRef.current;
    if (!frame || shouldLoad) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [media.type, shouldLoad]);

  useEffect(() => {
    if (media.type !== "video") return undefined;
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          visibleRef.current = true;
          video.muted = true;
          video.play().catch(() => {});
          return;
        }

        visibleRef.current = false;
        video.pause();
      },
      { threshold: [0, 0.7, 1] }
    );

    observer.observe(frame);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [media.type]);

  useEffect(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);

    if (playing && showButton) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowButton(false);
      }, 1000);
    }

    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [playing, showButton]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    setShowButton(true);
    if (video.paused) {
      video.muted = true;
      video.play().catch(() => {});
      return;
    }

    video.pause();
  };

  return (
    <section
      id="single-campaign-video"
      className="relative left-1/2 mt-7 w-screen -translate-x-1/2 bg-white sm:mt-10"
    >
      <div
        ref={frameRef}
        onClick={media.type === "video" ? togglePlayback : undefined}
        className="relative mx-auto aspect-[9/16] w-[calc(100vw-24px)] overflow-hidden bg-[#EAEAEA] md:aspect-[2/1] md:w-[calc(100vw-12px)] md:rounded-[16px]"
      >
        {media.type === "image" ? (
          <ShimmerImage
            src={activeSrc}
            alt={media.alt || media.label}
            className="h-full w-full object-cover"
            wrapperClassName="h-full w-full"
            skeletonClassName="bg-[#EAEAEA]"
          />
        ) : (
          <>
            {!loaded && <div className="nancy-video-skeleton absolute inset-0" />}

            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              src={shouldLoad ? activeSrc : undefined}
              poster={media.poster}
              preload="metadata"
              playsInline
              muted
              loop
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noplaybackrate noremoteplayback"
              onLoadedData={() => {
                setLoaded(true);
                if (visibleRef.current) videoRef.current?.play().catch(() => {});
              }}
              onTimeUpdate={(event) => enforceVideoClipWindow(event.currentTarget)}
              onPlay={() => {
                setPlaying(true);
                setShowButton(true);
              }}
              onPause={() => {
                setPlaying(false);
                setShowButton(true);
              }}
              aria-label={media.label}
            />

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                togglePlayback();
              }}
              className={`nancy-video-toggle absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-black transition duration-300 ${
                showButton ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-label={playing ? "Pause video" : "Play video"}
            >
              {playing ? <FiPause className="h-5 w-5" /> : <FiPlay className="ml-0.5 h-5 w-5" />}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default SingleCampaignVideo;
