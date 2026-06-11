import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";
import FeaturedProducts from "../componens/FeaturedProducts";
import ProductReviewPanel from "../componens/ProductReviewPanel";
import SubcategoryCampaignMedia from "../componens/SubcategoryCampaignMedia";
import SubcategoryProductResults from "../componens/SubcategoryProductResults";
import { FeaturedProductSkeleton } from "../componens/Skeletons";
import { ShopContext } from "../context/ShopContext";
import {
  getSubcategoryBySlugFromGroups,
  productMatchesSubcategory,
  subcategoryGroups as fallbackSubcategoryGroups,
} from "../lib/subcategoryCatalog";

const emptySubcategoryPageData = {
  advice: "",
  details: [],
  media: { type: "image", src: "", label: "" },
  featuredProductId: "",
};

const SubcategoryProducts = () => {
  const { slug } = useParams();
  const { products, productsLoading, categoryGroups, backendUrl } = useContext(ShopContext);
  const subcategory = getSubcategoryBySlugFromGroups(
    slug,
    categoryGroups?.length ? categoryGroups : fallbackSubcategoryGroups
  );
  const [livePageData, setLivePageData] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const filteredProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (product) =>
            product?.active !== false && productMatchesSubcategory(product, subcategory)
        )
        .sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0)),
    [products, subcategory]
  );

  const pageData = useMemo(() => {
    if (!livePageData) return emptySubcategoryPageData;
    return {
      advice: livePageData.advice || "",
      details: livePageData.details?.length
        ? livePageData.details.map((item) => [item.title, item.text])
        : [],
      media: livePageData.media?.src ? livePageData.media : emptySubcategoryPageData.media,
      featuredProductId: livePageData.featuredProductId || "",
    };
  }, [livePageData]);

  const featuredProduct = useMemo(() => {
    if (!filteredProducts.length) return null;
    return (
      filteredProducts.find((product) => product._id === pageData.featuredProductId) ||
      filteredProducts[0]
    );
  }, [filteredProducts, pageData.featuredProductId]);

  const resultProducts = useMemo(
    () =>
      filteredProducts
        .filter((product) => product._id !== featuredProduct?._id)
        .sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0)),
    [featuredProduct?._id, filteredProducts]
  );

  const fallbackResultProducts = useMemo(
    () =>
      (products || [])
        .filter(
          (product) =>
            product?.active !== false &&
            product._id !== featuredProduct?._id &&
            !productMatchesSubcategory(product, subcategory)
        )
        .sort((a, b) => Number(b?.date || 0) - Number(a?.date || 0)),
    [featuredProduct?._id, products, subcategory]
  );

  const shelfProducts = resultProducts.length ? resultProducts : fallbackResultProducts;

  useEffect(() => {
    let alive = true;

    const loadPageData = async () => {
      if (!backendUrl || !slug) return;
      try {
        const response = await fetch(`${backendUrl}/api/subcategory-pages/${slug}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (alive) setLivePageData(data?.success ? data.page : null);
      } catch {
        if (alive) setLivePageData(null);
      }
    };

    loadPageData();
    const interval = window.setInterval(loadPageData, 5000);
    window.addEventListener("focus", loadPageData);
    return () => {
      alive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadPageData);
    };
  }, [backendUrl, slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setDetailsOpen(true);
    setReviewsOpen(false);
  }, [slug]);

  if (!subcategory) {
    return (
      <main className="min-h-[65vh] bg-white px-5 py-20 text-center text-black">
        <h1 className="font-serif text-5xl">Category not found</h1>
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
      <header className="border-b border-black/15 px-5 py-10 text-center sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
          {subcategory.groupLabel}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight sm:text-6xl">
          {subcategory.label}
        </h1>
        <p className="mt-3 text-sm text-black/50">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </p>
      </header>

      {productsLoading ? (
        <FeaturedProductSkeleton />
      ) : filteredProducts.length && featuredProduct ? (
        <>
          <FeaturedProducts
            productsOverride={[featuredProduct]}
            includeVideoGallery={false}
            showSocialProof
            showNavigation={false}
            sectionId={`subcategory-${subcategory.slug}`}
            ariaLabel={`${subcategory.label} featured product`}
          />

          <section className="bg-white px-5 pb-10 pt-3 sm:px-8 lg:px-12 lg:pb-16">
            <div className="mx-auto max-w-5xl border-y border-black/35">
              <div className="py-8 sm:py-10">
                <p className="text-xl font-light uppercase tracking-[0.08em] text-black/55 sm:text-2xl">
                  Nancy&apos;s Advice
                </p>
                <p className="mt-6 text-lg font-light leading-9 text-black/80 sm:text-xl sm:leading-10">
                  {pageData.advice}
                </p>
              </div>

              <div className="border-t border-black/35">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((open) => !open)}
                  className="flex w-full items-center justify-between py-6 text-left"
                  aria-expanded={detailsOpen}
                >
                  <span className="text-xl font-black uppercase tracking-[0.04em] sm:text-2xl">
                    Details
                  </span>
                  {detailsOpen ? <FiMinus className="h-5 w-5" /> : <FiPlus className="h-5 w-5" />}
                </button>

                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                    detailsOpen
                      ? "grid-rows-[1fr] pb-8 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="min-h-0 space-y-4 overflow-hidden pl-6 text-base leading-7 text-black/80 sm:text-lg sm:leading-8">
                    {pageData.details.map(([title, text]) => (
                      <li key={title} className="list-disc pl-1">
                        <strong className="font-black text-black">{title}:</strong>{" "}
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-black/35">
                <button
                  type="button"
                  onClick={() => setReviewsOpen((open) => !open)}
                  className="flex w-full items-center justify-between py-6 text-left"
                  aria-expanded={reviewsOpen}
                >
                  <span className="text-xl font-black uppercase tracking-[0.04em] sm:text-2xl">
                    Rating & Reviews
                  </span>
                  {reviewsOpen ? <FiMinus className="h-5 w-5" /> : <FiPlus className="h-5 w-5" />}
                </button>

                <div
                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
                    reviewsOpen
                      ? "grid-rows-[1fr] pb-7 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <ProductReviewPanel product={featuredProduct} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <SubcategoryCampaignMedia media={pageData.media} />

          <SubcategoryProductResults
            products={shelfProducts}
            subcategory={subcategory}
            title={resultProducts.length ? subcategory.label : "Best Paired With"}
          />
        </>
      ) : (
        <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
            {subcategory.groupLabel}
          </p>
          <h2 className="mt-4 font-serif text-4xl">Products coming soon</h2>
          <p className="mt-4 text-sm leading-7 text-black/55">
            This page is ready and will automatically show products assigned to{" "}
            {subcategory.label}.
          </p>
          <Link
            to="/collection"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
          >
            View Collection
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}
    </main>
  );
};

export default SubcategoryProducts;
