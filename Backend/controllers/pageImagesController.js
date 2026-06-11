import pageImagesModel from "../models/pageImagesModel.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

const defaultImages = {
  key: "main",
  aboutImage: "",
  aboutImageFileId: "",
  aboutImageAlt: "Be Radiant by Nancy collection",
  contactImage: "",
  contactImageFileId: "",
  contactImageAlt: "Be Radiant by Nancy contact",
};

const getOrCreatePageImages = async () => {
  let pageImages = await pageImagesModel.findOne({ key: "main" });
  if (!pageImages) {
    pageImages = await pageImagesModel.create(defaultImages);
  }
  return pageImages;
};

export const getPageImages = async (_req, res) => {
  try {
    const pageImages = await getOrCreatePageImages();
    res.json({ success: true, pageImages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePageImages = async (req, res) => {
  try {
    const pageImages = await getOrCreatePageImages();
    const payload = {};

    if (req.body.aboutImage !== undefined) payload.aboutImage = req.body.aboutImage;
    if (req.body.contactImage !== undefined) payload.contactImage = req.body.contactImage;
    if (req.body.aboutImageAlt !== undefined) payload.aboutImageAlt = req.body.aboutImageAlt;
    if (req.body.contactImageAlt !== undefined) payload.contactImageAlt = req.body.contactImageAlt;

    const uploads = [
      { field: "aboutImage", target: "aboutImage", fileIdTarget: "aboutImageFileId" },
      { field: "contactImage", target: "contactImage", fileIdTarget: "contactImageFileId" },
    ];

    for (const item of uploads) {
      const file = req.files?.[item.field]?.[0];
      if (file) {
        const uploaded = await uploadImageKitAsset(file, item.field);
        await deleteImageKitAssets([
          { url: pageImages[item.target], fileId: pageImages[item.fileIdTarget] },
        ]);
        payload[item.target] = uploaded.url;
        payload[item.fileIdTarget] = uploaded.fileId;
      }
    }

    const updated = await pageImagesModel.findByIdAndUpdate(pageImages._id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Page images updated",
      pageImages: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
