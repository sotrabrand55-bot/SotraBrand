import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronDown,
  FiSliders,
  FiX,
} from "react-icons/fi";
import CollectionProductCard from "../componens/CollectionProductCard";
import { CollectionGridSkeleton } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";
import {
  getSubcategoryBySlugFromGroups,
  productMatchesSubcategory,
  subcategoryGroups as fallbackSubcategoryGroups,
} from "../lib/subcategoryCatalog";
import { getEffectiveProductPrice } from "../utils/productMapping";

const lowStockLimit = 5;

const stockStatus = (item) => {
  const stock = Number(item?.stock);
  const hasStockNumber = Number.isFinite(stock) && item?.stock !== "";
  const soldOut = Boolean(item?.outOfStock) || (hasStockNumber && stock <= 0);
  const lowStock = !soldOut && hasStockNumber && stock <= lowStockLimit;
  const inStock = !soldOut;
  return { soldOut, lowStock, inStock };
};

const sortProducts = (items, sortType) => {
  const nextItems = [...items];

  if (sortType === "low-high") {
    return nextItems.sort(
      (a, b) => getEffectiveProductPrice(a) - getEffectiveProductPrice(b)
    );
  }

  if (sortType === "high-low") {
    return nextItems.sort(
      (a, b) => getEffectiveProductPrice(b) - getEffectiveProductPrice(a)
    );
  }

  return nextItems.sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0));
};

const SubcategoryProducts = () => {
  const { slug } = useParams();
  const { products, productsLoading, categoryGroups } = useContext(ShopContext);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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
  const [tempSortType, setTempSortType] = useState("newest");
  const [tempSpecialFlags, setTempSpecialFlags] = useState({
    newArrival: false,
    onSales: false,
  });
  const [tempStockFlags, setTempStockFlags] = useState({
    inStock: false,
    lowStock: false,
    outOfStock: false,
  });
  const subcategory = getSubcategoryBySlugFromGroups(
    slug,
    categoryGroups?.length ? categoryGroups : fallbackSubcategoryGroups
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowFilterPanel(false);
    setSortType("newest");
    setSpecialFlags({ newArrival: false, onSales: false });
    setStockFlags({ inStock: false, lowStock: false, outOfStock: false });
  }, [slug]);

  const categoryProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (product) =>
            product?.active !== false && productMatchesSubcategory(product, subcategory)
        ),
    [products, subcategory]
  );

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

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

    return sortProducts(result, sortType);
  }, [categoryProducts, sortType, specialFlags, stockFlags]);

  const activeFilterCount =
    Number(specialFlags.newArrival) +
    Number(specialFlags.onSales) +
    Number(stockFlags.inStock) +
    Number(stockFlags.lowStock) +
    Number(stockFlags.outOfStock);

  const countItems = (predicate) => categoryProducts.filter(predicate).length;

  const openPanel = () => {
    setTempSortType(sortType);
    setTempSpecialFlags({ ...specialFlags });
    setTempStockFlags({ ...stockFlags });
    setShowFilterPanel(true);
  };

  const applyFilters = () => {
    setSortType(tempSortType);
    setSpecialFlags({ ...tempSpecialFlags });
    setStockFlags({ ...tempStockFlags });
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setSortType("newest");
    setSpecialFlags({ newArrival: false, onSales: false });
    setStockFlags({ inStock: false, lowStock: false, outOfStock: false });
    setTempSortType("newest");
    setTempSpecialFlags({ newArrival: false, onSales: false });
    setTempStockFlags({ inStock: false, lowStock: false, outOfStock: false });
  };

  const checkboxClass =
    "h-5 w-5 shrink-0 rounded-none border-black/40 accent-black";
  const filterRowClass =
    "flex min-h-12 items-center justify-between gap-3 py-2 text-[18px] text-black/75";
  const countClass = "text-[13px] text-black/45";

  const FilterOptions = ({
    selectedSort,
    selectedSpecialFlags,
    selectedStockFlags,
    onSort,
    onSpecial,
    onStock,
  }) => (
    <div className="divide-y divide-black/15">
      <section className="py-5">
        <h3 className="mb-4 text-[13px] font-bold uppercase tracking-[0.22em]">
          Sort
        </h3>
        <label className="relative block">
          <span className="sr-only">Sort products</span>
          <select
            value={selectedSort}
            onChange={(event) => onSort(event.target.value)}
            className="h-12 w-full appearance-none border border-black/20 bg-white px-4 pr-10 text-[18px] outline-none"
          >
            <option value="newest">Newest</option>
            <option value="low-high">Price Low to High</option>
            <option value="high-low">Price High to Low</option>
          </select>
          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
        </label>
      </section>

      <section className="py-5">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.22em]">
          Special
        </h3>
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
      </section>

      <section className="py-5">
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.22em]">
          Availability
        </h3>
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
      </section>
    </div>
  );

  if (!subcategory) {
    return (
      <main className="min-h-[62vh] px-5 py-20 text-center">
        <h1 className="text-4xl">Category not found</h1>
        <Link to="/collection" className="mt-7 inline-flex items-center gap-2 underline">
          <FiArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-white px-4 pb-10 pt-8 text-black sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="pb-9 pt-3 text-center sm:pb-12">
          <h1 className="text-[3.2rem] font-normal leading-none sm:text-[4rem]">
            {subcategory.label}
          </h1>
        </header>

        <div className="mb-8 flex items-center justify-between border-y border-black/15 py-3 sm:py-4">
          <button
            type="button"
            onClick={openPanel}
            className="inline-flex min-w-0 items-center gap-2 text-left text-[15px] leading-none tracking-[0.06em] sm:gap-3 sm:text-[18px]"
          >
            <FiSliders className="h-4 w-4 shrink-0 stroke-[1.2] sm:h-5 sm:w-5" />
            Filter and sort
            {activeFilterCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="shrink-0 text-[14px] leading-none tracking-[0.06em] text-black/70 sm:text-[17px]">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div>
          {productsLoading ? (
            <CollectionGridSkeleton cards={8} />
          ) : filteredProducts.length ? (
            <div className="grid grid-cols-2 gap-x-2 gap-y-11 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-7">
              {filteredProducts.map((product) => (
                <CollectionProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <section className="mx-auto max-w-xl py-20 text-center">
              <h2 className="text-3xl">Products coming soon</h2>
              <p className="mt-4 text-sm leading-6 text-black/55">
                This category has no matching products right now.
              </p>
              {activeFilterCount > 0 || sortType !== "newest" ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-7 mr-3 inline-flex border border-black px-6 py-3 text-sm"
                >
                  Clear filters
                </button>
              ) : null}
              <Link
                to="/collection"
                className="mt-7 inline-flex border border-black px-6 py-3 text-sm"
              >
                View all products
              </Link>
            </section>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[1200] transition-opacity duration-300 ease-out ${
          showFilterPanel ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!showFilterPanel}
      >
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-black/20 transition-opacity duration-300"
          onClick={() => setShowFilterPanel(false)}
          aria-label="Close filter and sort"
        />
        <aside
          className={`absolute left-0 top-0 flex h-[100dvh] w-[92vw] max-w-[430px] flex-col overflow-hidden bg-white text-[#121212] shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
            showFilterPanel ? "translate-x-0" : "-translate-x-full"
          }`}
        >
              <header className="relative border-b border-black/15 px-5 py-5 text-center">
                <h2 className="text-[25px] leading-none">Filter and sort</h2>
                <p className="mt-2 text-[17px] leading-none text-black/65">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(false)}
                  className="absolute right-5 top-1/2 grid h-14 w-14 -translate-y-1/2 place-items-center border border-black/20"
                  aria-label="Close filter and sort"
                >
                  <FiX className="h-8 w-8 stroke-[1.1]" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-5">
                <FilterOptions
                  selectedSort={tempSortType}
                  selectedSpecialFlags={tempSpecialFlags}
                  selectedStockFlags={tempStockFlags}
                  onSort={setTempSortType}
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

              <footer className="shrink-0 border-t border-black/15 bg-white px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5">
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="shrink-0 whitespace-nowrap text-[21px] leading-none underline underline-offset-4"
                  >
                    Remove all
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="min-h-14 min-w-[150px] rounded-[14px] bg-black px-8 text-[23px] leading-none text-white transition-transform duration-200 active:scale-[0.98]"
                  >
                    Apply
                  </button>
                </div>
              </footer>
        </aside>
      </div>
    </main>
  );
};

export default SubcategoryProducts;
