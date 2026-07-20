import { useContext, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import FeaturedProducts from "../componens/FeaturedProducts";
import RelatedProducts from "../componens/RelatedProducts";
import { FeaturedProductSkeleton } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";

const Product = () => {
  const { productId } = useParams();
  const { products, productsLoading } = useContext(ShopContext);

  const product = useMemo(
    () =>
      (products || []).find(
        (item) =>
          String(item?._id) === String(productId) && item?.active !== false
      ),
    [productId, products]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  if (productsLoading) {
    return (
      <main className="min-h-screen bg-white">
        <FeaturedProductSkeleton />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-white px-5 py-20 text-center text-black">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
          SotraBrand
        </p>
        <h1 className="mt-4 font-serif text-5xl">Product not found</h1>
        <Link
          to="/collection"
          className="mt-8 inline-flex items-center gap-3 border-b border-black pb-1 text-sm uppercase tracking-[0.16em]"
        >
          View Collection
          <FiArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <FeaturedProducts
        productsOverride={[product]}
        includeVideoGallery={false}
        hideFullDetails
        showNavigation={false}
        showSetContents
        sectionId={`product-${product._id}`}
        ariaLabel={`${product.name} product details`}
      />

      <section className="border-t border-black/10 bg-white px-4 pb-16 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <div className="mx-auto max-w-[1480px]">
          <RelatedProducts
            category={product.category}
            subCategory={product.subCategory}
            currentId={product._id}
          />
        </div>
      </section>
    </main>
  );
};

export default Product;
