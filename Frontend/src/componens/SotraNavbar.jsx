/* eslint-disable react/prop-types */
import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiArrowRight,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { ShopContext } from "../context/ShopContext";
import { sotraCategoryTiles, sotraCollections } from "../lib/mockData";
import sotraLogo from "../assets/sotraBrand/Logo_Sotra_wordmark.png";

const shopLinks = sotraCategoryTiles.map((item) => ({
  label: item.label,
  to: `/subcategory/${item.slug}`,
}));

const collectionLinks = sotraCollections.map((label) => ({
  label,
  to: `/collection?conc=${encodeURIComponent(label)}`,
}));

const desktopNav = [
  { label: "Home", to: "/" },
  { label: "Shop", children: shopLinks },
  { label: "Collections", children: collectionLinks },
  { label: "On Sale", to: "/on-sale" },
];

const NAV_HEIGHT_FALLBACK = 58;
const sotraSocialFallbacks = {
  instagram:
    "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
  tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
  facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
  whatsapp: "https://wa.me/96171872919",
};

const BrandLogo = ({ compact = false }) => (
  <Link
    to="/"
    className="flex items-center justify-center"
    aria-label="SotraBrand home"
  >
    <span
      className={`sotra-navbar-logo-frame transition-[height,width] duration-300 ease-out ${
        compact
          ? "h-[42px] w-[132px] sm:h-[50px] sm:w-[170px]"
          : "h-[48px] w-[154px] sm:h-[58px] sm:w-[198px]"
      }`}
    >
      <img src={sotraLogo} alt="SotraBrand" className="sotra-navbar-logo" />
    </span>
  </Link>
);

const AnnouncementBar = ({ items = [] }) => {
  const safeItems = items.length
    ? items
    : ["Welcome to our store", "Cash On Delivery", "Tripoli Delivery Only $2"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (safeItems.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setCurrent((value) => (value + 1) % safeItems.length);
    }, 2600);
    return () => window.clearInterval(interval);
  }, [safeItems.length]);

  const step = (direction) => {
    setCurrent((value) => (value + direction + safeItems.length) % safeItems.length);
  };

  return (
    <div className="grid h-[42px] grid-cols-[48px_1fr_48px] items-center bg-[#111111] text-white sm:h-[70px] sm:grid-cols-[64px_1fr_64px]">
      <button
        type="button"
        onClick={() => step(-1)}
        className="grid h-full place-items-center text-white/80 transition hover:text-white"
        aria-label="Previous announcement"
      >
        <FiChevronLeft className="h-[18px] w-[18px] stroke-[1.4] sm:h-5 sm:w-5" />
      </button>

      <div className="grid h-full place-items-center overflow-hidden">
        <p
          key={current}
          className="sotra-announcement-message whitespace-nowrap px-2 text-center font-serif text-[14px] font-normal tracking-[0.05em] sm:text-[20px]"
        >
          {safeItems[current]}
        </p>
      </div>

      <button
        type="button"
        onClick={() => step(1)}
        className="grid h-full place-items-center text-white/80 transition hover:text-white"
        aria-label="Next announcement"
      >
        <FiChevronRight className="h-[18px] w-[18px] stroke-[1.4] sm:h-5 sm:w-5" />
      </button>
    </div>
  );
};

const Dropdown = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex h-full items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex h-full items-center gap-1 px-3 py-4 text-[15px] underline-offset-4 hover:underline"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        {label}
        <FiChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute left-0 top-full z-50 min-w-44 border border-[#e5e5e5] bg-white py-2 shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {children.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            onClick={() => setOpen(false)}
            className="block px-5 py-2.5 text-[15px] text-[#121212]/75 hover:text-[#121212] hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

const SotraNavbar = () => {
  const {
    getCartCount,
    navigate,
    openCart,
    setShowSearch,
    siteSettings,
    token,
  } = useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [searchAnimating, setSearchAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navTop, setNavTop] = useState(0);
  const [navHeight, setNavHeight] = useState(0);
  const announcementRef = useRef(null);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setMobileShopOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const announcementHeight = announcementRef.current?.offsetHeight || 0;
        const headerHeight = navRef.current?.offsetHeight || 0;

        setScrolled(window.scrollY > 20);
        setNavTop(Math.max(0, announcementHeight - window.scrollY));
        setNavHeight(headerHeight);
      });
    };

    updateHeader();
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeader)
        : null;

    if (resizeObserver) {
      if (announcementRef.current) resizeObserver.observe(announcementRef.current);
      if (navRef.current) resizeObserver.observe(navRef.current);
    }

    document.fonts?.ready?.then(updateHeader);
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  const search = () => {
    setSearchAnimating(true);
    window.setTimeout(() => setSearchAnimating(false), 420);
    navigate("/collection");
    setShowSearch(true);
  };

  const handleMenuToggle = () => {
    setOpen((current) => !current);
  };

  const closeMenu = () => {
    setOpen(false);
    setMobileShopOpen(false);
  };

  const socialLinks = siteSettings?.socialLinks || {};
  const whatsappHref = socialLinks.whatsapp || sotraSocialFallbacks.whatsapp;

  return (
    <>
      <div ref={announcementRef} className="relative z-40 bg-white text-[#121212]">
        <AnnouncementBar items={siteSettings?.announcementItems || []} />
      </div>

      <header
        ref={navRef}
        className={`fixed left-0 right-0 z-50 border-b border-[#e5e5e5] bg-white px-5 text-[#121212] shadow-[0_1px_0_rgba(0,0,0,0.08)] transition-[padding] duration-300 ease-out sm:px-7 lg:px-12 ${
          scrolled ? "py-1.5 sm:py-4 lg:py-5" : "py-2.5 sm:py-6 lg:py-7"
        }`}
        style={{ top: `${navTop}px` }}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center lg:hidden"
            onClick={handleMenuToggle}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <FiMenu
              className={`h-[25px] w-[25px] stroke-[1.22] transition-transform duration-300 ease-out ${
                open ? "rotate-90 scale-95" : "rotate-0 scale-100"
              }`}
            />
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {desktopNav.map((item) =>
              item.children ? (
                <Dropdown key={item.label} label={item.label}>
                  {item.children}
                </Dropdown>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className="px-3 py-4 text-[15px] underline-offset-4 hover:underline"
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <BrandLogo compact={scrolled} />

          <div className="flex items-center justify-end gap-3 text-[15px] sm:gap-7">
            <button
              type="button"
              onClick={search}
              className="grid h-9 w-9 place-items-center sm:h-10 sm:w-10"
              aria-label="Search"
            >
              <FiSearch
                className={`h-[24px] w-[24px] stroke-[1.25] sm:h-8 sm:w-8 ${
                  searchAnimating ? "sotra-search-click" : ""
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => navigate(token ? "/orders" : "/login?mode=login")}
              className="hidden hover:underline sm:inline"
              aria-label={token ? "Account orders" : "Log in"}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative grid h-9 w-9 place-items-center sm:h-10 sm:w-10"
              aria-label="Cart"
            >
              <FiShoppingBag className="h-[24px] w-[24px] stroke-[1.25] sm:h-8 sm:w-8" />
              {getCartCount() > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#111] px-1 text-[10px] text-white">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <div aria-hidden="true" style={{ height: `${navHeight || NAV_HEIGHT_FALLBACK}px` }} />

      <div className={`fixed inset-0 z-[999] lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          className={`absolute inset-0 bg-black/20 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={closeMenu}
          aria-label="Close menu backdrop"
        />
        <aside
          className={`absolute left-0 top-0 flex h-[100dvh] w-[92vw] max-w-[520px] flex-col bg-white text-[#121212] shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="grid grid-cols-[48px_1fr_96px] items-center border-b border-[#e5e5e5] px-4 py-5">
            <button
              type="button"
              onClick={closeMenu}
              className="grid h-10 w-10 place-items-center"
              aria-label="Close menu"
            >
              <FiX className="h-8 w-8 stroke-[1.15]" />
            </button>

            <div className="justify-self-center">
              <BrandLogo compact />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  search();
                }}
                className="grid h-10 w-10 place-items-center"
                aria-label="Search"
              >
                <FiSearch className="h-[24px] w-[24px] stroke-[1.25]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  openCart();
                }}
                className="relative grid h-10 w-10 place-items-center"
                aria-label="Cart"
              >
                <FiShoppingBag className="h-[24px] w-[24px] stroke-[1.25]" />
                {getCartCount() > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#111] px-1 text-[10px] text-white">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <nav className="font-serif text-[26px] leading-none">
            <Link to="/" className="block bg-[#f6f6f6] px-8 py-6">
              Home
            </Link>

            <button
              type="button"
              onClick={() => setMobileShopOpen((current) => !current)}
              className="flex w-full items-center justify-between px-8 py-5 text-left"
              aria-expanded={mobileShopOpen}
            >
              <span>Shop</span>
              <FiArrowRight className={`h-6 w-6 stroke-[1.2] transition-transform ${mobileShopOpen ? "rotate-90" : ""}`} />
            </button>

            <div
              className={`grid overflow-hidden border-y border-[#eeeeee] bg-[#fbfbfb] transition-[grid-template-rows] duration-300 ${
                mobileShopOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0">
                <div className="grid gap-4 px-8 py-5 font-sans text-[18px] leading-none">
                {shopLinks.map((item) => (
                  <Link key={item.label} to={item.to}>
                    {item.label}
                  </Link>
                ))}
                </div>
              </div>
            </div>

            <Link to="/collection" className="flex items-center justify-between px-8 py-5">
              <span>Collections</span>
              <FiArrowRight className="h-6 w-6 stroke-[1.2]" />
            </Link>
            <Link to="/on-sale" className="block px-8 py-5">
              On Sale
            </Link>
            <Link to="/About" className="block px-8 py-5">
              About Us
            </Link>
            <Link to="/Contact" className="block px-8 py-5">
              Contact Us
            </Link>
          </nav>
          </div>

          <div className="border-t border-[#eeeeee] bg-[#f7f7f7] px-8 py-6">
            <Link to="/login?mode=login" className="inline-flex items-center gap-4 font-serif text-[20px]">
              <FiUser className="h-7 w-7 stroke-[1.2]" />
              <span>Log in</span>
            </Link>

            <div className="mt-7 flex items-center gap-7">
              <a
                href={socialLinks.instagram || sotraSocialFallbacks.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-[#121212]"
              >
                <FaInstagram className="h-7 w-7" />
              </a>
              <a
                href={socialLinks.tiktok || sotraSocialFallbacks.tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="text-[#121212]"
              >
                <FaTiktok className="h-6 w-6" />
              </a>
              <a
                href={socialLinks.facebook || sotraSocialFallbacks.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-[#121212]"
              >
                <FaFacebookF className="h-6 w-6" />
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="text-[#121212]"
              >
                <FaWhatsapp className="h-7 w-7" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SotraNavbar;
