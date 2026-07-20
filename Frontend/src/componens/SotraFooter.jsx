import { useContext } from "react";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const footerLinks = [
  { label: "Exchange Policy", to: "/terms" },
  { label: "Contact Us", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "About Us", to: "/about" },
];

const SotraFooter = () => {
  const { siteSettings } = useContext(ShopContext);
  const instagram = siteSettings?.socialLinks?.instagram || "https://www.instagram.com/";
  return (
    <footer className="border-t border-[#e5e5e5] bg-white text-[#121212]">
      <div className="mx-auto max-w-[1600px] px-5 py-9 sm:px-8 lg:px-12">
        <ul className="space-y-2 text-[15px] text-[#121212]/75">
          {footerLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className="hover:text-[#121212] hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="mt-8 inline-grid h-9 w-9 place-items-center text-[20px]"
        >
          <FaInstagram />
        </a>

      </div>

      <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-black/55">
        <p>© {new Date().getFullYear()} SotraBrand. Powered by SotraBrand.</p>
      </div>
    </footer>
  );
};

export default SotraFooter;
