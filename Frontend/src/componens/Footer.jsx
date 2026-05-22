// eslint-disable-next-line no-unused-vars
import React from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import letsdwebsLogo from "../assets/letsdwebs_logo.png";

const Footer = () => {
  return (
    <footer className="mt-8 w-full bg-[#E9DFD3] text-[#2F2F2F]">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C7A96B] to-transparent" />

      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="mx-auto mb-10 flex w-fit items-center gap-4 text-[#c49a5e]">
          <span className="h-px w-16 bg-current" />
          <span className="h-3 w-3 rotate-45 bg-current" />
          <span className="h-px w-16 bg-current" />
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[3fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="mb-5 block font-serif text-3xl tracking-[0.22em] text-[#1f1b17]"
            >
              LEVON
            </Link>
            <p className="max-w-sm text-[#2F2F2F]/80 leading-6">
              Discover refined perfumes, extrait blends, and gift-ready
              fragrance rituals curated with care and quiet elegance.
            </p>

            <div className="mt-5 flex gap-3 text-lg">
              <a
                href="https://www.instagram.com/velor_lb?igsh=bzd4eGV3ZGRsdTcy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#c7a96b]/50 bg-white/45 text-[#2F2F2F] transition hover:bg-[#1f1b17] hover:text-white"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.facebook.com/share/1DSWbsYdzx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#c7a96b]/50 bg-white/45 text-[#2F2F2F] transition hover:bg-[#1f1b17] hover:text-white"
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#1f1b17]">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-[#2F2F2F]/80">
              <li>
                <Link to="/" className="transition hover:text-[#C7A96B]">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition hover:text-[#C7A96B]">
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/shippingpolicy"
                  className="transition hover:text-[#C7A96B]"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-[#C7A96B]">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#1f1b17]">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-[#2F2F2F]/80">
              <li>
                <a
                  href="mailto:levonfragrance@gmail.com"
                  className="flex items-center gap-2 transition hover:text-[#C7A96B]"
                >
                  <FiMail className="text-[#C7A96B]" />
                  levonfragrance@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+96171023261"
                  className="flex items-center gap-2 transition hover:text-[#C7A96B]"
                >
                  <FiPhone className="text-[#C7A96B]" />
                  +961 71 023 261
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2F2F2F]/15" />
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 py-6 text-center text-sm text-[#2F2F2F]/80 md:flex-row md:text-left">
        <p>© {new Date().getFullYear()} LEVON. All Rights Reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>Created by</span>
          <img
            src={letsdwebsLogo}
            alt="LetsDwebs"
            className="h-9 w-9 rounded-sm bg-white object-contain p-1"
            loading="lazy"
          />
          <span className="font-medium text-[#1f1b17]">LetsDwebs</span>
          <a
            href="tel:+96171023261"
            className="font-medium text-[#C7A96B] hover:underline"
          >
            +961 71 023 261
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
