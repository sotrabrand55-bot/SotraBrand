import imagekit from "../config/ImageKit.js";
import giftSetDisplayModel from "../models/giftSetDisplayModel.js";

const defaultSlots = [
  { slot: 1, active: true, buttonText: "Shop Set" },
  { slot: 2, active: true, buttonText: "Shop Set" },
  { slot: 3, active: true, buttonText: "Shop Set" },
];

const normalizeSlots = (slots = []) => {
  const bySlot = new Map();
  slots.forEach((item) => {
    const plain = item?.toObject ? item.toObject() : item;
    const slotNumber = Number(plain.slot);
    if (slotNumber >= 1 && slotNumber <= 3) {
      bySlot.set(slotNumber, plain);
    }
  });

  return defaultSlots.map((fallback) => {
    const slot = bySlot.get(fallback.slot) || {};
    return {
      ...fallback,
      ...slot,
      slot: fallback.slot,
      buttonText: slot.buttonText || "Shop Set",
      active: slot.active === undefined ? true : Boolean(slot.active),
    };
  });
};

const getOrCreateDisplay = async () => {
  let display = await giftSetDisplayModel.findOne({ key: "main" });
  if (!display) {
    display = await giftSetDisplayModel.create({
      key: "main",
      slots: defaultSlots,
      updatedAt: Date.now(),
    });
  }
  return display;
};

export const getGiftSetDisplay = async (_req, res) => {
  try {
    const display = await getOrCreateDisplay();
    await display.populate("slots.productId");
    res.json({
      success: true,
      display: {
        ...display.toObject(),
        slots: normalizeSlots(display.slots),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGiftSetDisplay = async (req, res) => {
  try {
    const display = await getOrCreateDisplay();
    let incomingSlots = [];

    if (req.body.slots) {
      incomingSlots =
        typeof req.body.slots === "string"
          ? JSON.parse(req.body.slots)
          : req.body.slots;
    }

    if (!Array.isArray(incomingSlots)) {
      return res
        .status(400)
        .json({ success: false, message: "Slots must be an array" });
    }

    const currentSlots = normalizeSlots(display.slots);
    const nextSlots = normalizeSlots(incomingSlots).map((slot) => {
      const previous = currentSlots.find((item) => item.slot === slot.slot) || {};
      return {
        slot: slot.slot,
        productId: slot.productId || undefined,
        title: slot.title || "",
        subtitle: slot.subtitle || "",
        buttonText: slot.buttonText || "Shop Set",
        image: slot.clearImage ? "" : slot.image || previous.image || "",
        linkTo: slot.linkTo || "",
        active: slot.active === undefined ? true : Boolean(slot.active),
      };
    });

    for (const fieldName of ["image1", "image2", "image3"]) {
      const index = Number(fieldName.replace("image", "")) - 1;
      const file = req.files?.[fieldName]?.[0];
      if (file) {
        const uploaded = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
        });
        nextSlots[index].image = uploaded.url;
      }
    }

    display.slots = nextSlots;
    display.updatedAt = Date.now();
    await display.save();
    await display.populate("slots.productId");

    res.json({
      success: true,
      message: "Gift sets display updated",
      display: {
        ...display.toObject(),
        slots: normalizeSlots(display.slots),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
