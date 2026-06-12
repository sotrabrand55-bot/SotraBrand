import { useEffect } from "react";
import FeaturedProducts from "../componens/FeaturedProducts";
import FeaturedProducts2 from "../componens/FeaturedProducts2";
import FeaturedProducts3 from "../componens/FeaturedProducts3";
import FeaturedProducts4 from "../componens/FeaturedProducts4";
import Hero from "../componens/Hero";
import AvailableNowMarquee from "../componens/AvailableNowMarquee";
import FromTheGram from "../componens/FromTheGram";
import LuxuryVideoGallery from "../componens/LuxuryVideoGallery";
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

      <FeaturedProducts includeVideoGallery={false} />

      <FeaturedProducts2 />

      <FeaturedProducts3 />

      <LuxuryVideoGallery />

      <FeaturedProducts4 />

      <SingleCampaignVideo />
      <FromTheGram />
      <NancyCustomerLetter />

      
    </div>
  );
};

export default Home;
