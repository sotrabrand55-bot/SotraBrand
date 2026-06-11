import { useEffect } from "react";
import FeaturedProducts from "../componens/FeaturedProducts";
import FeaturedProducts2 from "../componens/FeaturedProducts2";
import Hero from "../componens/Hero";
import AvailableNowMarquee from "../componens/AvailableNowMarquee";
import FromTheGram from "../componens/FromTheGram";
import SingleCampaignVideo from "../componens/SingleCampaignVideo";
import NancyCustomerLetter from "../componens/NancyCustomerLetter";

const Home = () => {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="bg-white px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Hero />

      <AvailableNowMarquee />

      <FeaturedProducts />

      <FeaturedProducts2 />
      <SingleCampaignVideo />
      <FromTheGram />
      <NancyCustomerLetter />

      
    </div>
  );
};

export default Home;
