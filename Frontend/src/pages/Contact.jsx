// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight } from "react-icons/fi";
import contactPanelImage from "../assets/contact_levon_panel.png";
import LevonOrnament from "../componens/LevonOrnament";
import { ShimmerImage } from "../componens/Skeletons";

const Contact = () => {
  const [contactImage, setContactImage] = useState(contactPanelImage);
  const [contactImageAlt, setContactImageAlt] = useState("Levon perfume contact");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    let cancelled = false;
    const loadPageImages = async () => {
      try {
        const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
        const res = await axios.get(`${backendUrl}/api/page-images`);
        if (!cancelled && res.data?.success) {
          setContactImage(res.data.pageImages?.contactImage || contactPanelImage);
          setContactImageAlt(
            res.data.pageImages?.contactImageAlt || "Levon perfume contact"
          );
        }
      } catch (_) {
        if (!cancelled) setContactImage(contactPanelImage);
      }
    };

    loadPageImages();
    return () => {
      cancelled = true;
    };
  }, []);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending...");
    try {
      const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
      await axios.post(`${backendUrl}/api/contact`, form);
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#1f1b17]">
      <section className="px-4 pb-10 pt-8 sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-3 flex w-fit items-center gap-3 text-[#c49a5e]">
              <span className="h-px w-11 bg-current" />
              <span className="h-2.5 w-2.5 rotate-45 bg-current" />
              <span className="h-px w-11 bg-current" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
              Contact Levon
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-[#1f1b17] sm:text-5xl lg:text-6xl">
              How Can We Help?
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#7d6756] sm:text-base">
              We're here for fragrance guidance, orders, and everything in between.
            </p>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-[1.02fr_0.92fr] lg:gap-2">
            <article className="relative overflow-hidden rounded-sm bg-[#1f1b17] shadow-[0_18px_45px_rgba(62,45,28,0.10)]">
              <ShimmerImage
                src={contactImage}
                alt={contactImageAlt}
                className="h-full w-full object-cover"
                wrapperClassName="aspect-[487/459] h-full w-full"
                skeletonClassName="bg-[#E9DFD3]"
                loading="lazy"
                draggable="false"
              />

              <a
                href="mailto:levonfragrance@gmail.com"
                aria-label="Email Levon"
                className="absolute left-[10%] top-[34%] h-[7%] w-[42%] rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#d8b778]"
              />
              <a
                href="https://www.instagram.com/velor_lb/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="absolute left-[10%] top-[46%] h-[9%] w-[9%] rounded-full focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#d8b778]"
              />
              <a
                href="https://www.facebook.com/share/1DSWbsYdzx/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="absolute left-[21%] top-[46%] h-[9%] w-[9%] rounded-full focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#d8b778]"
              />
            </article>

            <article className="rounded-sm border border-[#eadfd2] bg-white/72 px-5 py-7 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="mb-6">
                <div className="mb-2 h-2 w-2 rotate-45 bg-[#c49a5e]" />
                <h2 className="font-serif text-3xl leading-tight text-[#1f1b17] sm:text-4xl">
                  Send Us a Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold text-[#1f1b17]">
                    Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full border border-[#dfd1c1] bg-[#fffaf4]/70 px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-[#1f1b17]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full border border-[#dfd1c1] bg-[#fffaf4]/70 px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-[#1f1b17]">
                    Message
                  </span>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full resize-none border border-[#dfd1c1] bg-[#fffaf4]/70 px-4 py-3 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/18"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1b17] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(31,27,23,0.18)] transition hover:bg-[#c49a5e]"
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                  <FiArrowRight className="h-3.5 w-3.5 text-[#c49a5e]" />
                </button>

                {status === "sent" && (
                  <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Message sent successfully!
                  </p>
                )}
                {status === "error" && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    Failed to send. Try again later.
                  </p>
                )}
              </form>
            </article>
          </div>

          <LevonOrnament className="mt-7" />
        </div>
      </section>
    </main>
  );
};

export default Contact;
