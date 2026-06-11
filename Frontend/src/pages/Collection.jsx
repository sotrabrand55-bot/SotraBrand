/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { ShopContext } from "../context/ShopContext";
import CollectionProductCard from "../componens/CollectionProductCard";
import SearchBar from "../componens/SearchBar";
import { CollectionGridSkeleton } from "../componens/Skeletons";
import { getEffectiveProductPrice } from "../utils/productMapping";
import { subcategoryGroups as fallbackSubcategoryGroups } from "../lib/subcategoryCatalog";
const concentrationOptions = ["Eau de Parfum", "Eau de Toilette"];
const lowStockLimit = 5;

const matchesCategoryGroup = (item, categoryName, categorySubcategories) => {
  const childCategories = categorySubcategories[categoryName] || [];
  return (
    item?.category === categoryName ||
    item?.subCategory === categoryName ||
    childCategories.includes(item?.category) ||
    childCategories.includes(item?.subCategory)
  );
};

const matchesSubcategory = (item, subcategoryName) =>
  item?.subCategory
    ? item.subCategory === subcategoryName
    : item?.category === subcategoryName;

const getStockCount = (item) => {
  if (item?.stock === undefined || item?.stock === null || item?.stock === "") {
    return null;
  }
  const value = Number(item.stock);
  return Number.isFinite(value) ? value : null;
};

const stockStatus = (item) => {
  const stock = getStockCount(item);
  const soldOut = Boolean(item?.outOfStock) || (stock !== null && stock <= 0);
  const lowStock = !soldOut && stock !== null && stock <= lowStockLimit;
  const inStock = !soldOut && (stock === null || stock > 0);
  return { soldOut, lowStock, inStock };
};

const getConcentration = (item) => String(item?.concentration || "").trim();

const toggleArrayValue = (setter, value) =>
  setter((current) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
  );

const Collection = () => {
  const location = useLocation();
  const { products, productsLoading, search, showSearch, categoryGroups } = useContext(ShopContext);
  const subcategoryGroups =
    categoryGroups?.length ? categoryGroups : fallbackSubcategoryGroups;
  const categorySubcategories = useMemo(
    () =>
      Object.fromEntries(
        subcategoryGroups.map((group) => [
          group.label,
          group.children.map((child) => child.label),
        ])
      ),
    [subcategoryGroups]
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [openCategoryGroups, setOpenCategoryGroups] = useState({});
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [concentration, setConcentration] = useState([]);
  const [sortType, setSortType] = useState("newest");
  const [specialFlags, setSpecialFlags] = useState({
    newArrival: false,
    onSales: false,
  });
  const [stockFlags, setStockFlags] = useState({
    inStock: false,
    lowStock: false,
    outOfStock: false,
  });
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
  const [openSections, setOpenSections] = useState({
    categories: true,
    concentration: true,
    special: true,
    availability: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromState = location.state || {};
    const parseList = (value) =>
      value
        ? String(value)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const nextCategory = parseList(params.get("cat") || fromState.cat);
    const nextSubCategory = parseList(params.get("sub") || fromState.sub);
    const nextConcentration = parseList(
      params.get("conc") ||
        params.get("concentration") ||
        fromState.conc ||
        fromState.concentration
    );
    const specialParts = parseList(
      params.get("special") || fromState.special
    ).map((item) => item.toLowerCase());
    const stockParts = parseList(
      params.get("stock") || fromState.stock
    ).map((item) => item.toLowerCase());
    const nextSpecialFlags = {
      newArrival:
        specialParts.includes("newarrival") || specialParts.includes("new"),
      onSales:
        specialParts.includes("onsales") ||
        specialParts.includes("onsale") ||
        specialParts.includes("sale"),
    };
    const nextStockFlags = {
      inStock:
        stockParts.includes("instock") || stockParts.includes("in-stock"),
      lowStock:
        stockParts.includes("lowstock") || stockParts.includes("low-stock"),
      outOfStock:
        stockParts.includes("outofstock") ||
        stockParts.includes("out-of-stock") ||
        stockParts.includes("oos"),
    };

    setCategory(nextCategory);
    setTempCategory(nextCategory);
    setSubCategory(nextSubCategory);
    setTempSubCategory(nextSubCategory);
    setConcentration(nextConcentration);
    setTempConcentration(nextConcentration);
    setSpecialFlags(nextSpecialFlags);
    setTempSpecialFlags(nextSpecialFlags);
    setStockFlags(nextStockFlags);
    setTempStockFlags(nextStockFlags);
    setCurrentPage(1);

  }, [location.key, location.search]);

  useEffect(() => {
    if (!subCategory.length) return;

    const matchingGroups = subcategoryGroups.filter((group) =>
      group.children.some((child) => subCategory.includes(child.label))
    );
    if (!matchingGroups.length) return;

    setOpenCategoryGroups((current) => ({
      ...current,
      ...Object.fromEntries(matchingGroups.map((group) => [group.label, true])),
    }));
  }, [subCategory, subcategoryGroups]);

  const filteredProducts = useMemo(() => {
    let result = [...(products || [])];

    if (showSearch && search?.trim()) {
      const term = search.trim().toLowerCase().replace(/\s+/g, "");
      result = result.filter((item) =>
        String(item?.name || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .includes(term)
      );
    }
    if (category.length) {
      result = result.filter((item) =>
        category.some((name) => matchesCategoryGroup(item, name, categorySubcategories))
      );
    }
    if (subCategory.length) {
      result = result.filter((item) =>
        subCategory.some((name) => matchesSubcategory(item, name))
      );
    }
    if (concentration.length) {
      result = result.filter((item) =>
        concentration.includes(getConcentration(item))
      );
    }
    if (specialFlags.newArrival || specialFlags.onSales) {
      result = result.filter(
        (item) =>
          (specialFlags.newArrival && item?.newArrival) ||
          (specialFlags.onSales && item?.onSales)
      );
    }
    if (stockFlags.inStock || stockFlags.lowStock || stockFlags.outOfStock) {
      result = result.filter((item) => {
        const status = stockStatus(item);
        return (
          (stockFlags.inStock && status.inStock) ||
          (stockFlags.lowStock && status.lowStock) ||
          (stockFlags.outOfStock && status.soldOut)
        );
      });
    }

    if (sortType === "newest" || sortType === "relevent") {
      result.sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0));
    }
    if (sortType === "low-high") {
      result.sort(
        (a, b) => getEffectiveProductPrice(a) - getEffectiveProductPrice(b)
      );
    }
    if (sortType === "high-low") {
      result.sort(
        (a, b) => getEffectiveProductPrice(b) - getEffectiveProductPrice(a)
      );
    }
    return result;
  }, [
    category,
    categorySubcategories,
    concentration,
    products,
    search,
    showSearch,
    sortType,
    specialFlags,
    stockFlags,
    subCategory,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    category,
    concentration,
    search,
    showSearch,
    sortType,
    specialFlags,
    stockFlags,
    subCategory,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const countItems = (predicate) => (products || []).filter(predicate).length;
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
    JSON.stringify({
      tempCategory,
      tempSubCategory,
      tempConcentration,
      tempSpecialFlags,
      tempStockFlags,
    }) !==
    JSON.stringify({
      tempCategory: category,
      tempSubCategory: subCategory,
      tempConcentration: concentration,
      tempSpecialFlags: specialFlags,
      tempStockFlags: stockFlags,
    });

  const clearAll = () => {
    setCategory([]);
    setSubCategory([]);
    setConcentration([]);
    setSpecialFlags({ newArrival: false, onSales: false });
    setStockFlags({ inStock: false, lowStock: false, outOfStock: false });
    setTempCategory([]);
    setTempSubCategory([]);
    setTempConcentration([]);
    setTempSpecialFlags({ newArrival: false, onSales: false });
    setTempStockFlags({ inStock: false, lowStock: false, outOfStock: false });
    setShowFilterPanel(false);
    setCurrentPage(1);
  };

  const resetMobileFilters = () => {
    setTempCategory([]);
    setTempSubCategory([]);
    setTempConcentration([]);
    setTempSpecialFlags({ newArrival: false, onSales: false });
    setTempStockFlags({ inStock: false, lowStock: false, outOfStock: false });
  };

  const openPanel = () => {
    setTempCategory([...category]);
    setTempSubCategory([...subCategory]);
    setTempConcentration([...concentration]);
    setTempSpecialFlags({ ...specialFlags });
    setTempStockFlags({ ...stockFlags });
    setShowFilterPanel(true);
  };

  const applyFilters = () => {
    setCategory([...tempCategory]);
    setSubCategory([...tempSubCategory]);
    setConcentration([...tempConcentration]);
    setSpecialFlags({ ...tempSpecialFlags });
    setStockFlags({ ...tempStockFlags });
    setShowFilterPanel(false);
    setCurrentPage(1);
  };

  const chooseFamily = (label) => {
    setCategory([label]);
    setTempCategory([label]);
    setSubCategory([]);
    setTempSubCategory([]);
    setOpenCategoryGroups((current) => ({ ...current, [label]: true }));
    setCurrentPage(1);
  };

  const removeFilter = (filter) => {
    if (category.includes(filter)) {
      setCategory((current) => current.filter((item) => item !== filter));
      setTempCategory((current) => current.filter((item) => item !== filter));
    } else if (subCategory.includes(filter)) {
      setSubCategory((current) => current.filter((item) => item !== filter));
      setTempSubCategory((current) => current.filter((item) => item !== filter));
    } else if (concentration.includes(filter)) {
      setConcentration((current) => current.filter((item) => item !== filter));
      setTempConcentration((current) => current.filter((item) => item !== filter));
    } else if (filter === "New Arrival") {
      setSpecialFlags((current) => ({ ...current, newArrival: false }));
      setTempSpecialFlags((current) => ({ ...current, newArrival: false }));
    } else if (filter === "On Sale") {
      setSpecialFlags((current) => ({ ...current, onSales: false }));
      setTempSpecialFlags((current) => ({ ...current, onSales: false }));
    } else {
      const key = {
        "In Stock": "inStock",
        "Low Stock": "lowStock",
        "Out of Stock": "outOfStock",
      }[filter];
      if (key) {
        setStockFlags((current) => ({ ...current, [key]: false }));
        setTempStockFlags((current) => ({ ...current, [key]: false }));
      }
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterSection = ({ sectionKey, title, children }) => (
    <div className="border-b border-black/15">
      <button
        type="button"
        onClick={() =>
          setOpenSections((current) => ({
            ...current,
            [sectionKey]: !current[sectionKey],
          }))
        }
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={openSections[sectionKey]}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
          {title}
        </span>
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${
            openSections[sectionKey] ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={openSections[sectionKey] ? "pb-5" : "hidden"}>{children}</div>
    </div>
  );

  const checkboxClass =
    "h-4 w-4 shrink-0 rounded-none border-black/40 accent-black";
  const filterRowClass =
    "flex min-h-10 items-center justify-between gap-3 py-2 text-sm text-black/70 transition hover:text-black";
  const countClass = "text-[10px] font-semibold uppercase tracking-[0.12em] text-black/40";

  const CategoryDropdowns = ({
    selectedCategories,
    selectedSubcategories,
    onToggleCategory,
    onToggleSubcategory,
  }) => (
    <div>
      {subcategoryGroups.map((group) => {
        const isOpen = Boolean(openCategoryGroups[group.label]);
        const selectedChildCount = group.children.filter((child) =>
          selectedSubcategories.includes(child.label)
        ).length;

        return (
          <div key={group.label} className="border-b border-black/10 last:border-0">
            <div className="flex items-center gap-2">
              <label className={`${filterRowClass} min-w-0 flex-1`}>
                <span className="flex min-w-0 items-center gap-3">
                  <input
                    className={checkboxClass}
                    type="checkbox"
                    checked={selectedCategories.includes(group.label)}
                    onChange={() => onToggleCategory(group.label)}
                  />
                  <span className="truncate font-medium text-black">{group.label}</span>
                </span>
                <span className={countClass}>
                  {countItems((item) =>
                    matchesCategoryGroup(item, group.label, categorySubcategories)
                  )}
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setOpenCategoryGroups((current) => ({
                    ...current,
                    [group.label]: !current[group.label],
                  }))
                }
                className="relative grid h-10 w-10 shrink-0 place-items-center"
                aria-label={`${isOpen ? "Close" : "Open"} ${group.label} subcategories`}
              >
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
                {selectedChildCount > 0 && (
                  <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[8px] font-bold text-white">
                    {selectedChildCount}
                  </span>
                )}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mb-3 ml-2 border-l border-black/20 pl-4">
                    {group.children.map((child) => (
                      <label key={child.label} className={filterRowClass}>
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            className={checkboxClass}
                            type="checkbox"
                            checked={selectedSubcategories.includes(child.label)}
                            onChange={() => onToggleSubcategory(child.label)}
                          />
                          <span className="leading-5">{child.label}</span>
                        </span>
                        <span className={countClass}>
                          {countItems((item) => matchesSubcategory(item, child.label))}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  const FilterContents = ({
    selectedCategories,
    selectedSubcategories,
    selectedConcentration,
    selectedSpecialFlags,
    selectedStockFlags,
    onCategory,
    onSubcategory,
    onConcentration,
    onSpecial,
    onStock,
  }) => (
    <>
      <FilterSection sectionKey="categories" title="Categories">
        <CategoryDropdowns
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          onToggleCategory={onCategory}
          onToggleSubcategory={onSubcategory}
        />
      </FilterSection>
      <FilterSection sectionKey="concentration" title="Concentration">
        {concentrationOptions.map((option) => (
          <label key={option} className={filterRowClass}>
            <span className="flex items-center gap-3">
              <input
                className={checkboxClass}
                type="checkbox"
                checked={selectedConcentration.includes(option)}
                onChange={() => onConcentration(option)}
              />
              {option}
            </span>
            <span className={countClass}>
              {countItems((item) => getConcentration(item) === option)}
            </span>
          </label>
        ))}
      </FilterSection>
      <FilterSection sectionKey="special" title="Special">
        <label className={filterRowClass}>
          <span className="flex items-center gap-3">
            <input
              className={checkboxClass}
              type="checkbox"
              checked={selectedSpecialFlags.newArrival}
              onChange={() => onSpecial("newArrival")}
            />
            New Arrival
          </span>
          <span className={countClass}>{countItems((item) => item?.newArrival)}</span>
        </label>
        <label className={filterRowClass}>
          <span className="flex items-center gap-3">
            <input
              className={checkboxClass}
              type="checkbox"
              checked={selectedSpecialFlags.onSales}
              onChange={() => onSpecial("onSales")}
            />
            On Sale
          </span>
          <span className={countClass}>{countItems((item) => item?.onSales)}</span>
        </label>
      </FilterSection>
      <FilterSection sectionKey="availability" title="Availability">
        {[
          ["inStock", "In Stock"],
          ["lowStock", "Low Stock"],
          ["outOfStock", "Out of Stock"],
        ].map(([key, label]) => (
          <label key={key} className={filterRowClass}>
            <span className="flex items-center gap-3">
              <input
                className={checkboxClass}
                type="checkbox"
                checked={selectedStockFlags[key]}
                onChange={() => onStock(key)}
              />
              {label}
            </span>
            <span className={countClass}>
              {countItems((item) => {
                const status = stockStatus(item);
                return key === "outOfStock" ? status.soldOut : status[key];
              })}
            </span>
          </label>
        ))}
      </FilterSection>
    </>
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/15 bg-white px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/55 sm:text-xs">
              Be Radiant By Nancy
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
              The Collection
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/55 sm:text-base">
              Find the ritual, scent, and finish made for your radiance.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-4xl snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
            <button
              type="button"
              onClick={clearAll}
              className={`shrink-0 border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.17em] transition sm:text-xs ${
                activeFilters.length === 0
                  ? "border-black bg-black text-white"
                  : "border-black/25 bg-white text-black hover:border-black"
              }`}
            >
              All Products
            </button>
            {subcategoryGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onClick={() => chooseFamily(group.label)}
                className={`shrink-0 border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.17em] transition sm:text-xs ${
                  category.includes(group.label)
                    ? "border-black bg-black text-white"
                    : "border-black/25 bg-white text-black hover:border-black"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
          <SearchBar />
        </div>
      </section>

      <section className="bg-white px-4 py-7 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-6 flex items-center border-y border-black/15 lg:hidden">
            <button
              type="button"
              onClick={openPanel}
              className="flex h-14 flex-1 items-center justify-center gap-2 border-r border-black/15 text-[11px] font-bold uppercase tracking-[0.18em]"
            >
              <FiFilter className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[9px] text-white">
                  {activeFilters.length}
                </span>
              )}
            </button>
            <label className="relative h-14 flex-1">
              <span className="sr-only">Sort products</span>
              <select
                value={sortType}
                onChange={(event) => setSortType(event.target.value)}
                className="h-full w-full appearance-none bg-white px-4 text-center text-[11px] font-bold uppercase tracking-[0.15em] outline-none"
              >
                <option value="newest">Newest</option>
                <option value="low-high">Price Low to High</option>
                <option value="high-low">Price High to Low</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            </label>
          </div>

          {activeFilters.length > 0 && (
            <div className="mb-7 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter, index) => (
                <button
                  key={`${filter}-${index}`}
                  type="button"
                  onClick={() => removeFilter(filter)}
                  className="inline-flex items-center gap-2 border border-black/25 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] transition hover:border-black"
                >
                  {filter}
                  <FiX className="h-3 w-3" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="px-2 py-2 text-[9px] font-bold uppercase tracking-[0.14em] underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex gap-10">
            <aside className="hidden w-[250px] shrink-0 lg:block xl:w-[280px]">
              <div className="sticky top-28 border-t border-black">
                <div className="flex items-center justify-between border-b border-black/15 py-5">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em]">Refine</h2>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/45">
                    {activeFilters.length} selected
                  </span>
                </div>
                <FilterContents
                  selectedCategories={category}
                  selectedSubcategories={subCategory}
                  selectedConcentration={concentration}
                  selectedSpecialFlags={specialFlags}
                  selectedStockFlags={stockFlags}
                  onCategory={(value) => toggleArrayValue(setCategory, value)}
                  onSubcategory={(value) => toggleArrayValue(setSubCategory, value)}
                  onConcentration={(value) => toggleArrayValue(setConcentration, value)}
                  onSpecial={(key) =>
                    setSpecialFlags((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                  onStock={(key) =>
                    setStockFlags((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                />
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-5 w-full border border-black px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-7 hidden items-center justify-between border-y border-black/15 py-4 lg:flex">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">
                    {filteredProducts.length} products
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    Showing {visibleProducts.length} on this page
                  </p>
                </div>
                <label className="relative min-w-[220px] border-l border-black/15 pl-6">
                  <span className="sr-only">Sort products</span>
                  <select
                    value={sortType}
                    onChange={(event) => setSortType(event.target.value)}
                    className="w-full appearance-none bg-white py-2 pr-8 text-[11px] font-bold uppercase tracking-[0.14em] outline-none"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="low-high">Sort: Price Low to High</option>
                    <option value="high-low">Sort: Price High to Low</option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2" />
                </label>
              </div>

              <div className="mb-5 flex items-end justify-between lg:hidden">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em]">
                    {filteredProducts.length} products
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-black/40">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              </div>

              {productsLoading ? (
                <CollectionGridSkeleton cards={8} />
              ) : visibleProducts.length ? (
                <motion.div
                  key={`${currentPage}-${sortType}-${activeFilters.join("|")}`}
                  className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.035 } },
                  }}
                >
                  {visibleProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        show: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                    >
                      <CollectionProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="border-y border-black/15 py-20 text-center">
                  <h2 className="text-2xl font-black uppercase sm:text-3xl">
                    No matching products
                  </h2>
                  <p className="mt-3 text-sm text-black/50">
                    Try another category or clear your filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-7 border border-black bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
                  >
                    View All Products
                  </button>
                </div>
              )}

              {!productsLoading && filteredProducts.length > 0 && totalPages > 1 && (
                <nav
                  className="mt-14 flex items-center justify-center border-t border-black/15 pt-7"
                  aria-label="Collection pagination"
                >
                  <button
                    type="button"
                    onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="grid h-11 w-11 place-items-center border border-black/20 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label="Previous page"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="mx-3 flex items-center">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => goToPage(index + 1)}
                        className={`h-11 min-w-11 border-y border-r border-black/20 px-3 text-xs font-bold transition first:border-l ${
                          currentPage === index + 1
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-black/5"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="grid h-11 w-11 place-items-center border border-black/20 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label="Next page"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
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
            <button
              type="button"
              className="absolute inset-0 h-full w-full bg-black/45"
              onClick={() => setShowFilterPanel(false)}
              aria-label="Close filters"
            />
            <motion.aside
              className="absolute left-0 top-0 flex h-full w-[92vw] max-w-[390px] flex-col bg-white"
              initial={{ x: "-100%" }}
              animate={{ x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ x: "-100%", transition: { duration: 0.22 } }}
            >
              <header className="flex items-center justify-between border-b border-black px-5 py-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-black/45">
                    Refine the collection
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(false)}
                  className="grid h-11 w-11 place-items-center border border-black/25"
                  aria-label="Close filters"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </header>

              {hasPendingMobileFilters && (
                <div className="border-b border-black/15 px-5 py-3">
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="flex w-full items-center justify-between bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                  >
                    Apply changes
                    <span>{tempActiveFilters.length}</span>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-5">
                <FilterContents
                  selectedCategories={tempCategory}
                  selectedSubcategories={tempSubCategory}
                  selectedConcentration={tempConcentration}
                  selectedSpecialFlags={tempSpecialFlags}
                  selectedStockFlags={tempStockFlags}
                  onCategory={(value) => toggleArrayValue(setTempCategory, value)}
                  onSubcategory={(value) => toggleArrayValue(setTempSubCategory, value)}
                  onConcentration={(value) =>
                    toggleArrayValue(setTempConcentration, value)
                  }
                  onSpecial={(key) =>
                    setTempSpecialFlags((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                  onStock={(key) =>
                    setTempStockFlags((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                />
              </div>

              <footer className="border-t border-black bg-white px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetMobileFilters}
                    className="text-[9px] font-bold uppercase tracking-[0.17em] underline underline-offset-4"
                  >
                    Reset
                  </button>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                    {tempActiveFilters.length} selected
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full bg-black px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                >
                  Show Products
                </button>
              </footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Collection;
