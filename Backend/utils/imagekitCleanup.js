import imagekit from "../config/ImageKit.js";

const normalizeUrl = (value = "") => String(value || "").trim();

const getFileNameFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last.split("?")[0]);
  } catch {
    return "";
  }
};

export const uploadImageKitAsset = async (file, fallbackName = "nancy-asset") => {
  if (!file?.buffer) return null;

  const uploaded = await imagekit.upload({
    file: file.buffer,
    fileName: file.originalname || `${fallbackName}-${Date.now()}`,
  });

  return {
    url: uploaded.url,
    fileId: uploaded.fileId || "",
  };
};

export const deleteImageKitFileById = async (fileId) => {
  if (!fileId) return false;

  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch {
    return false;
  }
};

export const findImageKitFileIdByUrl = async (url) => {
  const targetUrl = normalizeUrl(url);
  const fileName = getFileNameFromUrl(targetUrl);
  if (!targetUrl || !fileName) return "";

  try {
    const files = await imagekit.listFiles({ name: fileName, limit: 100 });
    const match = (files || []).find((file) => {
      if (file?.type && file.type !== "file") return false;
      return (
        normalizeUrl(file?.url) === targetUrl ||
        normalizeUrl(file?.thumbnail) === targetUrl ||
        getFileNameFromUrl(file?.url) === fileName
      );
    });
    return match?.fileId || "";
  } catch {
    return "";
  }
};

export const deleteImageKitFileByUrl = async (url) => {
  const fileId = await findImageKitFileIdByUrl(url);
  return deleteImageKitFileById(fileId);
};

export const deleteImageKitAssets = async (assets = []) => {
  const normalized = assets
    .map((asset) =>
      typeof asset === "string"
        ? { url: asset, fileId: "" }
        : { url: asset?.url || "", fileId: asset?.fileId || "" }
    )
    .filter((asset) => asset.url || asset.fileId);

  const deleted = [];
  const skipped = [];

  for (const asset of normalized) {
    const ok = asset.fileId
      ? await deleteImageKitFileById(asset.fileId)
      : await deleteImageKitFileByUrl(asset.url);

    if (ok) {
      deleted.push(asset.url || asset.fileId);
    } else {
      skipped.push(asset.url || asset.fileId);
    }
  }

  return { deleted, skipped };
};
