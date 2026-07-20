import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiMail, FiPhone } from "react-icons/fi";
import contactImageFallback from "../assets/sotraBrand/Header_2.jpeg";
import { ShimmerImage } from "../componens/Skeletons";
import { useMockData } from "../lib/mockData";
import { useContactForm } from "../lib/useContactForm";
import { ShopContext } from "../context/ShopContext";

const Contact = () => {
  const { siteSettings } = useContext(ShopContext);
  const [contactImage, setContactImage] = useState(contactImageFallback);
  const [contactImageAlt, setContactImageAlt] = useState("SotraBrand contact");
  const { form, status, handleChange, handleSubmit } = useContactForm();
  const socialLinks = siteSettings?.socialLinks || {};
  const contactEmail = siteSettings?.brandEmail || socialLinks.email || "Serinachendeb133@gmail.com";
  const contactPhone = siteSettings?.brandPhone || socialLinks.phone || "71872919";
  const socials = useMemo(
    () => [
      {
        label: "SotraBrand on Instagram",
        href:
          socialLinks.instagram ||
          "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
        icon: FaInstagram,
      },
      {
        label: "SotraBrand on TikTok",
        href: socialLinks.tiktok || "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
        icon: FaTiktok,
      },
      {
        label: "SotraBrand on Facebook",
        href: socialLinks.facebook || "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
        icon: FaFacebookF,
      },
      {
        label: "SotraBrand on WhatsApp",
        href: socialLinks.whatsapp || "https://wa.me/96171872919",
        icon: FaWhatsapp,
      },
    ],
    [socialLinks.facebook, socialLinks.instagram, socialLinks.tiktok, socialLinks.whatsapp]
  );

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
        const res = await axios.get(`${backendUrl}/api/page-images`);
        if (!cancelled && res.data?.success) {
          setContactImage(res.data.pageImages?.contactImage || contactImageFallback);
          setContactImageAlt(
            res.data.pageImages?.contactImageAlt || "SotraBrand contact"
          );
        }
      } catch {
        if (!cancelled) setContactImage(contactImageFallback);
      }
    };

    loadPageImages();
    return () => {
      cancelled = true;
    };
  }, []);

  const fieldClass =
    "mt-2 w-full border border-black/20 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black";

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1280px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/45">
              SotraBrand
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-none sm:text-6xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-black/55 sm:text-base">
              We are here for product questions, order support, and every detail in between.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <article className="overflow-hidden bg-white">
              <ShimmerImage
                src={contactImage}
                alt={contactImageAlt}
                className="h-full w-full object-cover"
                wrapperClassName="aspect-[4/5] h-full w-full md:aspect-[5/4]"
                skeletonClassName="nancy-cool-shimmer bg-[#EAEAEA]"
                loading="lazy"
                draggable="false"
              />
            </article>

            <article className="border border-black/15 bg-white px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="mb-7">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/45">
                  Send A Message
                </p>
                <h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-4xl">
                  How can we help?
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/55">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className={`${fieldClass} resize-none`}
                  />
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex h-14 w-full items-center justify-center gap-3 bg-black px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#222]"
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                  <FiArrowRight className="h-4 w-4" />
                </button>

                {status === "sent" && (
                  <p className="border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Message sent successfully!
                  </p>
                )}
                {status === "error" && (
                  <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    Failed to send. Try again later.
                  </p>
                )}
              </form>

              <div className="mt-8 border-t border-black/15 pt-6">
                <div className="space-y-4">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-3 border-b border-black pb-1 text-sm text-black"
                  >
                    <FiMail className="h-4 w-4" />
                    {contactEmail}
                  </a>
                  <br />
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex items-center gap-3 border-b border-black pb-1 text-sm text-black"
                  >
                    <FiPhone className="h-4 w-4" />
                    {contactPhone}
                  </a>
                </div>

                <div className="mt-6 flex items-center gap-5 text-xl">
                  {socials.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="transition hover:text-black/50"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
