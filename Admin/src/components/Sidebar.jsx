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
    label: "Sotra Studio",
    items: [
      { to: "/sotra-home", label: "Home Studio", icon: "HS" },
      { to: "/categories", label: "Categories", icon: "CA" },
      { to: "/page-images", label: "Page Images", icon: "PI" },
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
    <aside className="sticky top-0 hidden h-screen w-[84px] shrink-0 border-r border-black/10 bg-white px-3 py-5 shadow-[12px_0_34px_rgba(0,0,0,0.04)] md:block xl:w-[282px]">
      <div className="mb-7 border-b border-black/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-none bg-black font-serif text-lg text-white">
            S
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="font-serif text-2xl leading-none tracking-[0.12em] text-black">
              SOTRA
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#ad9a7d]">
              Modesty Admin
            </p>
          </div>
        </div>
      </div>

      <nav className="h-[calc(100vh-124px)] overflow-y-auto pr-1 no-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45 xl:block">
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
                        ? "border-black bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
                        : "border-transparent text-black/60 hover:border-black/20 hover:bg-[#f5f5f5] hover:text-black"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border text-[10px] font-bold tracking-[0.12em] transition ${
                          isActive
                            ? "border-white/30 bg-white text-black"
                            : "border-black/10 bg-white text-black/45 group-hover:border-black/30 group-hover:text-black"
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
