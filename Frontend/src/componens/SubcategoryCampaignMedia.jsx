/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { ShimmerImage } from "./Skeletons";
import { enforceVideoClipWindow } from "../utils/videoClip";

const SubcategoryCampaignMedia = ({ media }) => {
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  const visibleRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(media?.type !== "video");
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || shouldLoad || media?.type !== "video") return undefined;

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
  }, [media?.type, shouldLoad]);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video || media?.type !== "video") return undefined;

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
  }, [media?.type]);

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
      video.muted = true;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  if (!media?.src) return null;

  return (
    <section className="border-t border-black/20 bg-white pt-2">
      <div
        ref={frameRef}
        onClick={media.type === "video" ? togglePlayback : undefined}
        className="relative mx-auto aspect-[9/16] w-full overflow-hidden bg-[#EAEAEA] md:aspect-[2/1]"
      >
        {media.type === "video" ? (
          <>
            {!loaded && <div className="nancy-video-skeleton absolute inset-0" />}
            <video
              ref={videoRef}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              src={shouldLoad ? media.src : undefined}
              poster={media.poster || ""}
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
        ) : (
          <ShimmerImage
            src={media.src}
            alt={media.label || ""}
            className="h-full w-full object-cover"
            wrapperClassName="h-full w-full"
            skeletonClassName="bg-[#EAEAEA]"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
};

export default SubcategoryCampaignMedia;
