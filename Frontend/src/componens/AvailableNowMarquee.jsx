import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const AvailableNowMarquee = () => {
  const { siteSettings } = useContext(ShopContext);
  const text = siteSettings?.availableNowText || "AVAILABLE NOW";

  return (
    <section className="relative left-1/2 -mt-4 w-screen -translate-x-1/2 overflow-hidden bg-white sm:-mt-2">
      <div className="nancy-available-marquee flex h-[6rem] w-max items-center gap-12 sm:h-[12rem] sm:gap-24 lg:h-[14rem] lg:gap-32">
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={index}
            className="shrink-0 whitespace-nowrap font-sans text-[2.25rem] font-black uppercase leading-none tracking-[-0.02em] text-black sm:text-[4.7rem] lg:text-[5.5rem]"
          >
            {text}
          </span>
        ))}
      </div>
    </section>
  );
};

export default AvailableNowMarquee;
