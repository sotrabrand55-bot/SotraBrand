/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { FiChevronDown, FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import { customerPreviewLocked } from "../lib/customerPreview";
import { useContactForm } from "../lib/useContactForm";
import { ShopContext } from "../context/ShopContext";

const footerLinks = {
  account: [
    { label: "Login", to: "/login?mode=login", scrollToTop: true },
    { label: "Sign up", to: "/login?mode=signup", scrollToTop: true },
  ],
  info: [
    { label: "Contact", to: "/contact" },
    { label: "Shipping info", to: "/shippingpolicy" },
  ],
  more: [
    { label: "Terms and Conditions", to: "/terms" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ],
};

const getBrandSocialLinks = (settings = {}) => {
  const socialLinks = settings.socialLinks || {};
  return [
    {
      label: "SotraBrand on Instagram",
      href: socialLinks.instagram || "https://www.instagram.com/",
      icon: FaInstagram,
    },
    {
      label: "SotraBrand on Facebook",
      href: socialLinks.facebook || "https://www.facebook.com/",
      icon: FaFacebookF,
    },
    {
      label: "SotraBrand on TikTok",
      href: socialLinks.tiktok || "https://www.tiktok.com/",
      icon: FaTiktok,
    },
  ].filter((item) => item.href);
};

const SocialLinks = ({ links }) => (
  <div className="mt-4 flex gap-5 text-lg">
    {links.map(({ label, href, icon: Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="transition hover:text-white/60"
      >
        <Icon />
      </a>
    ))}
  </div>
);

const LetsDwebsCredit = () => (
  <a
    href="https://www.instagram.com/letsdwebs/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 text-white/70 transition hover:text-white"
    aria-label="LetsDwebs on Instagram"
  >
    Created by LetsDwebs
    <FaInstagram className="h-3.5 w-3.5" />
  </a>
);

const FooterLebanonSelector = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 text-white/75 transition hover:text-white"
        aria-expanded={open}
      >
        Lebanon (USD $)
        <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute bottom-full left-0 mb-3 min-w-48 border border-white/15 bg-black p-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-between px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em]"
        >
          Lebanon (USD $)
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
};

const LinkList = ({ links }) => (
  <ul className="space-y-3 text-base font-light text-white/80 lg:space-y-2.5 lg:text-sm">
    {links.map((link) => (
      <li key={link.label}>
        <Link
          to={link.to}
          onClick={(event) => {
            if (customerPreviewLocked) {
              event.preventDefault();
              return;
            }
            if (link.scrollToTop) window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="transition hover:text-white"
        >
          {link.label === "Shipping info" ? (
            <>
              <span className="underline underline-offset-4">Shipping</span> info
            </>
          ) : (
            link.label
          )}
        </Link>
      </li>
    ))}
  </ul>
);

const FooterContactForm = () => {
  const { form, status, handleChange, handleSubmit } = useContactForm();
  const fieldClass =
    "w-full border-b border-white/55 bg-transparent py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <input
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        className={fieldClass}
        required
      />
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className={fieldClass}
        required
      />
      <div className="relative">
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="How can we help?"
          rows="2"
          className={`${fieldClass} resize-none pr-10`}
          required
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="absolute bottom-2 right-0 grid h-8 w-8 place-items-center text-white transition hover:text-white/65 disabled:opacity-40"
          aria-label="Send contact message"
        >
          <FiSend className="h-4 w-4" />
        </button>
      </div>

      {status === "sent" && (
        <p className="text-xs text-white/70">Message sent successfully.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-300">Message failed. Please try again.</p>
      )}
    </form>
  );
};

const MobileAccordion = ({ id, title, openId, setOpenId, children }) => {
  const open = openId === id;

  return (
    <section className="border-b border-white/75">
      <button
        type="button"
        onClick={() => setOpenId(open ? "" : id)}
        className="flex w-full items-center justify-between py-5 text-left text-xs font-bold uppercase tracking-[0.24em] text-white"
        aria-expanded={open}
      >
        {title}
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-white transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
          open ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
};

const Footer = () => {
  const [openId, setOpenId] = useState("contact");
  const { siteSettings } = useContext(ShopContext);
  const brandEmail = siteSettings?.brandEmail || siteSettings?.socialLinks?.email || "hello@sotrabrand.com";
  const brandSocialLinks = getBrandSocialLinks(siteSettings);

  return (
    <footer className="w-full bg-black text-white">
      <div className="px-5 pb-8 pt-2 lg:hidden">
        <MobileAccordion id="contact" title="Contact Us" openId={openId} setOpenId={setOpenId}>
          <a
            href={`mailto:${brandEmail}`}
            className="mb-6 inline-block border-b border-white/70 text-lg font-light text-white/85"
          >
            {brandEmail}
          </a>
          <FooterContactForm />
        </MobileAccordion>

        <MobileAccordion id="account" title="My Account" openId={openId} setOpenId={setOpenId}>
          <LinkList links={footerLinks.account} />
        </MobileAccordion>

        <MobileAccordion id="info" title="Info" openId={openId} setOpenId={setOpenId}>
          <LinkList links={footerLinks.info} />
        </MobileAccordion>

        <MobileAccordion id="more" title="More" openId={openId} setOpenId={setOpenId}>
          <LinkList links={footerLinks.more} />
        </MobileAccordion>

        <div className="pt-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            Follow SotraBrand
          </p>
          <SocialLinks links={brandSocialLinks} />

          <div className="mt-8 space-y-3 border-t border-white/75 pt-5 text-xs font-light">
            <FooterLebanonSelector />
            <p className="text-white/60">
              © {new Date().getFullYear()} SOTRABRAND. All rights reserved.
            </p>
            <LetsDwebsCredit />
          </div>
        </div>
      </div>

      <div className="mx-auto hidden max-w-[1500px] px-12 pb-7 pt-16 lg:block xl:px-16">
        <div className="grid grid-cols-[0.9fr_0.9fr_0.9fr_1.25fr_1.55fr] gap-10 xl:gap-16">
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">Contact Us</h2>
            <a
              href={`mailto:${brandEmail}`}
              className="mt-7 inline-block border-b border-white/65 text-sm font-light text-white/85"
            >
              {brandEmail}
            </a>
          </section>

          <section>
            <h2 className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em]">My Account</h2>
            <LinkList links={footerLinks.account} />
          </section>

          <section>
            <h2 className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em]">Info</h2>
            <LinkList links={footerLinks.info} />
          </section>

          <section>
            <h2 className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em]">More</h2>
            <LinkList links={footerLinks.more} />
          </section>

          <section>
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em]">
              Send Us A Message
            </h2>
            <FooterContactForm />

            <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.2em]">
              Follow SotraBrand
            </p>
            <SocialLinks links={brandSocialLinks} />
          </section>
        </div>

        <div className="mt-20 flex items-end justify-between gap-8 text-xs font-light text-white/70">
          <p>© {new Date().getFullYear()} SOTRABRAND. All rights reserved.</p>
          <div className="flex items-end gap-8">
            <LetsDwebsCredit />
            <FooterLebanonSelector />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
