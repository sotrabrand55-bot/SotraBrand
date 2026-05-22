// controllers/subcatTileController.js
import SubcatTile from "../models/subcatTileModel.js";
import imagekit from "../config/ImageKit.js"; // if you store on ImageKit
// If you store S3/Cloudinary/etc., adapt the upload part accordingly.

export const listTiles = async (req, res) => {
  try {
    const tiles = await SubcatTile.find({});
    res.json({ success: true, tiles });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const addTile = async (req, res) => {
  try {
    const { title, subKey, active, order } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "Image required" });

    // Upload image (ImageKit example)
    const uploaded = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
    });

    const tile = await SubcatTile.create({
      title,
      subKey,
      active: active === "true" || active === true,
      order: Number(order) || 0,
      image: uploaded.url,
    });

    res.json({ success: true, tile });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const updateTile = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!id) return res.status(400).json({ success: false, message: "Missing tile id" });

    const payload = {};
    if (typeof req.body.title !== "undefined") payload.title = req.body.title;
    if (typeof req.body.subKey !== "undefined") payload.subKey = req.body.subKey;
    if (typeof req.body.active !== "undefined")
      payload.active = req.body.active === "true" || req.body.active === true;
    if (typeof req.body.order !== "undefined")
      payload.order = Number(req.body.order);

    // If a new image is provided, upload & replace
    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
      });
      payload.image = uploaded.url;
    }

    const updated = await SubcatTile.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Tile not found" });

    res.json({ success: true, tile: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const removeTile = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "Missing id" });

    const removed = await SubcatTile.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: "Tile not found" });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
