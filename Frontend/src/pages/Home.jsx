import { useEffect } from "react";
import FeaturedProducts from "../componens/FeaturedProducts";
import Hero from "../componens/Hero";
import AvailableNowMarquee from "../componens/AvailableNowMarquee";
import FromTheGram from "../componens/FromTheGram";
import LuxuryVideoGallery from "../componens/LuxuryVideoGallery";
import SingleCampaignVideo from "../componens/SingleCampaignVideo";
import NancyCustomerLetter from "../componens/NancyCustomerLetter";
import FeaturedSetPicture from "../componens/FeaturedSetPicture";
import FeaturedProducts4 from "../componens/FeaturedProducts4";

const HomeSectionGap = ({ compact = false }) => (
  <div
    aria-hidden="true"
    className={`relative left-1/2 w-screen -translate-x-1/2 bg-white ${
      compact ? "h-8 sm:h-10" : "h-10 sm:h-14"
    }`}
  />
);

const Home = () => {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="bg-white px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Hero />

      <AvailableNowMarquee />

      <FeaturedProducts includeVideoGallery={false} />

      <HomeSectionGap />

      <FeaturedSetPicture sectionKey="featured-set-1" />

      <HomeSectionGap compact />

      <FeaturedSetPicture sectionKey="featured-set-2" />

      <HomeSectionGap />

      <LuxuryVideoGallery />

      <HomeSectionGap />

      <FeaturedProducts4 />

      <HomeSectionGap compact />

      <SingleCampaignVideo />
      <FromTheGram />
      <NancyCustomerLetter />

      
    </div>
  );
};

export default Home;
