import React from "react";
import { NavLink } from "react-router-dom";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "DB" },
      { to: "/orders", label: "Orders", icon: "OR" },
    ],
  },
  {
    label: "Products",
    items: [
      { to: "/products", label: "Products", icon: "PR" },
      { to: "/add", label: "Add Product", icon: "AD" },
    ],
  },
  {
    label: "Homepage",
    items: [
      { to: "/header-slides", label: "Hero Header", icon: "HH" },
      { to: "/gift-sets", label: "Gift Sets", icon: "GS" },
      { to: "/scent-wardrobe", label: "Choose Mood", icon: "CM" },
      { to: "/brand-statement", label: "Proudly Made", icon: "PM" },
      { to: "/page-images", label: "Page Images", icon: "PI" },
      { to: "/subcat-tiles", label: "Subcategory Tiles", icon: "ST" },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/maintenance", label: "Maintenance", icon: "MT" },
      { to: "/delivery", label: "Delivery Control", icon: "DL" },
      { to: "/cuppon", label: "Coupon Control", icon: "CP" },
    ],
  },
];

const Sidebar = () => {
  return (
    <aside className="sticky top-0 hidden h-screen w-[84px] shrink-0 border-r border-[#eadfd2] bg-[#fffaf4] px-3 py-5 shadow-[12px_0_34px_rgba(62,45,28,0.05)] md:block xl:w-[282px]">
      <div className="mb-7 border-b border-[#eadfd2] pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#1f1b17] font-serif text-lg text-[#d8b778]">
            L
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="font-serif text-2xl leading-none tracking-[0.18em] text-[#1f1b17]">
              LEVON
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="h-[calc(100vh-124px)] overflow-y-auto pr-1 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b9945d] xl:block">
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) =>
                    `group flex items-center justify-center gap-3 rounded-md border px-2 py-2.5 text-sm font-semibold transition xl:justify-start xl:px-3 ${
                      isActive
                        ? "border-[#1f1b17] bg-[#1f1b17] text-white shadow-[0_14px_30px_rgba(31,27,23,0.16)]"
                        : "border-transparent text-[#6f5844] hover:border-[#d8c2a5] hover:bg-[#fffdf9] hover:text-[#1f1b17]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border text-[10px] font-bold tracking-[0.12em] transition ${
                          isActive
                            ? "border-[#d8b778]/35 bg-[#d8b778] text-[#1f1b17]"
                            : "border-[#eadfd2] bg-[#fffdf9] text-[#9a8068] group-hover:border-[#c49a5e] group-hover:text-[#1f1b17]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="hidden truncate xl:block">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
