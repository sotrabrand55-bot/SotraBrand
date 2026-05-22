import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiFeather,
  FiLayers,
  FiShield,
} from "react-icons/fi";
import { assests } from "../assets/assests";
import { ShimmerImage } from "../componens/Skeletons";

const values = [
  {
    title: "Craft",
    text: "Balanced compositions shaped with restraint, patience, and a precise sense of detail.",
    icon: FiFeather,
  },
  {
    title: "Ingredients",
    text: "Refined notes selected for depth, clarity, and the way they unfold on skin.",
    icon: FiLayers,
  },
  {
    title: "Lasting Trail",
    text: "Scents designed to stay close, memorable, and elegant long after the first spray.",
    icon: FiClock,
  },
];

const principles = [
  "Quiet luxury over excess",
  "Perfume built around memory",
  "Modern Lebanese elegance",
  "Details that feel personal",
];

const About = () => {
  const [aboutImage, setAboutImage] = useState(assests.About_us);
  const [aboutImageAlt, setAboutImageAlt] = useState("LEVON fragrance collection");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    let cancelled = false;
    const loadPageImages = async () => {
      try {
        const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
        const res = await fetch(`${backendUrl}/api/page-images`);
        const data = await res.json();
        if (!cancelled && data?.success) {
          setAboutImage(data.pageImages?.aboutImage || assests.About_us);
          setAboutImageAlt(
            data.pageImages?.aboutImageAlt || "LEVON fragrance collection"
          );
        }
      } catch (_) {
        if (!cancelled) setAboutImage(assests.About_us);
      }
    };

    loadPageImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative overflow-hidden bg-[#fffaf4] text-[#1f1b17]">
      <section className="border-t border-[#eadfd2]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 flex w-fit items-center gap-3 text-[#c49a5e]">
              <span className="h-px w-10 bg-current" />
              <span className="h-2.5 w-2.5 rotate-45 bg-current" />
              <span className="h-px w-10 bg-current" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
              Our Story
            </p>
            <h1 className="mt-4 font-serif text-[4rem] leading-none text-[#1f1b17] sm:text-[5.8rem] lg:text-[7rem]">
              About Levon
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#725d4c] sm:text-xl sm:leading-9">
              Perfume made for a quiet, memorable trail.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#7d6756] sm:text-base">
              LEVON is a Lebanese fragrance house creating modern perfume with
              intention, precision, and understated confidence. Each blend is
              made to feel refined without becoming loud, leaving a trail that
              belongs to memory as much as it belongs to scent.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/collection"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
              >
                Explore Collection
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#d8c2a5] px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#1f1b17]"
              >
                Contact Levon
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-8 hidden h-[78%] w-[92%] border border-[#d8c2a5] lg:block" />
            <div className="relative overflow-hidden rounded-md bg-[#eadfd2] shadow-[0_28px_70px_rgba(62,45,28,0.16)]">
              <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                <ShimmerImage
                  src={aboutImage}
                  alt={aboutImageAlt}
                  className="h-full w-full object-cover"
                  wrapperClassName="h-full w-full"
                  skeletonClassName="bg-[#E9DFD3]"
                  loading="eager"
                  draggable="false"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1b17]/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d8b778]">
                  Levon Fragrance House
                </p>
                <p className="mt-2 max-w-md font-serif text-3xl leading-tight">
                  A refined signature, composed with care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfd2] bg-[#fffdf9]">
        <div className="mx-auto grid max-w-7xl gap-px px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
          {values.map(({ title, text, icon: Icon }) => (
            <div
              key={title}
              className="border-b border-[#eadfd2] py-7 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-full border border-[#d8c2a5] text-[#c49a5e]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-3xl text-[#1f1b17]">{title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#7d6756]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            The Levon Way
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-5xl leading-none text-[#1f1b17] sm:text-6xl">
            Luxury that stays close.
          </h2>
        </div>

        <div className="grid gap-8">
          <div className="border-l border-[#c49a5e] pl-6">
            <h3 className="font-serif text-3xl text-[#1f1b17]">Our Mission</h3>
            <p className="mt-4 text-sm leading-8 text-[#7d6756] sm:text-base">
              To redefine luxury through thoughtful fragrance design,
              exceptional quality, and timeless craftsmanship. We create scents
              that move beyond trends, blends that feel personal, composed, and
              enduring.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 border border-[#eadfd2] bg-[#fffdf9] px-4 py-4"
              >
                <FiShield className="h-4 w-4 shrink-0 text-[#c49a5e]" />
                <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6f5844]">
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="max-w-3xl text-sm leading-8 text-[#7d6756] sm:text-base">
            We believe perfume should be beautifully built, not overexplained.
            From the first note to the dry down, LEVON is made for people who
            notice texture, silence, warmth, and the lasting impression of a
            well-composed scent.
          </p>
        </div>
      </section>

      <section className="bg-[#1f1b17] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8b778]">
              Begin with the trail
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Find the scent that feels like you.
            </h2>
          </div>
          <Link
            to="/collection"
            className="inline-flex w-fit items-center gap-3 rounded-full border border-white/25 px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#d8b778] hover:bg-[#d8b778] hover:text-[#1f1b17]"
          >
            Shop Levon
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default About;
