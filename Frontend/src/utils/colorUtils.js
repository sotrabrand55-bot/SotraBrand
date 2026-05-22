// src/utils/colorUtils.js

export const COLOR_MAP = {
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",

  beige: "#f5f5dc",
  cream: "#fffdd0",
  ivory: "#fffff0",
  eggshell: "#f0ead6",
  offwhite: "#f8f8f8",

  brown: "#8b4513",
  camel: "#c19a6b",
  khaki: "#c3b091",
  sand: "#d6c6a1",
  mocha: "#8b6f5a",
  taupe: "#b8a99a",
  stone: "#b5b2a8",
  warmbeige: "#d8c3a5",

  red: "#dc2626",
  maroon: "#800000",
  burgundy: "#800020",
  coral: "#ff7f50",

  pink: "#ec4899",
  blush: "#f4c2c2",
  dustyrose: "#c48a9a",
  softpink: "#f6c1cc",
  beigerose: "#e6c1b3",
  beigeroseh: "#e6c1b3",

  purple: "#7e22ce",
  lavender: "#e6e6fa",

  blue: "#1e3a8a",
  navy: "#001f3f",
  sky: "#87ceeb",

  green: "#15803d",
  olive: "#556b2f",
  mint: "#3eb489",

  yellow: "#eab308",
  orange: "#f97316",

  teal: "#008080",
  silver: "#c0c0c0",
  gold: "#d4af37",
  charcoal: "#36454f",
  chocolate: "#7b3f00",
};

export const normalizeColor = (val) => {
  if (!val) return "#ddd";

  const key = String(val)
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]/g, "");

  return COLOR_MAP[key] || val; 
};
