import homepageSectionModel from "../models/homepageSectionModel.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

const sectionDefaults = {
  "luxury-gallery": {
    title: "Luxury Video Gallery",
    preferredSizeNote:
      "Mobile: vertical 9:16 videos/images. Laptop: 4 vertical columns work best.",
  },
  "single-campaign": {
    title: "Single Campaign Video",
    preferredSizeNote:
      "Mobile: 9:16 vertical. Laptop: wide 2:1 media matching the header width.",
  },
  "featured-set-1": {
    title: "Featured Set Picture 1",
    preferredSizeNote:
      "Single image section. Mobile: 9:16 vertical. Laptop: wide 2:1 set image.",
  },
  "featured-set-2": {
    title: "Featured Set Picture 2",
    preferredSizeNote:
      "Single image section. Mobile: 9:16 vertical. Laptop: wide 2:1 set image.",
  },
  "from-the-gram": {
    title: "From The Gram",
    preferredSizeNote:
      "Mobile: vertical 9:16. Laptop: 4 vertical columns with square edges.",
  },
};

const parseBool = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parseItems = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === "object");

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === "object")
      : [];
  } catch {
    return [];
  }
};

const isVideoFile = (file) => String(file?.mimetype || "").startsWith("video/");

const getItemAssets = (items = []) =>
  items.flatMap((item) => [
    { url: item?.src || "", fileId: item?.fileId || "" },
    { url: item?.desktopSrc || "", fileId: item?.desktopFileId || "" },
    { url: item?.poster || "", fileId: item?.posterFileId || "" },
  ]).filter((asset) => asset.url || asset.fileId);

const removedAssets = (previous = [], next = []) => {
  const nextKeys = new Set();
  next.forEach((item) => {
    [item?.src, item?.desktopSrc, item?.poster]
      .filter(Boolean)
      .forEach((url) => nextKeys.add(url));
  });

  return getItemAssets(previous).filter(
    (asset) => asset.url && !nextKeys.has(asset.url)
  );
};

const normalizeSectionItems = async ({ rawItems, files, key }) => {
  const items = parseItems(rawItems);

  for (let index = 0; index < items.length; index += 1) {
    const file = files?.[`itemFile${index}`]?.[0];
    const desktopFile = files?.[`desktopFile${index}`]?.[0];
    const posterFile = files?.[`posterFile${index}`]?.[0];

    const [asset, desktopAsset, posterAsset] = await Promise.all([
      uploadImageKitAsset(file, `${key}-item-${index + 1}`),
      uploadImageKitAsset(desktopFile, `${key}-desktop-${index + 1}`),
      uploadImageKitAsset(posterFile, `${key}-poster-${index + 1}`),
    ]);

    if (asset) {
      items[index].src = asset.url;
      items[index].fileId = asset.fileId;
      if (!items[index].type) items[index].type = isVideoFile(file) ? "video" : "image";
    }

    if (desktopAsset) {
      items[index].desktopSrc = desktopAsset.url;
      items[index].desktopFileId = desktopAsset.fileId;
    }

    if (posterAsset) {
      items[index].poster = posterAsset.url;
      items[index].posterFileId = posterAsset.fileId;
    }

    items[index].id = items[index].id || `${key}-${Date.now()}-${index}`;
    items[index].type = items[index].type === "video" ? "video" : "image";
    items[index].label = items[index].label || items[index].alt || "";
    items[index].alt = items[index].alt || items[index].label || "";
    items[index].buttonLabel =
      items[index].buttonLabel === undefined || items[index].buttonLabel === null
        ? "See Full Set"
        : String(items[index].buttonLabel);
    items[index].productId = items[index].productId || "";
    items[index].order = Number.isFinite(Number(items[index].order))
      ? Number(items[index].order)
      : index;
    items[index].active = parseBool(items[index].active, true);
  }

  return items
    .filter((item) => item.src)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const ensureSection = async (key) =>
  homepageSectionModel.findOneAndUpdate(
    { key },
    {
      $setOnInsert: {
        key,
        ...(sectionDefaults[key] || {}),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const listHomepageSections = async (_req, res) => {
  try {
    await Promise.all(Object.keys(sectionDefaults).map((key) => ensureSection(key)));
    const sections = await homepageSectionModel.find({}).sort({ key: 1 });
    res.json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHomepageSection = async (req, res) => {
  try {
    const section = await ensureSection(req.params.key);
    res.json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertHomepageSection = async (req, res) => {
  try {
    const { key } = req.params;
    const current = await ensureSection(key);

    const nextItems =
      req.body.items !== undefined
        ? await normalizeSectionItems({
            rawItems: req.body.items,
            files: req.files,
            key,
          })
        : current.items;

    if (req.body.items !== undefined) {
      await deleteImageKitAssets(removedAssets(current.items, nextItems));
    }

    const patch = {
      title: req.body.title !== undefined ? String(req.body.title) : current.title,
      active: parseBool(req.body.active, current.active),
      preferredSizeNote:
        req.body.preferredSizeNote !== undefined
          ? String(req.body.preferredSizeNote)
          : current.preferredSizeNote,
      items: nextItems,
    };

    const section = await homepageSectionModel.findOneAndUpdate(
      { key },
      { $set: patch },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeHomepageSection = async (req, res) => {
  try {
    const section = await homepageSectionModel.findOne({ key: req.params.key });
    if (!section) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }

    const cleanup = await deleteImageKitAssets(getItemAssets(section.items));
    await homepageSectionModel.deleteOne({ key: req.params.key });
    res.json({ success: true, imagekit: cleanup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
