import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import { mockHeaderSlides, useMockData } from "../lib/mockData";
import { ShimmerImage } from "./Skeletons";

const POPUP_DELAY_MS = 5000;
const POPUP_SESSION_KEY = "sotra-order-whatsapp-popup-shown";
const DEFAULT_WHATSAPP_NUMBER = "96171872919";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hello SotraBrand, I would like to order through WhatsApp.";

const getWhatsAppHref = () => {
  const configuredLink = String(import.meta.env.VITE_WHATSAPP_LINK || "").trim();
  if (configuredLink) return configuredLink;

  const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER).replace(/[^\d]/g, "");
  const message = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);

  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
};

const getFirstHeaderImage = (slides = []) =>
  [...slides]
    .filter((slide) => slide.active !== false && slide.image)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))[0]?.image || "";

const WhatsAppOrderPopup = ({ suppressed = false }) => {
  const { backendUrl } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [image, setImage] = useState(() =>
    useMockData ? getFirstHeaderImage(mockHeaderSlides) : ""
  );

  const whatsappHref = useMemo(getWhatsAppHref, []);

  useEffect(() => {
    if (dismissed || visible) return undefined;
    if (window.sessionStorage.getItem(POPUP_SESSION_KEY) === "true") {
      setDismissed(true);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(POPUP_SESSION_KEY, "true");
      setVisible(true);
    }, POPUP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [dismissed, visible]);

  useEffect(() => {
    if (useMockData) return undefined;
    let alive = true;

    const loadFirstHeaderImage = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/header-slides/list`);
        if (!alive) return;
        setImage(getFirstHeaderImage(res.data?.slides || []));
      } catch {
        if (alive) setImage("");
      }
    };

    loadFirstHeaderImage();
    return () => {
      alive = false;
    };
  }, [backendUrl]);

  if (!visible || dismissed || suppressed) return null;

  return (
    <aside
      className="fixed inset-x-3 bottom-5 z-[900] mx-auto max-w-[420px] animate-[nancyWhatsappPopup_420ms_ease-out] overflow-hidden rounded-[14px] border border-black/10 bg-white text-black shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:bottom-7"
      aria-label="Order through WhatsApp"
    >
      <button
        type="button"
        onClick={() => {
          window.sessionStorage.setItem(POPUP_SESSION_KEY, "true");
          setDismissed(true);
        }}
        className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-black shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition hover:bg-black hover:text-white"
        aria-label="Close WhatsApp order popup"
      >
        <FiX className="h-5 w-5" />
      </button>

      <div className="px-5 pb-3 pt-4 text-center">
        <h2 className="text-2xl font-black leading-tight tracking-[-0.01em] sm:text-3xl">
          Order Through Whatsapp
        </h2>
        <p className="mt-1 text-sm tracking-[0.02em] text-black/70 sm:text-base">
          Cash On Delivery Service Is Available
        </p>
      </div>

      <div className="mx-auto aspect-[4/5] w-[78%] max-w-[280px] overflow-hidden bg-[#EAEAEA]">
        {image ? (
          <ShimmerImage
            src={image}
            alt="SotraBrand"
            className="h-full w-full object-cover object-center"
            wrapperClassName="h-full w-full"
            skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-center text-xs font-bold uppercase tracking-[0.18em] text-black/40">
            SotraBrand
          </div>
        )}
      </div>

      <div className="p-4 pt-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            window.sessionStorage.setItem(POPUP_SESSION_KEY, "true");
          }}
          className="flex min-h-14 w-full items-center justify-center bg-black px-5 text-center text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#252525] active:scale-[0.99] sm:text-base"
        >
          Contact Us On WhatsApp
        </a>
      </div>
    </aside>
  );
};

export default WhatsAppOrderPopup;
