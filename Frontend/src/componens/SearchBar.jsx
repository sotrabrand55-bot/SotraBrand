import { useContext, useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const SearchBar = ({ className = "" }) => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    setVisible(location.pathname.toLowerCase().includes("collection"));
  }, [location.pathname]);

  useEffect(() => {
    if (showSearch && visible) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [showSearch, visible]);

  const closeSearch = () => {
    setSearch("");
    setShowSearch(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }

    if (e.key === "Escape") {
      closeSearch();
    }
  };

  return (
    <AnimatePresence initial={false}>
      {showSearch && visible && (
        <motion.div
          className={`mx-auto w-full max-w-3xl overflow-hidden ${className}`}
          initial={{ height: 0, opacity: 0, y: -8 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 border border-black/20 bg-white px-4 py-2.5 text-black">
            <FiSearch className="h-5 w-5 shrink-0 text-black" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
              type="search"
              placeholder="Search SotraBrand products"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] text-black/55 transition hover:text-black"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="grid h-8 w-8 shrink-0 place-items-center border border-black/20 text-black transition hover:border-black hover:bg-black hover:text-white"
              aria-label="Close search"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchBar;
