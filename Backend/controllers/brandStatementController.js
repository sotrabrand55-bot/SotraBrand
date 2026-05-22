import imagekit from "../config/ImageKit.js";
import brandStatementModel from "../models/brandStatementModel.js";
import { logError } from "../utils/logger.js";

const defaultBrandStatement = {
  eyebrow: "Levon Craft",
  title: "Proudly Made by Our Brand",
  description:
    "At LEVON, we blend careful craftsmanship with modern perfume design, creating refined scents that celebrate everyday beauty and memorable rituals.",
  buttonText: "Explore More",
  buttonLink: "/Collection",
  image:
    "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1600&q=85",
  imageAlt: "Levon perfume craftsmanship",
  details: [
    {
      title: "Brand Craft",
      text: "Measured details, polished notes.",
    },
    {
      title: "Modern Scent Rituals",
      text: "Designed for daily elegance.",
    },
  ],
  imageEyebrow: "LEVON SIGNATURE",
  imageTitle: "Crafted to feel quiet, lasting, and unmistakably refined.",
  active: true,
  order: 0,
};

const seedDefaultIfEmpty = async () => {
  const count = await brandStatementModel.countDocuments();
  if (count > 0) return;
  await brandStatementModel.create(defaultBrandStatement);
};

const parseDetails = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

const listBrandStatements = async (req, res) => {
  try {
    await seedDefaultIfEmpty();
    const statements = await brandStatementModel
      .find({})
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, statements });
  } catch (error) {
    logError("listBrandStatements", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBrandStatement = async (req, res) => {
  try {
    await seedDefaultIfEmpty();

    const current = await brandStatementModel.findOne({}).sort({
      order: 1,
      createdAt: 1,
    });

    if (!current) {
      return res.status(404).json({ success: false, message: "Brand statement not found" });
    }

    const payload = {};
    [
      "eyebrow",
      "title",
      "description",
      "buttonText",
      "buttonLink",
      "imageAlt",
      "imageEyebrow",
      "imageTitle",
    ].forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    if (req.body.details !== undefined) payload.details = parseDetails(req.body.details);
    if (req.body.active !== undefined) {
      payload.active =
        typeof req.body.active === "boolean"
          ? req.body.active
          : String(req.body.active).toLowerCase() === "true";
    }
    if (req.body.order !== undefined) payload.order = Number(req.body.order || 0);

    if (req.file) {
      const uploaded = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
      });
      payload.image = uploaded.url;
    } else if (req.body.image !== undefined) {
      payload.image = req.body.image;
    }

    const statement = await brandStatementModel.findByIdAndUpdate(
      current._id,
      payload,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Brand statement updated",
      statement,
      statements: [statement],
    });
  } catch (error) {
    logError("updateBrandStatement", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listBrandStatements, updateBrandStatement };
