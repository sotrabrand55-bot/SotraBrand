import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";

const pageTitles = [
  { match: /^\/dashboard|^\/$/, eyebrow: "Overview", title: "Dashboard" },
  { match: /^\/products/, eyebrow: "Product Manager", title: "Products" },
  { match: /^\/edit/, eyebrow: "Product Manager", title: "Edit Product" },
  { match: /^\/add$/, eyebrow: "Product Manager", title: "Add Product" },
  { match: /^\/orders/, eyebrow: "Orders", title: "Order Control" },
  { match: /^\/header-slides/, eyebrow: "Homepage", title: "Hero Header" },
  { match: /^\/gift-sets/, eyebrow: "Homepage", title: "Gift Sets" },
  { match: /^\/scent-wardrobe/, eyebrow: "Homepage", title: "Choose Your Mood" },
  { match: /^\/brand-statement/, eyebrow: "Homepage", title: "Proudly Made" },
  { match: /^\/page-images/, eyebrow: "Pages", title: "About + Contact Images" },
  { match: /^\/subcat-tiles/, eyebrow: "Homepage", title: "Subcategory Tiles" },
  { match: /^\/maintenance/, eyebrow: "Settings", title: "Maintenance" },
  { match: /^\/delivery/, eyebrow: "Settings", title: "Delivery Control" },
  { match: /^\/cuppon/, eyebrow: "Settings", title: "Coupon Control" },
];

const Navbar = ({ setToken }) => {
  const { pathname } = useLocation();
  const page = pageTitles.find((item) => item.match.test(pathname)) || {
    eyebrow: "Levon Admin",
    title: "Control Panel",
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/admin/logout`);
    } catch {
      // keep local logout responsive even if the API is unreachable
    }
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfd2] bg-[#fffaf4]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            {page.eyebrow}
          </p>
          <h1 className="mt-1 truncate font-serif text-2xl leading-none text-[#1f1b17] sm:text-3xl">
            {page.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-[#eadfd2] bg-[#fffdf9] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d6756] sm:block">
            Live Backend
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#d8c2a5] bg-[#fffdf9] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#1f1b17] hover:bg-[#1f1b17] hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
