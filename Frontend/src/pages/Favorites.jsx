import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import CollectionProductCard from "../componens/CollectionProductCard";
import { CollectionGridSkeleton } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";

const Favorites = () => {
  const {
    products,
    productsLoading,
    favoriteItems,
    setFavoriteItems,
  } = useContext(ShopContext);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const favoriteProducts = useMemo(
    () =>
      (products || []).filter(
        (product) =>
          product?.active !== false && favoriteItems.includes(product._id)
      ),
    [favoriteItems, products]
  );

  const clearFavorites = () => setFavoriteItems([]);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black/15 px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-10 sm:pt-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/50 sm:text-xs">
          Be Radiant By Nancy
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">
          Favorites
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/55 sm:text-base">
          The products you loved enough to keep close.
        </p>
      </header>

      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1480px]">
          {productsLoading ? (
            <>
              <div className="mb-8 h-14 border-y border-black/15" />
              <CollectionGridSkeleton cards={8} />
            </>
          ) : favoriteProducts.length > 0 ? (
            <>
              <div className="mb-9 flex flex-col gap-4 border-y border-black/15 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">
                    {favoriteProducts.length} saved{" "}
                    {favoriteProducts.length === 1 ? "product" : "products"}
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    Tap the filled heart to remove a product.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/collection"
                    className="inline-flex h-11 items-center gap-2 border border-black px-4 text-[10px] font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
                  >
                    Continue Shopping
                    <FiArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={clearFavorites}
                    className="grid h-11 w-11 place-items-center border border-black/25 transition hover:border-black hover:bg-black hover:text-white"
                    aria-label="Clear all favorites"
                    title="Clear all favorites"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <motion.div
                key={favoriteProducts.map((product) => product._id).join("|")}
                className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.035 } },
                }}
              >
                {favoriteProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.34,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                    }}
                  >
                    <CollectionProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <div className="mx-auto flex min-h-[52vh] max-w-2xl items-center justify-center border-y border-black/15 px-4 py-16 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-black/20">
                  <FiHeart className="h-6 w-6" />
                </span>
                <h2 className="mt-7 text-3xl font-black uppercase leading-tight sm:text-4xl">
                  Nothing Saved Yet
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-black/50">
                  Tap the heart on any product to build your personal Nancy edit.
                </p>
                <Link
                  to="/collection"
                  className="mt-8 inline-flex h-14 items-center gap-3 bg-black px-7 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:bg-[#222]"
                >
                  Explore The Collection
                  <FiArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Favorites;
