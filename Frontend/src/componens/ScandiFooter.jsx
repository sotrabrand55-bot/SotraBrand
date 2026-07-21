import { useContext } from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import sotraLogo from "../assets/sotraBrand/Logo_Sotra.jpeg";

const footerLinks = [
  { label: "Exchange Policy", to: "/terms" },
  { label: "Shipping Policy", to: "/shippingpolicy" },
  { label: "Contact Us", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "About Us", to: "/about" },
];

const sotraSocialFallbacks = {
  instagram:
    "https://www.instagram.com/sotra_brand_hijab?igsh=MWZiNzdkM3BuZnVndA%3D%3D&utm_source=qr",
  tiktok: "https://www.tiktok.com/@sotrabrand133?_r=1&_t=ZS-98BbAHXPjTc",
  facebook: "https://www.facebook.com/share/1Cnd12KNGw/?mibextid=wwXIfr",
  whatsapp: "https://wa.me/96171872919",
};

const ScandiFooter = () => {
  const { siteSettings } = useContext(ShopContext);
  const socialLinks = siteSettings?.socialLinks || {};
  const email = siteSettings?.brandEmail || socialLinks.email || "sotrabrand7@gmail.com";
  const phone = siteSettings?.brandPhone || socialLinks.phone || "71872919";
  const socials = [
    {
      label: "Instagram",
      href: socialLinks.instagram || sotraSocialFallbacks.instagram,
      icon: FaInstagram,
    },
    {
      label: "TikTok",
      href: socialLinks.tiktok || sotraSocialFallbacks.tiktok,
      icon: FaTiktok,
    },
    {
      label: "Facebook",
      href: socialLinks.facebook || sotraSocialFallbacks.facebook,
      icon: FaFacebookF,
    },
    {
      label: "WhatsApp",
      href: socialLinks.whatsapp || sotraSocialFallbacks.whatsapp,
      icon: FaWhatsapp,
    },
  ];

  return (
    <footer className="border-t border-[#e5e5e5] bg-white text-[#121212]">
      <div className="mx-auto max-w-[1600px] px-5 py-9 sm:px-8 lg:px-12">
        <img src={sotraLogo} alt="SotraBrand" className="mb-8 h-16 w-auto object-contain" />

        <ul className="space-y-2 text-[15px] text-[#121212]/75">
          {footerLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className="hover:text-[#121212] hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3 text-[15px] text-[#121212]/75">
          <a href={`tel:${phone}`} className="flex items-center gap-3 hover:text-[#121212] hover:underline">
            <FiPhone className="h-4 w-4" />
            {phone}
          </a>
          <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-[#121212] hover:underline">
            <FiMail className="h-4 w-4" />
            {email}
          </a>
        </div>

        <div className="mt-8 flex items-center gap-5 text-[20px]">
          {socials.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`SotraBrand ${label}`}
              className="inline-grid h-9 w-9 place-items-center transition hover:text-[#121212]/55"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div className="px-5 pb-7 text-center text-[13px] text-[#121212]/70">
        <p>&copy; {new Date().getFullYear()}, SotraBrand</p>
        <a
          href="https://www.instagram.com/letsdweb?igsh=MzE5NWJ2NnN5eW8w"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-2 hover:text-[#121212] hover:underline"
          aria-label="LetsDwebs on Instagram"
        >
          <FaInstagram className="h-3.5 w-3.5" />
          Created by LetsDwebs
        </a>
      </div>
    </footer>
  );
};

export default ScandiFooter;
