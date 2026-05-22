/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiChevronDown, FiFilter, FiSliders, FiX } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../componens/ProductItem";
import SearchBar from "../componens/SearchBar";
import { CollectionGridSkeleton } from "../componens/Skeletons";
import { getEffectiveProductPrice } from "../utils/productMapping";
import { motion, AnimatePresence } from "framer-motion";

const categoryOptions = ["Fragrance", "Gift Sets", "For Her", "For Him"];
const defaultTypeOptions = ["Amber", "Floral", "Fresh", "Woods", "Oud", "Musk", "Citrus"];
const concentrationOptions = ["Eau de Parfum", "Eau de Toilette"];
const lowStockLimit = 5;

const getStockCount = (item) => {
  if (item?.stock === undefined || item?.stock === null || item?.stock === "") {
    return null;
  }
  const value = Number(item?.stock);
  return Number.isFinite(value) ? value : null;
};

const getConcentration = (item) =>
  String(item?.concentration || "").trim();

const Collection = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { products, productsLoading, search, showSearch, scentFamilies } = useContext(ShopContext);
  const typeOptions =
    Array.isArray(scentFamilies) && scentFamilies.length
      ? scentFamilies
      : defaultTypeOptions;

  // UI + filters state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterProduct, setFilterProduct] = useState([]);
  // committed (applied) filters
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [concentration, setConcentration] = useState([]);
  const [sortType, setSortType] = useState("relevent");

  // special flags (committed)
  const [specialFlags, setSpecialFlags] = useState({
    newArrival: false,
    onSales: false,
  });
  const [stockFlags, setStockFlags] = useState({
    inStock: false,
    lowStock: false,
    outOfStock: false,
  });

  // temp selection inside panel (staged until Apply)
  const [tempCategory, setTempCategory] = useState([]);
  const [tempSubCategory, setTempSubCategory] = useState([]);
  const [tempConcentration, setTempConcentration] = useState([]);
  const [tempSpecialFlags, setTempSpecialFlags] = useState({
    newArrival: false,
    onSales: false,
  });
  const [tempStockFlags, setTempStockFlags] = useState({
    inStock: false,
    lowStock: false,
    outOfStock: false,
  });

  // collapsible sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    type: true,
    concentration: true,
    special: true,
    availability: true,
  });

  // bootstrap URL/state params
  const location = useLocation();
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // staged toggles (operate on temp arrays)
  const toggleTempCategory = (val) =>
    setTempCategory((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  const toggleTempSubCategory = (val) =>
    setTempSubCategory((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  const toggleTempConcentration = (val) =>
    setTempConcentration((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  const toggleTempNewArrival = () =>
    setTempSpecialFlags((p) => ({ ...p, newArrival: !p.newArrival }));

  const toggleTempOnSales = () =>
    setTempSpecialFlags((p) => ({ ...p, onSales: !p.onSales }));

  const toggleTempStockFlag = (key) =>
    setTempStockFlags((p) => ({ ...p, [key]: !p[key] }));

  // commit staged -> applied
  const applyFilters = () => {
    setCategory([...tempCategory]);
    setSubCategory([...tempSubCategory]);
    setConcentration([...tempConcentration]);
    setSpecialFlags({ ...tempSpecialFlags });
    setStockFlags({ ...tempStockFlags });
    setShowFilterPanel(false);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setTempCategory([]);
    setTempSubCategory([]);
    setTempConcentration([]);
    setTempSpecialFlags({ newArrival: false, onSales: false });
    setTempStockFlags({ inStock: false, lowStock: false, outOfStock: false });
  };

  const clearAll = () => {
    setTempCategory([]);
    setTempSubCategory([]);
    setTempConcentration([]);
    setTempSpecialFlags({ newArrival: false, onSales: false });
    setTempStockFlags({ inStock: false, lowStock: false, outOfStock: false });
    // also clear committed
    setCategory([]);
    setSubCategory([]);
    setConcentration([]);
    setSpecialFlags({ newArrival: false, onSales: false });
    setStockFlags({ inStock: false, lowStock: false, outOfStock: false });
    setShowFilterPanel(false);
    setCurrentPage(1);
  };

  // Sync filters from URL or Link state so homepage category links auto-select here.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromState = location.state || {};

    const catParam = params.get("cat") || fromState.cat;
    let nextCategory = [];
    if (catParam) {
      nextCategory = catParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setCategory(nextCategory);
    setTempCategory(nextCategory);

    const subParam = params.get("sub") || fromState.sub;
    let nextSubCategory = [];
    if (subParam) {
      nextSubCategory = subParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setSubCategory(nextSubCategory);
    setTempSubCategory(nextSubCategory);

    const concParam = params.get("conc") || params.get("concentration") || fromState.conc || fromState.concentration;
    let nextConcentration = [];
    if (concParam) {
      nextConcentration = concParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    setConcentration(nextConcentration);
    setTempConcentration(nextConcentration);

    const specialParam = params.get("special") || fromState.special;
    let nextFlags = { newArrival: false, onSales: false };
    if (specialParam) {
      const parts = specialParam.split(",").map((s) => s.trim().toLowerCase());
      nextFlags = {
        newArrival: parts.includes("newarrival") || parts.includes("new"),
        onSales:
          parts.includes("onsales") ||
          parts.includes("sale") ||
          parts.includes("onsale"),
      };
    }
    setSpecialFlags(nextFlags);
    setTempSpecialFlags(nextFlags);

    const stockParam = params.get("stock") || fromState.stock;
    let nextStockFlags = { inStock: false, lowStock: false, outOfStock: false };
    if (stockParam) {
      const parts = stockParam.split(",").map((s) => s.trim().toLowerCase());
      nextStockFlags = {
        inStock: parts.includes("instock") || parts.includes("in-stock"),
        lowStock: parts.includes("lowstock") || parts.includes("low-stock"),
        outOfStock:
          parts.includes("outofstock") ||
          parts.includes("out-of-stock") ||
          parts.includes("oos"),
      };
    }
    setStockFlags(nextStockFlags);
    setTempStockFlags(nextStockFlags);
    setCurrentPage(1);
  }, [location.search, location.state]);

  // Filter logic (applied filters)
  const applyFilterLogic = () => {
    let productsCopy = [...(products || [])];

    // search (if search overlay in use)
    if (showSearch && search?.trim() !== "") {
      const term = search.trim().toLowerCase().replace(/\s+/g, "");
      productsCopy = productsCopy.filter((item) =>
        (item.name || "").toLowerCase().replace(/\s+/g, "").includes(term)
      );
    }

    // category
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category) || category.includes(item.subCategory)
      );
    }

    // subCategory
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    if (concentration.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        concentration.includes(getConcentration(item))
      );
    }

    // flags
    if (specialFlags.newArrival && !specialFlags.onSales) {
      productsCopy = productsCopy.filter((i) => i.newArrival);
    } else if (!specialFlags.newArrival && specialFlags.onSales) {
      productsCopy = productsCopy.filter((i) => i.onSales);
    } else if (specialFlags.newArrival && specialFlags.onSales) {
      productsCopy = productsCopy.filter((i) => i.newArrival || i.onSales);
    }

    if (stockFlags.inStock || stockFlags.lowStock || stockFlags.outOfStock) {
      productsCopy = productsCopy.filter((item) => {
        const stock = getStockCount(item);
        const soldOut = Boolean(item.outOfStock) || (stock !== null && stock <= 0);
        const lowStock = !soldOut && stock !== null && stock <= lowStockLimit;
        const inStock = !soldOut && (stock === null || stock > 0);

        return (
          (stockFlags.inStock && inStock) ||
          (stockFlags.lowStock && lowStock) ||
          (stockFlags.outOfStock && soldOut)
        );
      });
    }

    setFilterProduct(productsCopy);
  };

  // Sort logic (applied to filtered list)
  const sortProduct = () => {
    const list = [...filterProduct];
    switch (sortType) {
      case "low-high":
        list.sort((a, b) => getEffectiveProductPrice(a) - getEffectiveProductPrice(b));
        setFilterProduct(list);
        break;
      case "high-low":
        list.sort((a, b) => getEffectiveProductPrice(b) - getEffectiveProductPrice(a));
        setFilterProduct(list);
        break;
      default:
        applyFilterLogic();
        break;
    }
  };

  useEffect(() => {
    sortProduct();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]); // sortType only

  useEffect(() => {
    applyFilterLogic();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, concentration, products, specialFlags, stockFlags, showSearch, search]);

  useEffect(() => {
    setFilterProduct(products || []);
  }, [products]);

  // Pagination math
  const totalPages = Math.max(
    1,
    Math.ceil(filterProduct.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleProducts = filterProduct.slice(startIndex, endIndex);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // open panel: copy committed filters into temp
  const openPanel = () => {
    setTempCategory([...category]);
    setTempSubCategory([...subCategory]);
    setTempConcentration([...concentration]);
    setTempSpecialFlags({ ...specialFlags });
    setTempStockFlags({ ...stockFlags });
    setShowFilterPanel(true);
  };

  // --------------------
  // Animations (Framer Motion)
  // --------------------
  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.06,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.995 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.32, ease: [0.2, 0.9, 0.2, 1] },
    },
    hover: { scale: 1.01, transition: { duration: 0.18 } },
  };
  const activeFilters = [
    ...category,
    ...subCategory,
    ...concentration,
    ...(specialFlags.newArrival ? ["New Arrival"] : []),
    ...(specialFlags.onSales ? ["On Sale"] : []),
    ...(stockFlags.inStock ? ["In Stock"] : []),
    ...(stockFlags.lowStock ? ["Low Stock"] : []),
    ...(stockFlags.outOfStock ? ["Out of Stock"] : []),
  ];

  const tempActiveFilters = [
    ...tempCategory,
    ...tempSubCategory,
    ...tempConcentration,
    ...(tempSpecialFlags.newArrival ? ["New Arrival"] : []),
    ...(tempSpecialFlags.onSales ? ["On Sale"] : []),
    ...(tempStockFlags.inStock ? ["In Stock"] : []),
    ...(tempStockFlags.lowStock ? ["Low Stock"] : []),
    ...(tempStockFlags.outOfStock ? ["Out of Stock"] : []),
  ];

  const hasPendingMobileFilters =
    tempCategory.join("|") !== category.join("|") ||
    tempSubCategory.join("|") !== subCategory.join("|") ||
    tempConcentration.join("|") !== concentration.join("|") ||
    tempSpecialFlags.newArrival !== specialFlags.newArrival ||
    tempSpecialFlags.onSales !== specialFlags.onSales ||
    tempStockFlags.inStock !== stockFlags.inStock ||
    tempStockFlags.lowStock !== stockFlags.lowStock ||
    tempStockFlags.outOfStock !== stockFlags.outOfStock;

  const FilterSection = ({ sectionKey, title, children }) => (
    <div className="overflow-hidden border-b border-[#eadfce] last:border-b-0">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={openSections[sectionKey]}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
          {title}
        </span>
        <FiChevronDown
          className={`h-4 w-4 text-[#c49a5e] transition-transform ${
            openSections[sectionKey] ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={`${openSections[sectionKey] ? "block" : "hidden"} px-5 pb-5`}>
        {children}
      </div>
    </div>
  );

  const checkboxClass =
    "h-3.5 w-3.5 rounded border-[#d8c8b5] accent-[#c49a5e]";

  const countItems = (predicate) => (products || []).filter(predicate).length;
  const stockStatus = (item) => {
    const stock = getStockCount(item);
    const soldOut = Boolean(item.outOfStock) || (stock !== null && stock <= 0);
    const lowStock = !soldOut && stock !== null && stock <= lowStockLimit;
    const inStock = !soldOut && (stock === null || stock > 0);
    return { soldOut, lowStock, inStock };
  };
  const filterRowClass =
    "flex items-center justify-between gap-3 rounded-full px-2 py-1.5 transition hover:bg-[#fffaf4]";
  const countBadgeClass =
    "ml-auto rounded-full bg-[#f3eadf] px-2 py-0.5 text-[11px] font-semibold text-[#9a8068]";

  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#1f1b17]">
      <section
        className={`border-b border-[#eadfce] px-4 sm:px-[5vw] md:px-[7vw] lg:px-[3vw] ${
          showSearch ? "pt-7" : "pt-12"
        }`}
      >
        <div className={`mx-auto max-w-[1480px] text-center ${showSearch ? "pb-7" : "pb-9"}`}>
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            The Collection
          </p>
          <h1
            className={`mt-3 font-serif leading-none text-[#1f1b17] ${
              showSearch ? "text-4xl sm:text-5xl" : "text-4xl sm:text-5xl md:text-6xl"
            }`}
          >
            All Collection
          </h1>
          <p className={`mx-auto max-w-2xl text-sm leading-7 text-[#7d6756] sm:text-base ${showSearch ? "mt-4" : "mt-5"}`}>
            Explore Levon perfumes, scent families, and gift-ready edits with
            quiet filters made for finding the right trail.
          </p>
          {showSearch && (
            <div className="mx-auto mt-5 flex w-full max-w-3xl flex-col gap-3 sm:flex-row lg:hidden">
              <button
                onClick={openPanel}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8c8b5] bg-[#fffdf9] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] shadow-[0_10px_24px_rgba(43,32,22,0.06)] transition hover:border-[#c49a5e]"
                aria-label="Open filters"
              >
                <FiFilter className="h-4 w-4" />
                Filters
              </button>

              <label className="relative sm:min-w-[210px]">
                <span className="sr-only">Sort By</span>
                <select
                  onChange={(e) => setSortType(e.target.value)}
                  className="w-full appearance-none rounded-full border border-[#d8c8b5] bg-[#fffdf9] px-4 py-2.5 pr-10 text-sm text-[#1f1b17] shadow-[0_10px_24px_rgba(43,32,22,0.06)] outline-none transition hover:border-[#c49a5e] focus:border-[#c49a5e]"
                  value={sortType}
                >
                  <option value="relevent">Sort By: Relevant</option>
                  <option value="low-high">Sort By: Low to High</option>
                  <option value="high-low">Sort By: High to Low</option>
                </select>
                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
              </label>
            </div>
          )}
          <SearchBar />
        </div>
      </section>

      <section className="px-4 py-8 sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-[270px] shrink-0 lg:block">
            <div className="sticky top-28 overflow-hidden rounded-md border border-[#eadfce] bg-[#fffdf9] shadow-[0_18px_45px_rgba(43,32,22,0.07)]">
              <div className="border-b border-[#eadfce] px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1f1b17] text-white">
                    <FiSliders className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8068]">
                      Refine
                    </p>
                    <p className="font-serif text-2xl text-[#1f1b17]">
                      Filters
                    </p>
                  </div>
                </div>
              </div>

              <FilterSection sectionKey="categories" title="Categories">
                <div className="flex flex-col gap-3 text-sm text-[#6f5844]">
                  {categoryOptions.map((option) => (
                    <label key={option} className={filterRowClass}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          value={option}
                          checked={category.includes(option)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategory((prev) =>
                              prev.includes(val)
                                ? prev.filter((v) => v !== val)
                                : [...prev, val]
                            );
                          }}
                        />
                        {option}
                      </span>
                      <span className={countBadgeClass}>
                        {countItems((item) => item.category === option || item.subCategory === option)}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection sectionKey="type" title="Scent Family">
                <div className="flex flex-col gap-3 text-sm text-[#6f5844]">
                  {typeOptions.map((type) => (
                    <label key={type} className={filterRowClass}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          value={type}
                          checked={subCategory.includes(type)}
                          onChange={() => {
                            const val = type;
                            setSubCategory((prev) =>
                              prev.includes(val)
                                ? prev.filter((v) => v !== val)
                                : [...prev, val]
                            );
                          }}
                        />
                        {type}
                      </span>
                      <span className={countBadgeClass}>
                        {countItems((item) => item.subCategory === type)}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection sectionKey="concentration" title="Concentration">
                <div className="flex flex-col gap-3 text-sm text-[#6f5844]">
                  {concentrationOptions.map((option) => (
                    <label key={option} className={filterRowClass}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          value={option}
                          checked={concentration.includes(option)}
                          onChange={() => {
                            setConcentration((prev) =>
                              prev.includes(option)
                                ? prev.filter((v) => v !== option)
                                : [...prev, option]
                            );
                          }}
                        />
                        {option}
                      </span>
                      <span className={countBadgeClass}>
                        {countItems((item) => getConcentration(item) === option)}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection sectionKey="special" title="Special">
                <div className="flex flex-col gap-3 text-sm text-[#6f5844]">
                  <label className="flex items-center gap-3">
                    <input
                      className={checkboxClass}
                      type="checkbox"
                      checked={specialFlags.newArrival}
                      onChange={() =>
                        setSpecialFlags((p) => ({
                          ...p,
                          newArrival: !p.newArrival,
                        }))
                      }
                    />
                    New Arrival
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      className={checkboxClass}
                      type="checkbox"
                      checked={specialFlags.onSales}
                      onChange={() =>
                        setSpecialFlags((p) => ({ ...p, onSales: !p.onSales }))
                      }
                    />
                    On Sale
                  </label>
                </div>
              </FilterSection>

              <FilterSection sectionKey="availability" title="Availability">
                <div className="flex flex-col gap-3 text-sm text-[#6f5844]">
                  <label className={`${filterRowClass} border border-[#d8c8b5] bg-[#fffaf4] font-semibold text-[#1f1b17]`}>
                    <span className="flex items-center gap-3">
                      <input
                        className={checkboxClass}
                        type="checkbox"
                        checked={stockFlags.inStock}
                        onChange={() =>
                          setStockFlags((p) => ({ ...p, inStock: !p.inStock }))
                        }
                      />
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#3b7a57]" />
                        In Stock
                      </span>
                    </span>
                    <span className="rounded-full bg-[#e5f1e8] px-2 py-0.5 text-[11px] font-bold text-[#2f6c4d]">
                      {countItems((item) => stockStatus(item).inStock)}
                    </span>
                  </label>
                  <label className={filterRowClass}>
                    <span className="flex items-center gap-3">
                      <input
                        className={checkboxClass}
                        type="checkbox"
                        checked={stockFlags.lowStock}
                        onChange={() =>
                          setStockFlags((p) => ({ ...p, lowStock: !p.lowStock }))
                        }
                      />
                      Low Stock
                    </span>
                    <span className={countBadgeClass}>
                      {countItems((item) => stockStatus(item).lowStock)}
                    </span>
                  </label>
                  <label className={filterRowClass}>
                    <span className="flex items-center gap-3">
                      <input
                        className={checkboxClass}
                        type="checkbox"
                        checked={stockFlags.outOfStock}
                        onChange={() =>
                          setStockFlags((p) => ({
                            ...p,
                            outOfStock: !p.outOfStock,
                          }))
                        }
                      />
                      Out of Stock
                    </span>
                    <span className={countBadgeClass}>
                      {countItems((item) => stockStatus(item).soldOut)}
                    </span>
                  </label>
                </div>
              </FilterSection>

              {activeFilters.length > 0 && (
                <div className="px-5 py-5">
                  <button
                    onClick={clearAll}
                    className="w-full rounded-full border border-[#d8c8b5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f5844] transition hover:border-[#c49a5e] hover:text-[#1f1b17]"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 rounded-md border border-[#eadfce] bg-[#fffdf9] px-4 py-4 shadow-[0_14px_34px_rgba(43,32,22,0.05)] sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
                    {filterProduct.length} results
                  </p>
                  <p className="mt-1 text-sm text-[#7d6756]">
                    Showing {visibleProducts.length} of {filterProduct.length} products
                  </p>
                </div>

                <div className={`${showSearch ? "hidden lg:flex" : "flex"} flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end`}>
                  <button
                    onClick={openPanel}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8c8b5] bg-[#fffaf4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f1b17] transition hover:border-[#c49a5e] lg:hidden"
                    aria-label="Open filters"
                  >
                    <FiFilter className="h-4 w-4" />
                    Filters
                  </button>

                  <label className="relative">
                    <span className="sr-only">Sort By</span>
                    <select
                      onChange={(e) => setSortType(e.target.value)}
                      className="w-full appearance-none rounded-full border border-[#d8c8b5] bg-[#fffaf4] px-4 py-2 pr-10 text-sm text-[#1f1b17] outline-none transition hover:border-[#c49a5e] focus:border-[#c49a5e] sm:w-[210px]"
                      value={sortType}
                    >
                      <option value="relevent">Sort By: Relevant</option>
                      <option value="low-high">Sort By: Low to High</option>
                      <option value="high-low">Sort By: High to Low</option>
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c49a5e]" />
                  </label>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeFilters.map((f, i) => (
                    <span
                      key={`${f}-${i}`}
                      className="rounded-full border border-[#eadfce] bg-[#fffaf4] px-3 py-1 text-xs font-medium text-[#6f5844]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {productsLoading ? (
              <CollectionGridSkeleton cards={8} />
            ) : (
              <motion.div
                className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                {visibleProducts.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    style={{ transformOrigin: "center" }}
                  >
                    <ProductItem
                      id={item._id}
                      name={item.name}
                      image={item.image || item.image1}
                      price={item.price}
                      discountPrice={item.discountPrice}
                      onSales={item.onSales}
                      outOfStock={item.outOfStock}
                      colors={item.colors || []}
                      sizes={item.sizes || []}
                      category={item.category}
                      subCategory={item.subCategory}
                      concentration={item.concentration}
                      stock={item.stock}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!productsLoading && filterProduct.length === 0 && (
              <div className="rounded-md border border-[#eadfce] bg-[#fffdf9] py-16 text-center">
                <p className="font-serif text-3xl text-[#1f1b17]">
                  No matching scents
                </p>
                <p className="mt-3 text-sm text-[#7d6756]">
                  Clear a filter or try another scent family.
                </p>
              </div>
            )}

            {filterProduct.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(p - 1, 1));
                    goTop();
                  }}
                  disabled={currentPage === 1}
                  className={`rounded-full border px-4 py-2 transition ${
                    currentPage === 1
                      ? "cursor-not-allowed border-[#eadfce] text-[#b7a898]"
                      : "border-[#d8c8b5] text-[#6f5844] hover:border-[#c49a5e] hover:text-[#1f1b17]"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      goTop();
                    }}
                    className={`h-9 w-9 rounded-full border transition ${
                      currentPage === i + 1
                        ? "border-[#1f1b17] bg-[#1f1b17] text-white"
                        : "border-[#d8c8b5] text-[#6f5844] hover:border-[#c49a5e]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                    goTop();
                  }}
                  disabled={currentPage === totalPages}
                  className={`rounded-full border px-4 py-2 transition ${
                    currentPage === totalPages
                      ? "cursor-not-allowed border-[#eadfce] text-[#b7a898]"
                      : "border-[#d8c8b5] text-[#6f5844] hover:border-[#c49a5e] hover:text-[#1f1b17]"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            className="fixed inset-0 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#1f1b17]/45 backdrop-blur-sm"
              onClick={() => setShowFilterPanel(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="absolute left-0 top-0 flex h-full w-[86vw] max-w-[360px] flex-col overflow-auto bg-[#fffaf4] shadow-2xl"
              initial={{ x: -36, opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 260, damping: 24 },
              }}
              exit={{ x: -36, opacity: 0, transition: { duration: 0.18 } }}
            >
              <div className="border-b border-[#eadfce] px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8068]">
                      Refine
                    </p>
                    <h3 className="mt-1 font-serif text-3xl text-[#1f1b17]">
                      Filters
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#d8c8b5] text-[#1f1b17]"
                    aria-label="Close filters"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex w-fit items-center gap-2 text-[#c49a5e]">
                  <span className="h-px w-8 bg-current" />
                  <span className="h-2 w-2 rotate-45 bg-current" />
                  <span className="h-px w-8 bg-current" />
                </div>
              </div>

              <AnimatePresence>
                {hasPendingMobileFilters && (
                  <motion.div
                    className="sticky top-0 z-20 border-b border-[#eadfce] bg-[#fffaf4]/95 px-5 py-3 shadow-[0_12px_24px_rgba(43,32,22,0.08)] backdrop-blur"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <button
                      onClick={applyFilters}
                      className="flex w-full items-center justify-between rounded-full bg-[#1f1b17] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
                    >
                      <span>Apply Filters</span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px]">
                        {tempActiveFilters.length}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 px-5 py-5">
                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
                    Categories
                  </p>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-[#6f5844]">
                    {categoryOptions.map((option) => (
                      <label key={option} className={filterRowClass}>
                        <span className="flex items-center gap-3">
                          <input
                            className={checkboxClass}
                            type="checkbox"
                            value={option}
                            checked={tempCategory.includes(option)}
                            onChange={() => toggleTempCategory(option)}
                          />
                          {option}
                        </span>
                        <span className={countBadgeClass}>
                          {countItems((item) => item.category === option || item.subCategory === option)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
                    Scent Family
                  </p>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-[#6f5844]">
                    {typeOptions.map((type) => (
                      <label key={type} className={filterRowClass}>
                        <span className="flex items-center gap-3">
                          <input
                            className={checkboxClass}
                            type="checkbox"
                            value={type}
                            checked={tempSubCategory.includes(type)}
                            onChange={() => toggleTempSubCategory(type)}
                          />
                          {type}
                        </span>
                        <span className={countBadgeClass}>
                          {countItems((item) => item.subCategory === type)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
                    Concentration
                  </p>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-[#6f5844]">
                    {concentrationOptions.map((option) => (
                      <label key={option} className={filterRowClass}>
                        <span className="flex items-center gap-3">
                          <input
                            className={checkboxClass}
                            type="checkbox"
                            checked={tempConcentration.includes(option)}
                            onChange={() => toggleTempConcentration(option)}
                          />
                          {option}
                        </span>
                        <span className={countBadgeClass}>
                          {countItems((item) => getConcentration(item) === option)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
                    Special
                  </p>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-[#6f5844]">
                    <label className="flex items-center gap-3">
                      <input
                        className={checkboxClass}
                        type="checkbox"
                        checked={tempSpecialFlags.newArrival}
                        onChange={toggleTempNewArrival}
                      />
                      New Arrival
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        className={checkboxClass}
                        type="checkbox"
                        checked={tempSpecialFlags.onSales}
                        onChange={toggleTempOnSales}
                      />
                      On Sale
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]">
                    Availability
                  </p>
                  <div className="mt-3 flex flex-col gap-3 text-sm text-[#6f5844]">
                    <label className={`${filterRowClass} border border-[#d8c8b5] bg-[#fffaf4] font-semibold text-[#1f1b17]`}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          checked={tempStockFlags.inStock}
                          onChange={() => toggleTempStockFlag("inStock")}
                        />
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#3b7a57]" />
                          In Stock
                        </span>
                      </span>
                      <span className="rounded-full bg-[#e5f1e8] px-2 py-0.5 text-[11px] font-bold text-[#2f6c4d]">
                        {countItems((item) => stockStatus(item).inStock)}
                      </span>
                    </label>
                    <label className={filterRowClass}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          checked={tempStockFlags.lowStock}
                          onChange={() => toggleTempStockFlag("lowStock")}
                        />
                        Low Stock
                      </span>
                      <span className={countBadgeClass}>
                        {countItems((item) => stockStatus(item).lowStock)}
                      </span>
                    </label>
                    <label className={filterRowClass}>
                      <span className="flex items-center gap-3">
                        <input
                          className={checkboxClass}
                          type="checkbox"
                          checked={tempStockFlags.outOfStock}
                          onChange={() => toggleTempStockFlag("outOfStock")}
                        />
                        Out of Stock
                      </span>
                      <span className={countBadgeClass}>
                        {countItems((item) => stockStatus(item).soldOut)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-[#eadfce] bg-[#fffaf4] px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8068]"
                  >
                    Reset
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8068]"
                  >
                    Clear All
                  </button>
                </div>
                <button
                  onClick={applyFilters}
                  className="w-full rounded-full bg-[#1f1b17] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e]"
                >
                  Apply Filters
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Collection;
