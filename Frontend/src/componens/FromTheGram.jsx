import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiPause, FiPlay } from "react-icons/fi";
import { fromTheGramMedia } from "../lib/fromTheGramData";
import { getMockHomepageSectionItems, useMockData } from "../lib/mockData";
import { ShopContext } from "../context/ShopContext";
import { enforceVideoClipWindow } from "../utils/videoClip";
import { ShimmerImage } from "./Skeletons";

const pauseVideo = (video) => {
  if (video && !video.paused) video.pause();
};

const FromTheGramVideo = ({ item, index, registerVideo, requestPlay }) => {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(index === 0);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || shouldLoad) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    registerVideo(item.id, video);

    const syncPlaying = () => {
      const isPlaying = !video.paused;
      setPlaying(isPlaying);
      setShowButton(!isPlaying);
    };

    video.addEventListener("play", syncPlaying);
    video.addEventListener("pause", syncPlaying);

    return () => {
      registerVideo(item.id, null);
      video.removeEventListener("play", syncPlaying);
      video.removeEventListener("pause", syncPlaying);
    };
  }, [item.id, registerVideo]);

  useEffect(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);

    if (playing && showButton) {
      hideTimerRef.current = window.setTimeout(() => setShowButton(false), 1000);
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
      requestPlay(item.id);
    } else {
      pauseVideo(video);
    }
  };

  return (
    <div
      ref={wrapperRef}
      data-from-the-gram-video-id={item.id}
      onClick={togglePlayback}
      className="relative aspect-[9/16] w-full overflow-hidden bg-[#EAEAEA]"
    >
      {!loaded && <div className="nancy-video-skeleton absolute inset-0" />}

      <video
        ref={videoRef}
        src={shouldLoad ? item.src : undefined}
        poster={item.poster}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
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
          showButton ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <FiPause className="h-5 w-5" /> : <FiPlay className="ml-0.5 h-5 w-5" />}
      </button>
    </div>
  );
};

const FromTheGram = () => {
  const { backendUrl } = useContext(ShopContext);
  const sectionRef = useRef(null);
  const videosRef = useRef(new Map());
  const [sectionMedia, setSectionMedia] = useState([]);
  const mockSectionMedia = useMemo(
    () => getMockHomepageSectionItems("from-the-gram"),
    []
  );
  const gramMedia = useMemo(
    () =>
      useMockData
        ? mockSectionMedia
        : sectionMedia.length
          ? sectionMedia
          : fromTheGramMedia,
    [mockSectionMedia, sectionMedia]
  );

  useEffect(() => {
    if (useMockData) return undefined;
    let alive = true;

    const loadSection = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/homepage-sections/from-the-gram`);
        const items = (res.data?.section?.items || [])
          .filter((item) => item.active !== false && item.src)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((item, index) => ({
            id: item.id || `from-the-gram-${index}`,
            type: item.type === "video" ? "video" : "image",
            src: item.src,
            poster: item.poster || "",
            alt: item.alt || item.label || "Be Radiant by Nancy social media",
            label: item.label || item.alt || "Be Radiant by Nancy social media",
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
    } else {
      videosRef.current.delete(id);
    }
  }, []);

  const requestPlay = useCallback((activeId) => {
    videosRef.current.forEach((video, id) => {
      if (id !== activeId) pauseVideo(video);
    });

    const video = videosRef.current.get(activeId);
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.7)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) {
          requestPlay(mostVisible.target.getAttribute("data-from-the-gram-video-id"));
        }

        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.7) {
            pauseVideo(
              videosRef.current.get(
                entry.target.getAttribute("data-from-the-gram-video-id")
              )
            );
          }
        });
      },
      { threshold: [0, 0.7, 1] }
    );

    section
      .querySelectorAll("[data-from-the-gram-video-id]")
      .forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      videosRef.current.forEach((video) => pauseVideo(video));
    };
  }, [gramMedia, requestPlay]);

  if (!gramMedia.length) return null;

  return (
    <section
      ref={sectionRef}
      id="from-the-gram"
      aria-label="From The Gram"
      className="relative left-1/2 w-screen -translate-x-1/2 bg-white pb-7 pt-6 sm:pb-10 sm:pt-10"
    >
      <h2 className="px-4 pb-6 text-center text-3xl font-black uppercase text-black lg:pb-5 lg:text-2xl">
        From The Gram
      </h2>

      <div className="space-y-3 bg-white lg:grid lg:grid-cols-4 lg:gap-2 lg:space-y-0 lg:px-1">
        {gramMedia.map((item, index) =>
          item.type === "video" ? (
            <FromTheGramVideo
              key={item.id}
              item={item}
              index={index}
              registerVideo={registerVideo}
              requestPlay={requestPlay}
            />
          ) : (
            <ShimmerImage
              key={item.id}
              src={item.src}
              alt={item.alt || "Be Radiant by Nancy social story"}
              className="h-full w-full object-cover"
              wrapperClassName="aspect-[9/16] w-full bg-[#EAEAEA]"
              skeletonClassName="bg-[#EAEAEA]"
              loading={index === 0 ? "eager" : "lazy"}
              draggable="false"
            />
          )
        )}
      </div>
    </section>
  );
};

export default FromTheGram;
