import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiHeadphones,
  FiHeart,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { sotraCategoryTiles, sotraHeroSlides } from "../lib/mockData";
import { ShimmerImage } from "../componens/Skeletons";
import LuxuryVideoGallery from "../componens/LuxuryVideoGallery";

const SectionTitle = ({ children }) => (
  <h2 className="font-serif text-[31px] font-normal leading-tight text-[#121212] sm:text-[50px] lg:text-[56px]">
    {children}
  </h2>
);

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (sotraHeroSlides.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % sotraHeroSlides.length);
    }, 3200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[450px] overflow-hidden bg-[#eeeeee] sm:h-[680px] lg:h-[min(74vh,790px)]">
      {sotraHeroSlides.slice(0, 3).map((slide, index) => {
        const [headline, subheadline] = String(slide.title || "").split("\n");

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ${
              index === current ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={index !== current}
          >
          <picture className="absolute inset-0">
            <source media="(min-width: 768px)" srcSet={slide.desktopImage || slide.image} />
            <img
              src={slide.image}
              alt={index === current ? slide.title : ""}
              className="h-full w-full object-cover object-center"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </picture>
          <div className="absolute inset-0 bg-black/28" />

          <div className="absolute inset-x-0 top-[50%] z-10 -translate-y-1/2 px-5 text-center text-[#f4efe8]">
            <h1 className="sotra-hero-title mx-auto max-w-[390px] font-serif font-normal leading-none tracking-[0.02em] sm:max-w-[760px]">
              <span className="block text-[43px] sm:text-[76px] lg:text-[88px]">
                {headline}
              </span>
              {subheadline && (
                <span className="mt-2 block text-[35px] leading-[0.96] sm:mt-4 sm:text-[70px] lg:text-[78px]">
                  {subheadline}
                </span>
              )}
            </h1>
            <Link
              to={slide.to}
              className="mt-6 inline-flex min-w-[170px] items-center justify-center rounded-[13px] border-2 border-[#111] bg-white px-6 py-3 font-serif text-[20px] leading-none tracking-[0.04em] text-[#121212] shadow-[0_2px_0_rgba(0,0,0,0.22)] transition hover:bg-[#f7f7f7] sm:mt-8 sm:min-w-[260px] sm:rounded-[18px] sm:px-8 sm:py-5 sm:text-[28px]"
            >
              {slide.buttonLabel}
            </Link>
          </div>
        </div>
        );
      })}
    </section>
  );
};

const CategoryTile = ({ item }) => {
  const label = item.label;

  return (
    <Link to={`/subcategory/${item.slug}`} className="group block">
      <div className="aspect-[0.78/1] overflow-hidden bg-[#f3f3f3]">
        <ShimmerImage
          src={item.image}
          alt={label}
          wrapperClassName="h-full w-full"
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.035]"
          skeletonClassName="bg-[#ededed]"
          loading="lazy"
        />
      </div>
      <h3 className="mt-4 flex items-center gap-1.5 font-serif text-[18px] font-normal leading-none text-[#121212] sm:text-[28px]">
        <span>{label}</span>
        <FiArrowRight
          aria-hidden="true"
          className="h-[18px] w-[18px] stroke-[1.25] transition-transform group-hover:translate-x-1 sm:h-7 sm:w-7"
        />
      </h3>
    </Link>
  );
};

const serviceCards = [
  {
    title: "Support 24/7",
    text: "Our team is available around the clock to assist you with any inquiries.",
    icon: FiHeadphones,
  },
  {
    title: "Premium Quality",
    text: "Crafted with precision using refined fabrics, careful finishing, and lasting comfort.",
    icon: FiPackage,
  },
  {
    title: "Worldwide Shipping",
    text: "Wherever you are, your favorite modest styles are just a few clicks away.",
    icon: FiTruck,
  },
  {
    title: "Modest Clothes",
    text: "Blending style with faith, we create pieces that honor your values and beauty.",
    icon: FiHeart,
  },
];

const ServicePromiseCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <article className="rounded-[6px] border border-black/10 bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(63,52,41,0.04)] sm:px-8 sm:py-12">
      <Icon className="mx-auto h-14 w-14 stroke-[1.45] text-[#ad9a7d]" />
      <h3 className="mt-6 text-[22px] font-bold leading-none text-[#4d4a47] sm:text-[25px]">
        {item.title}
      </h3>
      <p className="mx-auto mt-4 max-w-[360px] text-[16px] leading-7 text-[#69645f] sm:text-[18px] sm:leading-8">
        {item.text}
      </p>
    </article>
  );
};

const HomePromiseSection = () => (
  <section className="bg-white px-4 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12">
    <div className="mx-auto grid max-w-[1180px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {serviceCards.map((item) => (
        <ServicePromiseCard key={item.title} item={item} />
      ))}
    </div>

    <div className="mx-auto mt-16 max-w-[1180px] lg:mt-24">
      <div className="max-w-[780px]">
        <div className="flex items-center gap-5">
          <p className="font-serif text-[26px] font-bold leading-none text-[#ad9a7d] sm:text-[32px]">
            About Our Store
          </p>
          <span className="h-px w-16 bg-[#ad9a7d] sm:w-24" />
        </div>

        <h2 className="mt-5 text-[31px] font-bold leading-tight text-[#4d4a47] sm:text-[42px]">
          Our Promise
        </h2>

        <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#625d58] sm:text-[19px] sm:leading-9">
          <p>
            At SOTRA, we believe that true elegance begins with modesty. Our
            collections are thoughtfully designed for women who seek beauty
            without compromise - where faith, comfort, and timeless style come
            together.
          </p>
          <p>
            Every dress and hijab is carefully selected with premium fabrics,
            refined details, and exceptional craftsmanship to ensure confidence
            in every moment. We are committed to offering modest fashion that
            inspires grace, empowers individuality, and celebrates the beauty of
            dressing with purpose.
          </p>
          <p>
            SOTRA is more than a brand - it is a lifestyle built on elegance,
            modesty, and quality.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="flex items-center gap-5">
            <span className="h-16 w-1.5 bg-[#ad9a7d]" aria-hidden="true" />
            <div>
              <p className="text-[42px] font-light leading-none text-[#ad9a7d]">
                2
              </p>
              <p className="mt-2 text-[14px] font-bold uppercase leading-5 tracking-[0.04em] text-[#5b5753]">
                Years of serving modest fashion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="h-16 w-1.5 bg-[#ad9a7d]" aria-hidden="true" />
            <div>
              <p className="text-[42px] font-light leading-none text-[#ad9a7d]">
                1200
              </p>
              <p className="mt-2 text-[14px] font-bold uppercase leading-5 tracking-[0.04em] text-[#5b5753]">
                Satisfied customers
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/about"
          className="mt-12 inline-flex items-center gap-3 rounded-[6px] border border-[#ad9a7d] px-7 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#4d4a47] transition hover:bg-[#f8f6f2]"
        >
          Learn More
          <FiCheckCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

const SotraHome = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="bg-white text-black">
      <HeroCarousel />

      <section className="px-4 pb-14 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1600px]">
          <SectionTitle>Collections</SectionTitle>
          <div className="mt-7 grid grid-cols-2 gap-x-1.5 gap-y-6 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
            {sotraCategoryTiles.map((item) => (
              <CategoryTile key={item.label} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-14 pt-7 sm:pb-20 sm:pt-12">
        <div className="px-9 sm:px-12 lg:px-16">
          <p className="text-[15px] font-bold uppercase leading-none tracking-[0.26em] text-[#121212] sm:text-[20px]">
            SotraBrand Edit
          </p>
          <Link
            to="/collection"
            className="mt-7 inline-flex items-center gap-3 border-b border-black pb-2 text-[15px] font-bold uppercase leading-none tracking-[0.26em] text-[#121212] sm:text-[20px]"
          >
            See Full Collections
            <FiArrowRight className="h-5 w-5 stroke-[1.7] sm:h-6 sm:w-6" />
          </Link>
        </div>

        <LuxuryVideoGallery />
      </section>

      <HomePromiseSection />
    </main>
  );
};

export default SotraHome;
