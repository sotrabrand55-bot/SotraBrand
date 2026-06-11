import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiFeather, FiHeart, FiShield } from "react-icons/fi";
import { assests } from "../assets/assests";
import { ShimmerImage } from "../componens/Skeletons";
import { useMockData } from "../lib/mockData";

const values = [
  {
    title: "Radiance",
    text: "Body rituals created to feel soft, polished, and beautifully present on the skin.",
    icon: FiHeart,
  },
  {
    title: "Detail",
    text: "Each formula and fragrance direction is chosen with a clean, feminine finish in mind.",
    icon: FiFeather,
  },
  {
    title: "Confidence",
    text: "A lasting glow that feels personal, elegant, and ready for everyday moments.",
    icon: FiClock,
  },
];

const principles = [
  "Pure white visual direction",
  "Soft feminine rituals",
  "Modern Lebanese beauty",
  "Details made to feel personal",
];

const About = () => {
  const [aboutImage, setAboutImage] = useState(assests.About_us);
  const [aboutImageAlt, setAboutImageAlt] = useState("Be Radiant by Nancy story");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    let cancelled = false;
    if (useMockData) {
      return () => {
        cancelled = true;
      };
    }

    const loadPageImages = async () => {
      try {
        const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
        const res = await fetch(`${backendUrl}/api/page-images`);
        const data = await res.json();
        if (!cancelled && data?.success) {
          setAboutImage(data.pageImages?.aboutImage || assests.About_us);
          setAboutImageAlt(
            data.pageImages?.aboutImageAlt || "Be Radiant by Nancy story"
          );
        }
      } catch {
        if (!cancelled) setAboutImage(assests.About_us);
      }
    };

    loadPageImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="bg-white text-black">
      <section className="border-b border-black/15">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50">
              Be Radiant By Nancy
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none sm:text-7xl">
              About
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/65 sm:text-xl">
              Beauty rituals made for softness, confidence, and a radiant everyday finish.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-black/55 sm:text-base">
              Be Radiant By Nancy brings together body care and fragrance in a clean,
              feminine world: polished visuals, thoughtful textures, and products designed
              to make the skin feel cared for before the scent even settles.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/collection"
                className="inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222]"
              >
                Explore Collection
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center border border-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                Contact Nancy
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white">
            <div className="aspect-[4/5] border border-black/10 sm:aspect-[5/4] lg:aspect-[4/5]">
              <ShimmerImage
                src={aboutImage}
                alt={aboutImageAlt}
                className="h-full w-full object-cover"
                wrapperClassName="h-full w-full"
                skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
                loading="eager"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/15 bg-white">
        <div className="mx-auto grid max-w-7xl px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          {values.map(({ title, text, icon: Icon }) => (
            <div
              key={title}
              className="border-b border-black/15 py-7 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center border border-black/20 text-black">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[0.05em] text-black">
                {title}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-black/55">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/45">
            The Nancy Way
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black uppercase leading-tight sm:text-5xl">
            Luxury that feels clean, close, and personal.
          </h2>
        </div>

        <div className="grid gap-8">
          <div className="border-l border-black pl-6">
            <h3 className="text-2xl font-black uppercase tracking-[0.05em]">
              Our Promise
            </h3>
            <p className="mt-4 text-sm leading-8 text-black/55 sm:text-base">
              To create skincare and scent rituals that feel refined without becoming
              complicated: beautiful textures, clear presentation, and a feminine mood
              that stays true to Be Radiant By Nancy.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border border-black/15 bg-white px-4 py-4"
              >
                <FiShield className="h-4 w-4 shrink-0 text-black" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-black/70">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
