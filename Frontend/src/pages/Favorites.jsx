import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ProductItem from "../componens/ProductItem";
import { ShopContext } from "../context/ShopContext";

const Favorites = () => {
  const { products, favoriteItems } = useContext(ShopContext);
  const favoriteProducts = (products || []).filter((item) =>
    favoriteItems.includes(item._id)
  );

  return (
    <main className="min-h-screen bg-[#fffaf4] px-4 py-12 text-[#1f1b17] sm:px-[5vw] md:px-[7vw] lg:px-[3vw]">
      <section className="mx-auto max-w-[1480px]">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
            <span className="h-px w-10 bg-current" />
            <span className="h-2.5 w-2.5 rotate-45 bg-current" />
            <span className="h-px w-10 bg-current" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
            Saved Scents
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">
            Favorites
          </h1>
          <p className="mt-5 text-sm leading-7 text-[#7d6756] sm:text-base">
            Your saved Levon perfumes and gift edits in one quiet place.
          </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {favoriteProducts.map((item) => (
              <ProductItem
                key={item._id}
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
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-xl rounded-md border border-[#eadfce] bg-[#fffdf9] px-6 py-14 text-center shadow-[0_14px_34px_rgba(43,32,22,0.05)]">
            <p className="font-serif text-3xl">No favorites yet</p>
            <p className="mt-3 text-sm leading-7 text-[#7d6756]">
              Tap the heart on a product to save it here.
            </p>
            <Link
              to="/collection"
              className="mt-7 inline-flex rounded-full bg-[#1f1b17] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
            >
              Explore Collection
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default Favorites;
