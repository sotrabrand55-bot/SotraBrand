import React, { useContext, useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const SearchBar = () => {
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

  if (!showSearch || !visible) return null;

  return (
    <div className="mx-auto mt-7 w-full max-w-3xl">
      <div className="flex items-center gap-3 rounded-full border border-[#d8c8b5] bg-[#fffdf9] px-4 py-2.5 text-[#1f1b17] shadow-[0_12px_28px_rgba(43,32,22,0.07)]">
        <FiSearch className="h-5 w-5 shrink-0 text-[#c49a5e]" />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#a59586]"
          type="search"
          placeholder="Search Levon collection"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8068] transition hover:text-[#1f1b17]"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={closeSearch}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#eadfce] text-[#6f5844] transition hover:border-[#c49a5e] hover:text-[#1f1b17]"
          aria-label="Close search"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
