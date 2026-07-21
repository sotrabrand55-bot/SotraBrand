import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiFeather, FiHeart, FiShield } from "react-icons/fi";
import aboutImageFallback from "../assets/sotraBrand/Header_1.jpeg";
import { ShimmerImage } from "../componens/Skeletons";
import { useMockData } from "../lib/mockData";

const values = [
  {
    title: "Modesty",
    text: "Designed for women who value coverage, comfort, and quiet elegance.",
    icon: FiHeart,
  },
  {
    title: "Quality",
    text: "Each piece is selected with refined fabrics, clean finishing, and lasting wear in mind.",
    icon: FiFeather,
  },
  {
    title: "Elegance",
    text: "Simple silhouettes made to feel graceful without compromising personal style.",
    icon: FiClock,
  },
];

const principles = [
  "Elegant modest silhouettes",
  "Comfort-focused clothing",
  "Quality fabrics and details",
  "Style with purpose",
];

const About = () => {
  const [aboutImage, setAboutImage] = useState(aboutImageFallback);
  const [aboutImageAlt, setAboutImageAlt] = useState("SotraBrand story");

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
          setAboutImage(data.pageImages?.aboutImage || aboutImageFallback);
          setAboutImageAlt(
            data.pageImages?.aboutImageAlt || "SotraBrand story"
          );
        }
      } catch {
        if (!cancelled) setAboutImage(aboutImageFallback);
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
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#ad9a7d]">
              About Sotra
            </p>
            <h1 className="mt-4 font-serif text-[42px] font-normal leading-[0.98] text-[#121212] sm:text-[68px]">
              Where Modesty Meets Elegance
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[#625d58] sm:text-[19px] sm:leading-9">
              SOTRA is a modest fashion brand dedicated to providing elegant,
              comfortable, and high-quality clothing for women. We believe that
              true beauty lies in confidence, simplicity, and modesty.
            </p>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-[#6f6963] sm:text-[18px]">
              Designed for women who value modesty without compromising on style.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/collection"
                className="inline-flex h-12 items-center justify-center gap-3 rounded-[6px] bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222]"
              >
                Explore Collection
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-12 items-center justify-center rounded-[6px] border border-black/70 px-7 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white"
              >
                Contact Us
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
                skeletonClassName="sotra-cool-shimmer bg-[#EAEAEA]"
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
              <h2 className="font-serif text-[28px] font-normal leading-none text-[#121212]">
                {title}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[#625d58]">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/45">
            The Sotra Way
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-[38px] font-normal leading-tight text-[#121212] sm:text-[54px]">
            Modest fashion made with clarity, comfort, and grace.
          </h2>
        </div>

        <div className="grid gap-8">
          <div className="border-l border-black pl-6">
            <h3 className="font-serif text-[30px] font-normal leading-none text-[#121212]">
              Our Promise
            </h3>
            <p className="mt-4 text-[16px] leading-8 text-[#625d58] sm:text-[18px]">
              To offer pieces that support confidence, simplicity, and modesty,
              while keeping every wardrobe elegant and practical.
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
