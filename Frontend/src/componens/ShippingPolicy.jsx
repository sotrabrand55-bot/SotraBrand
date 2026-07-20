import { useEffect } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

const socialLinks = [
  {
    label: "SotraBrand Instagram",
    href: "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
    icon: FaInstagram,
  },
  {
    label: "SotraBrand Facebook",
    href: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
    icon: FaFacebookF,
  },
  {
    label: "SotraBrand TikTok",
    href: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
    icon: FaTiktok,
  },
];

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">
          SotraBrand
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Shipping Policy
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-black/65">
          We deliver SotraBrand orders across Lebanon with careful handling so
          your pieces arrive clean, protected, and ready to wear.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
        <article className="rounded-[8px] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(63,52,41,0.04)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">
            Inside Tripoli
          </p>
          <h2 className="mt-3 font-serif text-4xl font-normal">$2</h2>
          <p className="mt-4 text-sm leading-7 text-black/60">
            Delivery inside Tripoli is $2. Select the Tripoli delivery option
            at checkout and the total will update before placing the order.
          </p>
        </article>
        <article className="rounded-[8px] border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(63,52,41,0.04)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">
            All Across Lebanon
          </p>
          <h2 className="mt-3 font-serif text-4xl font-normal">$5</h2>
          <p className="mt-4 text-sm leading-7 text-black/60">
            Delivery all across Lebanon is $5 for every other city and area,
            depending on courier coverage and route timing.
          </p>
        </article>
      </section>

      <section className="mx-auto mt-10 max-w-3xl border-y border-black/20 py-8">
        <div className="space-y-6 text-sm font-light leading-8 text-black/65">
          <p>
            Orders are prepared with care after confirmation. If we need extra
            information about your address or delivery timing, we may contact
            you before dispatch.
          </p>
          <p>
            Delivery times can shift slightly during holidays, weather changes,
            high-demand days, or circumstances outside our control. Delivery
            fees are shown at checkout before the order is submitted.
          </p>
          <p>
            Please make sure your phone number and delivery address are correct
            so the courier can reach you smoothly.
          </p>
        </div>
      </section>

      <div className="mt-10 flex justify-center gap-6 text-xl">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-black/55"
            aria-label={label}
          >
            <Icon />
          </a>
        ))}
      </div>
    </main>
  );
};

export default ShippingPolicy;
