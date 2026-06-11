import { useEffect } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

const ShippingPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/45">
          Be Radiant By Nancy
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Shipping Info
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-black/65">
          We deliver Be Radiant By Nancy orders across Lebanon with careful
          handling so your skincare and fragrance ritual arrives beautifully.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
        <article className="border border-black/15 bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">
            Beirut
          </p>
          <h2 className="mt-3 text-3xl font-light">2 days</h2>
          <p className="mt-4 text-sm leading-7 text-black/60">
            Delivery inside Beirut usually takes around two business days after
            the order is confirmed.
          </p>
        </article>
        <article className="border border-black/15 bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/45">
            Outside Beirut
          </p>
          <h2 className="mt-3 text-3xl font-light">3 days</h2>
          <p className="mt-4 text-sm leading-7 text-black/60">
            Delivery outside Beirut usually takes around three business days,
            depending on the area and courier route.
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
            high-demand days, or circumstances outside our control. Shipping
            fees, when applicable, are shown at checkout before the order is
            submitted.
          </p>
          <p>
            Please make sure your phone number and delivery address are correct
            so the courier can reach you smoothly.
          </p>
        </div>
      </section>

      <div className="mt-10 flex justify-center gap-6 text-xl">
        <a
          href="https://www.instagram.com/radiant_bynancy?igsh=MWY3YmwxcjNyYTNjcg=="
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-black/55"
          aria-label="Be Radiant by Nancy Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href="https://www.facebook.com/share/18oAYDyvZt/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-black/55"
          aria-label="Be Radiant by Nancy Facebook"
        >
          <FaFacebookF />
        </a>
        <a
          href="https://www.tiktok.com/@radiant.nancy?_r=1&_t=ZS-96qoZYlR9xF"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-black/55"
          aria-label="Be Radiant by Nancy TikTok"
        >
          <FaTiktok />
        </a>
      </div>
    </main>
  );
};

export default ShippingPolicy;
