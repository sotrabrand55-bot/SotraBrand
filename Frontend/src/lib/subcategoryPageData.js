import bodyCareLineup from "../assets/nancy-products/body-care-lineup.jpeg";
import bodyLotionTexture from "../assets/nancy-products/body-lotion-texture.jpeg";
import bodyOilBenefits from "../assets/nancy-products/body-oil-benefits.jpeg";
import bodySplashCampaign from "../assets/nancy-products/body-splash-campaign.jpeg";
import dailyRitual from "../assets/nancy-products/daily-ritual.jpeg";
import nancyVideo1 from "../assets/videos/nancy-video-1.mp4";
import nancyVideo2 from "../assets/videos/nancy-video-2.mp4";
import nancyVideo3 from "../assets/videos/nancy-video-3.mp4";
import nancyVideo4 from "../assets/videos/nancy-video-4.mp4";

const sharedDetails = {
  finish: "Leaves skin feeling soft, comfortable, and beautifully scented.",
  ritual: "Designed to layer easily with the rest of your Be Radiant ritual.",
  use: "Apply to clean skin and enjoy throughout the day.",
};

export const subcategoryPageData = {
  "pheromone-touch": {
    advice:
      "Wear Pheromone Touch as your final confidence layer. Apply it where you naturally feel warmth, then let the scent settle into your skin before adding more.",
    details: [
      ["Signature trail", "A soft feminine scent designed to feel personal and memorable."],
      ["Layering ritual", sharedDetails.ritual],
      ["How to use", sharedDetails.use],
    ],
    media: { type: "image", src: bodyCareLineup, label: "Pheromone Touch body-care ritual" },
  },
  "body-lotion-pheromone": {
    advice:
      "Massage the lotion slowly into slightly damp skin after your shower. This helps lock in softness and gives the pheromone scent a smoother, longer-lasting base.",
    details: [
      ["Hydrating feel", "Comforting daily moisture without a heavy finish."],
      ["Best paired with", "Body Oil Pheromone on dry areas and Body Splash Pheromone on top."],
      ["Finish", sharedDetails.finish],
    ],
    media: { type: "video", src: nancyVideo1, label: "Body Lotion Pheromone campaign video" },
  },
  "body-oil-pheromone": {
    advice:
      "Warm a small amount between your palms, then press it over shoulders, arms, and legs. Use it alone for glow or over lotion when your skin needs a richer finish.",
    details: [
      ["Silky glow", "Adds a polished-looking glow while keeping the ritual lightweight."],
      ["Target areas", "Ideal for shoulders, collarbones, arms, and legs."],
      ["Layering ritual", sharedDetails.ritual],
    ],
    media: { type: "image", src: bodyOilBenefits, label: "Body Oil Pheromone benefits" },
  },
  "body-splash-pheromone": {
    advice:
      "Mist generously after moisturizing and refresh whenever you want a soft boost. Spray from a little distance so the fragrance settles evenly over skin and clothes.",
    details: [
      ["Fresh mist", "A light body mist made for effortless daily refreshes."],
      ["Application", "Mist over pulse points, skin, or clothes from a comfortable distance."],
      ["Best paired with", "Body Lotion Pheromone for a more lasting scent trail."],
    ],
    media: { type: "video", src: nancyVideo2, label: "Body Splash Pheromone campaign video" },
  },
  "body-scrub-pheromone": {
    advice:
      "Use gentle circular motions and let the scrub do the work. Focus on elbows, knees, and dry areas, then rinse before applying lotion or oil.",
    details: [
      ["Smoothing ritual", "Helps prepare skin for a softer, more even body-care finish."],
      ["How often", "Use one to two times weekly or whenever skin needs refreshing."],
      ["After care", "Follow with Body Lotion or Body Oil Pheromone."],
    ],
    media: { type: "image", src: bodyLotionTexture, label: "Body Scrub Pheromone texture" },
  },
  "mystique-parfum": {
    advice:
      "Give Mystique Parfum a moment to unfold. Apply lightly to pulse points and avoid rubbing, allowing every note to develop naturally on your skin.",
    details: [
      ["Concentrated scent", "A refined parfum ritual with an expressive lasting trail."],
      ["Pulse points", "Apply to wrists, neck, and behind the ears."],
      ["Nancy's tip", "Start lightly, then build only after the scent has settled."],
    ],
    media: { type: "video", src: nancyVideo3, label: "Mystique Parfum campaign video" },
  },
  "body-lotion-mystique": {
    advice:
      "Use Mystique lotion as the scented base of your routine. Smooth it over clean skin before parfum so the fragrance feels softer, richer, and more connected.",
    details: [
      ["Daily moisture", "A smooth body lotion made for a comfortable scented ritual."],
      ["Best paired with", "Mystique Parfum or Body Splash Mystique."],
      ["Finish", sharedDetails.finish],
    ],
    media: { type: "image", src: dailyRitual, label: "Body Lotion Mystique daily ritual" },
  },
  "body-splash-mystique": {
    advice:
      "Keep Mystique Body Splash close for effortless refreshes. Mist after lotion for depth or wear it alone when you want the scent to feel airy and relaxed.",
    details: [
      ["Airy fragrance", "A lighter way to enjoy the Mystique scent throughout the day."],
      ["Refresh ritual", "Reapply whenever you want to revive the fragrance."],
      ["Best paired with", "Body Lotion Mystique for a longer-lasting base."],
    ],
    media: { type: "video", src: nancyVideo4, label: "Body Splash Mystique campaign video" },
  },
  "radiant-charm": {
    advice:
      "Roll Radiant Charm directly onto pulse points and carry it with you. Its compact format is perfect for quiet, precise refreshes whenever you need them.",
    details: [
      ["Precise application", "The roll-on format puts the scent exactly where you want it."],
      ["Travel friendly", "Compact and easy to keep in your everyday bag."],
      ["How to use", "Roll onto wrists, neck, or behind the ears as needed."],
    ],
    media: { type: "image", src: bodySplashCampaign, label: "Radiant Charm campaign" },
  },
};

export const getSubcategoryPageData = (slug) =>
  subcategoryPageData[slug] || subcategoryPageData["pheromone-touch"];
