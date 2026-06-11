import subcategoryPageModel from "../models/subcategoryPageModel.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

const parseBool = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parseDetails = (value) => {
  if (value === undefined || value === null || value === "") return [];
  const raw = Array.isArray(value)
    ? value
    : (() => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

  return raw
    .map((item, index) => ({
      title: String(item?.title || "").trim(),
      text: String(item?.text || "").trim(),
      order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
    }))
    .filter((item) => item.title || item.text)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const parseMedia = (value, fallback = {}) => {
  if (value === undefined || value === null || value === "") return fallback || {};
  if (typeof value === "object" && !Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : fallback || {};
  } catch {
    return fallback || {};
  }
};

const isVideoFile = (file) => String(file?.mimetype || "").startsWith("video/");

export const listSubcategoryPages = async (_req, res) => {
  try {
    const pages = await subcategoryPageModel.find({}).sort({ categoryLabel: 1, subcategoryLabel: 1 });
    res.json({ success: true, pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubcategoryPage = async (req, res) => {
  try {
    const page = await subcategoryPageModel.findOne({ slug: req.params.slug });
    res.json({ success: true, page: page || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertSubcategoryPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const current = await subcategoryPageModel.findOne({ slug });
    const existingMedia = current?.media || {};
    const media = parseMedia(req.body.media, existingMedia);
    const file = req.files?.mediaFile?.[0];
    const uploaded = await uploadImageKitAsset(file, `${slug}-campaign`);

    if (uploaded) {
      if (existingMedia?.src && existingMedia.src !== uploaded.url) {
        await deleteImageKitAssets([
          { url: existingMedia.src, fileId: existingMedia.fileId || "" },
        ]);
      }
      media.src = uploaded.url;
      media.fileId = uploaded.fileId;
      media.type = isVideoFile(file) ? "video" : "image";
    }

    media.type = media.type === "video" ? "video" : "image";
    media.alt = media.alt || req.body.subcategoryLabel || "";

    const page = await subcategoryPageModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          slug,
          categoryLabel:
            req.body.categoryLabel !== undefined
              ? String(req.body.categoryLabel)
              : current?.categoryLabel || "",
          subcategoryLabel:
            req.body.subcategoryLabel !== undefined
              ? String(req.body.subcategoryLabel)
              : current?.subcategoryLabel || "",
          featuredProductId:
            req.body.featuredProductId !== undefined
              ? String(req.body.featuredProductId)
              : current?.featuredProductId || "",
          advice:
            req.body.advice !== undefined
              ? String(req.body.advice)
              : current?.advice || "",
          details:
            req.body.details !== undefined
              ? parseDetails(req.body.details)
              : current?.details || [],
          media,
          active: parseBool(req.body.active, current?.active ?? true),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
