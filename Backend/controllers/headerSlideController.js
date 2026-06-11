import HeaderSlide from "../models/headerSlideModel.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

const publicSlide = (slide) => {
  const item = typeof slide?.toObject === "function" ? slide.toObject() : slide;
  if (!item) return item;
  const { title, blurb, badges, ...headerMedia } = item;
  return headerMedia;
};

export const addSlide = async (req, res) => {
  try {
    const { order = 0, active = "true" } = req.body;
    const mobileFile = req.files?.image?.[0];
    const desktopFile = req.files?.desktopImage?.[0];

    if (!mobileFile?.buffer) {
      return res.status(400).json({ success: false, message: "Mobile image required" });
    }

    const [imageAsset, desktopAsset] = await Promise.all([
      uploadImageKitAsset(mobileFile, "header-mobile"),
      uploadImageKitAsset(desktopFile, "header-desktop"),
    ]);

    const slide = await HeaderSlide.create({
      image: imageAsset?.url || "",
      imageFileId: imageAsset?.fileId || "",
      desktopImage: desktopAsset?.url || "",
      desktopImageFileId: desktopAsset?.fileId || "",
      order: Number(order),
      active: active === "true",
    });

    res.json({ success: true, slide: publicSlide(slide) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listSlides = async (_req, res) => {
  try {
    const slides = await HeaderSlide.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, slides: slides.map(publicSlide) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const current = await HeaderSlide.findById(id);
    if (!current) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    const patch = {};
    const { order, active, clearDesktopImage } = req.body;

    if (order !== undefined) patch.order = Number(order);
    if (active !== undefined) patch.active = active === "true";
    if (clearDesktopImage === "true") {
      await deleteImageKitAssets([
        { url: current.desktopImage, fileId: current.desktopImageFileId },
      ]);
      patch.desktopImage = "";
      patch.desktopImageFileId = "";
    }

    const [imageAsset, desktopAsset] = await Promise.all([
      uploadImageKitAsset(req.files?.image?.[0], "header-mobile"),
      uploadImageKitAsset(req.files?.desktopImage?.[0], "header-desktop"),
    ]);
    if (imageAsset) {
      await deleteImageKitAssets([{ url: current.image, fileId: current.imageFileId }]);
      patch.image = imageAsset.url;
      patch.imageFileId = imageAsset.fileId;
    }
    if (desktopAsset) {
      await deleteImageKitAssets([
        { url: current.desktopImage, fileId: current.desktopImageFileId },
      ]);
      patch.desktopImage = desktopAsset.url;
      patch.desktopImageFileId = desktopAsset.fileId;
    }

    const updated = await HeaderSlide.findByIdAndUpdate(id, patch, { new: true });

    res.json({ success: true, slide: publicSlide(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeaderSlide.findById(id);
    if (!slide) {
      return res.status(404).json({ success: false, message: "Slide not found" });
    }

    const cleanup = await deleteImageKitAssets([
      { url: slide.image, fileId: slide.imageFileId },
      { url: slide.desktopImage, fileId: slide.desktopImageFileId },
    ]);

    await HeaderSlide.findByIdAndDelete(id);
    res.json({ success: true, imagekit: cleanup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
