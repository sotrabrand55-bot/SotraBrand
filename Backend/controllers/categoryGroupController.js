import categoryGroupModel from "../models/categoryGroupModel.js";
import {
  deleteImageKitAssets,
  uploadImageKitAsset,
} from "../utils/imagekitCleanup.js";

const defaultCategoryGroups = [
  { label: "Abaya", children: ["Abaya"] },
  { label: "Dresses", children: ["Dresses"] },
  { label: "Hijabs", children: ["Hijabs"] },
  { label: "Islamic Essentials", children: ["Islamic Essentials"] },
  { label: "Blouses", children: ["Blouses"] },
];

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseBool = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parseGroups = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeGroups = (groups = []) =>
  groups
    .map((group, groupIndex) => {
      const label = String(group?.label || "").replace(/\s+/g, " ").trim();
      if (!label) return null;

      const children = (Array.isArray(group.children) ? group.children : [])
        .map((child, childIndex) => {
          const childLabel =
            typeof child === "string"
              ? child
              : String(child?.label || "").replace(/\s+/g, " ").trim();
          if (!childLabel) return null;
          return {
            label: childLabel,
            slug: slugify(child?.slug || childLabel),
            active: parseBool(child?.active, true),
            order: Number.isFinite(Number(child?.order)) ? Number(child.order) : childIndex,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        label,
        slug: slugify(group?.slug || label),
        image: String(group?.image || "").trim(),
        imageFileId: String(group?.imageFileId || "").trim(),
        active: parseBool(group?.active, true),
        order: Number.isFinite(Number(group?.order)) ? Number(group.order) : groupIndex,
        children,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const seedDefaultGroupsIfEmpty = async () => {
  const count = await categoryGroupModel.countDocuments();
  if (count > 0) return;

  await categoryGroupModel.insertMany(
    normalizeGroups(defaultCategoryGroups),
    { ordered: false }
  ).catch(() => {});
};

export const listCategoryGroups = async (_req, res) => {
  try {
    await seedDefaultGroupsIfEmpty();
    const groups = await categoryGroupModel.find({}).sort({ order: 1, label: 1 });
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveCategoryGroups = async (req, res) => {
  try {
    const previousGroups = await categoryGroupModel.find({}).lean();
    const previousByKey = new Map(
      previousGroups.flatMap((group) => [
        [group.slug, group],
        [String(group.label || "").toLowerCase(), group],
      ])
    );
    const groups = normalizeGroups(parseGroups(req.body.groups));
    if (!groups.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one category group is required" });
    }

    const removedAssets = [];
    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index];
      const previous =
        previousByKey.get(group.slug) ||
        previousByKey.get(String(group.label || "").toLowerCase());
      const file = req.files?.[`groupImage${index}`]?.[0];
      if (file?.buffer) {
        const asset = await uploadImageKitAsset(file, `category-${group.slug || index}`);
        if (asset) {
          if (previous?.image || previous?.imageFileId) {
            removedAssets.push({ url: previous.image, fileId: previous.imageFileId });
          }
          group.image = asset.url;
          group.imageFileId = asset.fileId;
        }
      } else if (!group.image && previous?.image) {
        group.image = previous.image;
        group.imageFileId = previous.imageFileId || "";
      }
    }

    const nextImageKeys = new Set(groups.map((group) => group.image).filter(Boolean));
    previousGroups.forEach((group) => {
      if (group.image && !nextImageKeys.has(group.image)) {
        removedAssets.push({ url: group.image, fileId: group.imageFileId });
      }
    });
    await deleteImageKitAssets(removedAssets);

    await categoryGroupModel.deleteMany({});
    await categoryGroupModel.insertMany(groups, { ordered: true });
    const saved = await categoryGroupModel.find({}).sort({ order: 1, label: 1 });

    res.json({ success: true, groups: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreCategoryGroups = async (_req, res) => {
  try {
    await categoryGroupModel.deleteMany({});
    await categoryGroupModel.insertMany(normalizeGroups(defaultCategoryGroups), {
      ordered: true,
    });
    const groups = await categoryGroupModel.find({}).sort({ order: 1, label: 1 });
    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
