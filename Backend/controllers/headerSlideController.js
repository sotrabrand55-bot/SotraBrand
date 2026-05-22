// controllers/headerSlideController.js
import HeaderSlide from "../models/headerSlideModel.js";
import imagekit from "../config/ImageKit.js"; // <-- same client you use for subcatTile

const parseBadges = (value) => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (value === undefined || value === null || value === "") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated text so admin edits stay forgiving.
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const addSlide = async (req, res) => {
  try {
    const { title, blurb = "", badges = "[]", order = 0, active = "true" } = req.body;

    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: "Image required" });
    }

    // upload to ImageKit
    const uploadRes = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname || `header-${Date.now()}.jpg`,
    });

    const slide = await HeaderSlide.create({
      image: uploadRes.url,               // ✅ store ImageKit URL
      title,
      blurb,
      badges: parseBadges(badges),
      order: Number(order),
      active: active === "true",
    });

    res.json({ success: true, slide });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listSlides = async (req, res) => {
  try {
    const slides = await HeaderSlide.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, slides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = {};
    const { title, blurb, badges, order, active } = req.body;

    if (title !== undefined) patch.title = title;
    if (blurb !== undefined) patch.blurb = blurb;
    if (badges !== undefined) patch.badges = parseBadges(badges);
    if (order !== undefined) patch.order = Number(order);
    if (active !== undefined) patch.active = active === "true";

    // if a new image is provided, upload to ImageKit
    if (req.file?.buffer) {
      const uploadRes = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname || `header-${Date.now()}.jpg`,
      });
      patch.image = uploadRes.url;        // ✅ replace with ImageKit URL
    }

    const updated = await HeaderSlide.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Slide not found" });

    res.json({ success: true, slide: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeaderSlide.findById(id);
    if (!slide) return res.status(404).json({ success: false, message: "Slide not found" });

    // (Optional) you can delete from ImageKit using fileId if you store it.
    // For now we just remove DB record.
    await HeaderSlide.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
