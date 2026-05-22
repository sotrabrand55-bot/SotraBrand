import { useEffect } from "react";
import ScentWardrobe from "../componens/ScentWardrobe";
import BestSeller from "../componens/BestSeller";
import OnSale from "../componens/OnSale";
import GiftSetsPreview from "../componens/GiftSetsPreview";
import NewArrivals from "../componens/NewArrivals";
import Hero from "../componens/Hero";
import BrandStatement from "../componens/BrandStatement";
import FullWidth from "../componens/FullWidth";

const homeSectionBg = "#fffaf4";

const Home = () => {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="space-y-4 bg-[#fffaf4] px-4 sm:space-y-6 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Hero />

      <NewArrivals />

      <GiftSetsPreview />

      <FullWidth bg={homeSectionBg} id="on-sale">
        <OnSale />
      </FullWidth>

      <FullWidth bg={homeSectionBg} id="scent-wardrobe">
        <ScentWardrobe />
      </FullWidth>
       <BrandStatement />
      <FullWidth bg={homeSectionBg} id="best-seller">
        <BestSeller />
      </FullWidth>

      
    </div>
  );
};

export default Home;
