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
  { match: /^\/sotra-home/, eyebrow: "Sotra Studio", title: "Home Studio" },
  { match: /^\/categories/, eyebrow: "Menu", title: "Category Manager" },
  { match: /^\/maintenance/, eyebrow: "Settings", title: "Maintenance" },
  { match: /^\/delivery/, eyebrow: "Settings", title: "Delivery Control" },
  { match: /^\/cuppon/, eyebrow: "Settings", title: "Coupon Control" },
];

const Navbar = ({ setToken }) => {
  const { pathname } = useLocation();
  const page = pageTitles.find((item) => item.match.test(pathname)) || {
    eyebrow: "Sotra Admin",
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
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
            {page.eyebrow}
          </p>
          <h1 className="mt-1 truncate font-serif text-2xl leading-none text-black sm:text-3xl">
            {page.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-none border border-black/15 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-black/55 sm:block">
            Live Backend
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-none border border-black bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
