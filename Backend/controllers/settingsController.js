import siteSettingsModel from "../models/siteSettingsModel.js";

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const parseStringList = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Comma-separated text is accepted for quick admin edits.
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getSettingsDoc = async () =>
  siteSettingsModel.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

export const getSiteSettings = async (_req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const current = await getSettingsDoc();
    const {
      delivery_fee,
      announcementEnabled,
      announcementItems,
      freeShippingEnabled,
      freeShippingText,
      availableNowText,
      brandEmail,
      brandPhone,
      socialLinks,
    } = req.body;

    const patch = {};
    if (delivery_fee !== undefined) {
      const nextFee = Number(delivery_fee);
      if (!Number.isFinite(nextFee) || nextFee < 0) {
        return res
          .status(400)
          .json({ success: false, message: "delivery_fee must be a positive number" });
      }
      patch.delivery_fee = nextFee;
    }
    if (announcementEnabled !== undefined) {
      patch.announcementEnabled = parseBool(announcementEnabled, current.announcementEnabled);
    }
    if (announcementItems !== undefined) {
      patch.announcementItems = parseStringList(
        announcementItems,
        current.announcementItems
      );
    }
    if (freeShippingEnabled !== undefined) {
      patch.freeShippingEnabled = parseBool(
        freeShippingEnabled,
        current.freeShippingEnabled
      );
    }
    if (freeShippingText !== undefined) patch.freeShippingText = String(freeShippingText);
    if (availableNowText !== undefined) patch.availableNowText = String(availableNowText);
    if (brandEmail !== undefined) patch.brandEmail = String(brandEmail).trim();
    if (brandPhone !== undefined) patch.brandPhone = String(brandPhone).trim();
    if (socialLinks !== undefined) {
      let nextSocialLinks = socialLinks;
      if (typeof socialLinks === "string") {
        try {
          nextSocialLinks = JSON.parse(socialLinks);
        } catch {
          nextSocialLinks = {};
        }
      }
      patch.socialLinks = {
        ...current.socialLinks?.toObject?.(),
        ...(nextSocialLinks || {}),
      };
    }

    const settings = await siteSettingsModel.findOneAndUpdate(
      { key: "main" },
      { $set: patch },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeliveryFee = async (_req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ delivery_fee: settings.delivery_fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDeliveryFee = async (req, res) => {
  try {
    const nextFee = Number(req.body.delivery_fee);

    if (!Number.isFinite(nextFee) || nextFee < 0) {
      return res.status(400).json({ message: "delivery_fee must be a number" });
    }

    const settings = await siteSettingsModel.findOneAndUpdate(
      { key: "main" },
      { $set: { delivery_fee: nextFee } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, delivery_fee: settings.delivery_fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
