import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory, currentId }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const activeProducts = products
        .filter((item) => item.active !== false)
        .filter((item) => item._id !== currentId)
        .filter((item) => item.category === category);

      const sameFamily = activeProducts.filter(
        (item) => item.subCategory === subCategory
      );

      setRelated((sameFamily.length ? sameFamily : activeProducts).slice(0, 4));
    }
  }, [products, category, subCategory, currentId]);

  if (related.length === 0) return null;

  return (
    <section className="pt-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex w-fit items-center gap-3 text-[#c49a5e]">
          <span className="h-px w-10 bg-current" />
          <span className="h-2.5 w-2.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8068]">
          You May Also Like
        </p>
        <h2 className="mt-3 font-serif text-4xl leading-none text-[#1f1b17]">
          Related Products
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {related.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            discountPrice={item.discountPrice}
            onSales={item.onSales}
            outOfStock={item.outOfStock}
            colors={[]}
            sizes={item.sizes || []}
            category={item.category}
            subCategory={item.subCategory}
            concentration={item.concentration}
            stock={item.stock}
            image={item.image || item.image1}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
