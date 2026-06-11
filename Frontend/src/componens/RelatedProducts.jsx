/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
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

      setRelated(
        [...(sameFamily.length ? sameFamily : activeProducts)]
          .sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0))
          .slice(0, 4)
      );
    }
  }, [products, category, subCategory, currentId]);

  if (related.length === 0) return null;

  return (
    <section className="pt-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black uppercase leading-tight text-black sm:text-4xl">
          You May Also Like
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
            perfumeTypes={item.perfumeTypes || []}
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
