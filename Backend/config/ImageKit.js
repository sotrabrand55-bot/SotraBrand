import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ✅ Correct way to initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default imagekit;