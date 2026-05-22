import imagekit from "../config/ImageKit.js";
import scentWardrobeModel from "../models/scentWardrobeModel.js";

const toBool = (value, fallback = true) => {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const toTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch (_) {
    // Fall back to CSV below.
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildLink = ({ targetType, targetValue, linkTo }) => {
  if (targetType === "product" && targetValue) return `/Product/${targetValue}`;
  if (targetType === "category" && targetValue) {
    return `/collection?cat=${encodeURIComponent(targetValue)}`;
  }
  if (targetType === "scentFamily" && targetValue) {
    return `/collection?sub=${encodeURIComponent(targetValue)}&cat=Fragrance`;
  }
  return linkTo || "/collection";
};

export const listScentWardrobe = async (_req, res) => {
  try {
    const moods = await scentWardrobeModel.find({}).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, moods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addScentWardrobe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image required" });
    }

    const uploaded = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
    });

    const targetType = req.body.targetType || "scentFamily";
    const targetValue = req.body.targetValue || "";
    const mood = await scentWardrobeModel.create({
      title: req.body.title,
      description: req.body.description || "",
      image: uploaded.url,
      tags: toTags(req.body.tags),
      targetType,
      targetValue,
      linkTo: buildLink({ targetType, targetValue, linkTo: req.body.linkTo }),
      active: toBool(req.body.active, true),
      order: Number(req.body.order || 0),
    });

    res.json({ success: true, mood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateScentWardrobe = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing mood id" });

    const payload = {};
    if (req.body.title !== undefined) payload.title = req.body.title;
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.tags !== undefined) payload.tags = toTags(req.body.tags);
    if (req.body.targetType !== undefined) payload.targetType = req.body.targetType;
    if (req.body.targetValue !== undefined) payload.targetValue = req.body.targetValue;
    if (req.body.active !== undefined) payload.active = toBool(req.body.active, true);
    if (req.body.order !== undefined) payload.order = Number(req.body.order || 0);

    const targetType = payload.targetType || req.body.targetType;
    const targetValue = payload.targetValue || req.body.targetValue;
    if (targetType !== undefined || targetValue !== undefined || req.body.linkTo !== undefined) {
      payload.linkTo = buildLink({
        targetType: targetType || "custom",
        targetValue: targetValue || "",
        linkTo: req.body.linkTo,
      });
    }

    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
      });
      payload.image = uploaded.url;
    }

    const mood = await scentWardrobeModel.findByIdAndUpdate(id, payload, { new: true });
    if (!mood) return res.status(404).json({ success: false, message: "Mood tile not found" });

    res.json({ success: true, mood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeScentWardrobe = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing mood id" });

    const removed = await scentWardrobeModel.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: "Mood tile not found" });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
