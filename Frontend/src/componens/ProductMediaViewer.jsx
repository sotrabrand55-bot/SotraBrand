import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { ShimmerImage } from "./Skeletons";

const ProductMediaViewer = ({
  product,
  images,
  initialIndex,
  onClose,
  viewerLabel = "story images",
}) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusImage = window.requestAnimationFrame(() => {
      const target = viewerRef.current?.querySelector(
        `[data-product-viewer-index="${initialIndex}"]`
      );
      target?.scrollIntoView({ block: "start" });
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusImage);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [initialIndex, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={viewerRef}
      className="fixed inset-0 z-[1200] overflow-y-auto overscroll-contain bg-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} ${viewerLabel}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-3 top-3 z-[1210] grid h-11 w-11 place-items-center rounded-full bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:bg-[#262626] active:scale-95 sm:right-5 sm:top-5"
        aria-label={`Close ${viewerLabel}`}
      >
        <FiX className="h-5 w-5" />
      </button>

      <div className="mx-auto w-full max-w-[52rem] space-y-7 bg-white py-7 sm:space-y-10 sm:py-10">
        {images.map((image, index) => (
          <div
            key={image.id || `${image.image}-${index}`}
            data-product-viewer-index={index}
            className="aspect-[4/5] w-full bg-white"
          >
            <ShimmerImage
              src={image.image}
              alt={image.alt || `${product.name} image ${index + 1}`}
              className="h-full w-full object-contain"
              wrapperClassName="h-full w-full"
              skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
              loading={Math.abs(index - initialIndex) <= 1 ? "eager" : "lazy"}
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

export default ProductMediaViewer;
