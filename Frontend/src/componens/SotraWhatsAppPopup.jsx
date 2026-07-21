import { useContext, useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { ShopContext } from "../context/ShopContext";
import { mockHeaderSlides } from "../lib/mockData";
import { ShimmerImage } from "./Skeletons";
import sotraLogo from "../assets/sotraBrand/Logo_Sotra.jpeg";

const POPUP_DELAY_MS = 5000;
const POPUP_SESSION_KEY = "sotra-whatsapp-popup-shown";
const DEFAULT_WHATSAPP_NUMBER = "96171872919";
const DEFAULT_WHATSAPP_MESSAGE =
  "Hello SotraBrand, I would like to contact you on WhatsApp.";

const getWhatsAppHref = (settingsLink = "") => {
  const configuredLink = String(settingsLink || import.meta.env.VITE_WHATSAPP_LINK || "").trim();
  if (configuredLink) return configuredLink;

  const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER).replace(/[^\d]/g, "");
  const message = encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE);

  return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
};

const getFirstHeaderImage = () =>
  [...mockHeaderSlides]
    .filter((slide) => slide.active !== false && slide.image)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))[0]?.image || "";

const SotraWordmark = () => (
  <img src={sotraLogo} alt="SotraBrand" className="mx-auto h-16 w-auto object-contain" />
);

const SotraWhatsAppPopup = ({ suppressed = false }) => {
  const { siteSettings } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const whatsappHref = useMemo(
    () => getWhatsAppHref(siteSettings?.socialLinks?.whatsapp),
    [siteSettings?.socialLinks?.whatsapp]
  );
  const image = getFirstHeaderImage();

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

  if (!visible || dismissed || suppressed) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-5 z-[880] mx-auto max-w-[410px] animate-[sotraWhatsappPopup_420ms_ease-out] overflow-hidden border border-black/10 bg-white text-[#121212] shadow-[0_22px_70px_rgba(0,0,0,0.22)]"
      aria-label="Contact on WhatsApp"
    >
      <button
        type="button"
        onClick={() => {
          window.sessionStorage.setItem(POPUP_SESSION_KEY, "true");
          setDismissed(true);
        }}
        className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center bg-white/90 text-black shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition hover:bg-black hover:text-white"
        aria-label="Close WhatsApp contact popup"
      >
        <FiX className="h-5 w-5" />
      </button>

      <div className="px-5 pb-3 pt-5">
        <SotraWordmark />
        <p className="mt-4 text-center font-serif text-[24px] leading-tight">
          Contact Us On WhatsApp
        </p>
      </div>

      <div className="mx-auto aspect-[4/5] w-[74%] max-w-[250px] overflow-hidden bg-[#eeeeee]">
        {image ? (
          <ShimmerImage
            src={image}
            alt="SotraBrand modest fashion"
            className="h-full w-full object-cover object-center"
            wrapperClassName="h-full w-full"
            skeletonClassName="bg-[#eeeeee]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-center font-serif text-2xl uppercase tracking-[0.08em] text-black/30">
            SotraBrand
          </div>
        )}
      </div>

      <div className="p-4 pt-3">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => window.sessionStorage.setItem(POPUP_SESSION_KEY, "true")}
          className="flex min-h-14 w-full items-center justify-center gap-2 bg-black px-5 text-center font-serif text-[18px] text-white transition hover:bg-[#252525] active:scale-[0.99]"
        >
          <FaWhatsapp className="h-5 w-5" />
          Contact Us On WhatsApp
        </a>
      </div>
    </aside>
  );
};

export default SotraWhatsAppPopup;
