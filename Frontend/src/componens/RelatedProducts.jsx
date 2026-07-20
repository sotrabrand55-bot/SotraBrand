/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import CollectionProductCard from "./CollectionProductCard";

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
    <section className="pt-6">
      <div className="mb-9 text-center">
        <h2 className="text-[2.6rem] font-black uppercase leading-none text-black sm:text-5xl">
          You May Also Like
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-12 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
        {related.map((item) => (
          <CollectionProductCard key={item._id} product={item} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
