import scentFamilyModel from "../models/scentFamilyModel.js";
import { logError } from "../utils/logger.js";

const defaultScentFamilies = [
  "Elegant Edit",
  "Everyday Modesty",
  "Occasion Wear",
  "Soft Essentials",
  "Layering Pieces",
];

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeName = (value = "") =>
  String(value).replace(/\s+/g, " ").trim();

const seedDefaultsIfEmpty = async () => {
  const count = await scentFamilyModel.countDocuments();
  if (count > 0) return;

  await scentFamilyModel.insertMany(
    defaultScentFamilies.map((name, index) => ({
      name,
      slug: slugify(name),
      category: "SotraBrand",
      active: true,
      order: index,
    })),
    { ordered: false }
  ).catch(() => {});
};

const listScentFamilies = async (req, res) => {
  try {
    await seedDefaultsIfEmpty();
    const families = await scentFamilyModel
      .find({})
      .sort({ order: 1, name: 1 });

    res.json({ success: true, families });
  } catch (error) {
    logError("listScentFamilies", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addScentFamily = async (req, res) => {
  try {
    const name = normalizeName(req.body.name);
    if (!name) {
      return res.json({ success: false, message: "Scent family name is required" });
    }

    const slug = slugify(name);
    const existing = await scentFamilyModel.findOne({ slug });
    if (existing) {
      return res.json({
        success: true,
        message: "Scent family already exists",
        family: existing,
      });
    }

    const count = await scentFamilyModel.countDocuments();
    const family = await scentFamilyModel.create({
      name,
      slug,
      category: req.body.category || "Fragrance",
      active: req.body.active === undefined ? true : String(req.body.active) === "true",
      order: Number.isFinite(Number(req.body.order)) ? Number(req.body.order) : count,
    });

    res.status(201).json({
      success: true,
      message: "Scent family added",
      family,
    });
  } catch (error) {
    logError("addScentFamily", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeScentFamily = async (req, res) => {
  try {
    const { id, name } = req.body;
    let deleted = null;

    if (id) {
      deleted = await scentFamilyModel.findByIdAndDelete(id);
    } else if (name) {
      deleted = await scentFamilyModel.findOneAndDelete({ slug: slugify(name) });
    }

    if (!deleted) {
      return res.json({ success: false, message: "Scent family not found" });
    }

    res.json({ success: true, message: "Scent family removed", family: deleted });
  } catch (error) {
    logError("removeScentFamily", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const restoreDefaultScentFamilies = async (req, res) => {
  try {
    const restored = [];

    for (const [index, name] of defaultScentFamilies.entries()) {
      const slug = slugify(name);
      const family = await scentFamilyModel.findOneAndUpdate(
        { slug },
        {
          name,
          slug,
          category: "Fragrance",
          active: true,
          order: index,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      restored.push(family);
    }

    res.json({
      success: true,
      message: "Default scent families restored",
      families: restored,
    });
  } catch (error) {
    logError("restoreDefaultScentFamilies", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  listScentFamilies,
  addScentFamily,
  removeScentFamily,
  restoreDefaultScentFamilies,
};
