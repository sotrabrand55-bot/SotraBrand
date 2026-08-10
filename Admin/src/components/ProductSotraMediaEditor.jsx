import React, { useEffect, useState } from "react";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#d4d4d4] bg-[#ffffff] px-3 py-2 text-sm text-[#000000] outline-none transition placeholder:text-[#9ca3af] focus:border-black focus:ring-2 focus:ring-black/10";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#4b5563]";

export const stripProductMediaPrivateFields = (item) => {
  const { _file, _preview, ...publicItem } = item;
  Object.keys(publicItem).forEach((key) => {
    if (key.startsWith("_")) delete publicItem[key];
  });
  if (_file && String(publicItem.image || "").startsWith("blob:")) {
    publicItem.image = "";
  }
  return publicItem;
};

const makePreview = (file) => (file ? URL.createObjectURL(file) : "");

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => {
    const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : 9999;
    const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : 9999;
    return aOrder - bOrder;
  });

const getChoiceNameCopy = (value = "") => {
  const cleaned = String(value || "")
    .replace(/\bchoose\b/gi, "")
    .replace(/\ban\b/gi, "")
    .replace(/\ba\b/gi, "")
    .replace(/\byour\b/gi, "")
    .replace(/\boption\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const noun = cleaned || "option";
  return {
    label: `Name your ${noun}`,
    placeholder:
      noun === "color"
        ? "Black, Nude, Gold..."
        : noun === "size"
          ? "S, M, L, 30ML..."
          : "Black, Nude, Gold, Small...",
  };
};

const isStockUnlimited = (option = {}) =>
  option._stockUnlimited !== undefined
    ? Boolean(option._stockUnlimited)
    : option.stock === undefined || option.stock === null || option.stock === "";

const FileUploadField = ({ title = "Add Image", note = "Choose a clear product image.", file, onChange }) => (
  <div>
    <label className={labelClass}>{title}</label>
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed border-[#d4d4d4] bg-[#f7f7f7] px-3 py-2 text-sm text-[#111111] transition hover:border-black hover:bg-white">
      <span className="min-w-0 truncate">{file?.name || "Choose image from computer"}</span>
      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#4b5563]">
        Add Image
      </span>
      <input type="file" accept="image/*" className="sr-only" onChange={onChange} />
    </label>
    <p className="mt-1 text-[11px] leading-5 text-[#6b7280]">{note}</p>
  </div>
);

const MediaPreview = ({ src, file, label }) => {
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => {
    if (!file || src) {
      setFilePreview("");
      return undefined;
    }

    const preview = URL.createObjectURL(file);
    setFilePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file, src]);

  const resolvedSrc = src || filePreview;

  return (
    <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-md border border-[#e5e5e5] bg-[#EAEAEA]">
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={label || ""} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-center text-[9px] font-bold uppercase tracking-[0.12em] text-black/35">
          Image
        </div>
      )}
    </div>
  );
};

const ProductSotraMediaEditor = ({
  smallImageOptionLabel = "Choose An Option",
  setSmallImageOptionLabel,
  shadeOptions,
  setShadeOptions,
  storyImages,
  setStoryImages,
  onStockAvailable,
}) => {
  const choiceNameCopy = getChoiceNameCopy(smallImageOptionLabel);

  const updateShade = (index, patch) => {
    if (
      Object.prototype.hasOwnProperty.call(patch, "stock") &&
      patch._stockUnlimited === false &&
      Number(patch.stock) > 0
    ) {
      onStockAvailable?.();
    }
    setShadeOptions((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const updateStory = (index, patch) =>
    setStoryImages((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });

  const addShade = () =>
    setShadeOptions((current) => [
      ...current,
      {
        id: `shade-${Date.now()}-${current.length}`,
        label: "",
        cartValue: "",
        description: "",
        stock: "",
        _stockUnlimited: true,
        order: current.length + 1,
        image: "",
        fileId: "",
        _file: null,
        _preview: "",
      },
    ]);

  const addStory = () =>
    setStoryImages((current) => [
      ...current,
      {
        id: `story-${Date.now()}-${current.length}`,
        alt: "",
        order: current.length + 1,
        image: "",
        fileId: "",
        _file: null,
        _preview: "",
      },
    ]);

  const removeShade = (index) =>
    setShadeOptions((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const removeStory = (index) =>
    setStoryImages((current) => current.filter((_, itemIndex) => itemIndex !== index));

  return (
    <section className="mt-5 rounded-md border border-[#e5e5e5] bg-[#ffffff] p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={labelClass}>Sotra Product Media</p>
          <h3 className="font-serif text-2xl text-[#000000]">
            Story images and small images
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#4b5563]">
            Small images create the circular options. Story images open vertically
            when the product image is tapped.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addStory}
            className="rounded-full bg-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#222]"
          >
            Add Story
          </button>
          <button
            type="button"
            onClick={addShade}
            className="rounded-full border border-[#d4d4d4] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#374151] transition hover:border-black hover:text-black"
          >
            Add Small Image
          </button>
        </div>
      </div>

      <div className="rounded-md border border-[#e5e5e5] bg-[#f7f7f7] p-3">
        <label className={labelClass}>Small Image Selector Title</label>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <input
            className={fieldClass}
            value={smallImageOptionLabel}
            placeholder="Choose An Option"
            onChange={(event) => setSmallImageOptionLabel?.(event.target.value)}
          />
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {["Choose An Option", "Choose A Color", "Choose Size"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setSmallImageOptionLabel?.(label)}
                className="rounded-full border border-[#d4d4d4] bg-white px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#4b5563] transition hover:border-black hover:text-black"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-5 text-[#4b5563]">
          This is the title customers see above the circular choices on the product page.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
            Small Images
          </p>
          <div className="space-y-3">
            {sortByOrder(shadeOptions).map((option) => {
              const index = shadeOptions.indexOf(option);
              const unlimitedStock = isStockUnlimited(option);
              return (
              <article
                key={option.id || index}
                className="grid min-w-0 gap-3 rounded-md border border-[#e5e5e5] bg-white p-3 md:grid-cols-[80px_minmax(0,1fr)]"
              >
                <MediaPreview
                  src={option._preview || option.image}
                  file={option._file}
                  label={option.label}
                />
                <div className="grid min-w-0 gap-3">
                  <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)]">
                    <div>
                      <label className={labelClass}>Image Order</label>
                      <input
                        type="number"
                        min="1"
                        className={fieldClass}
                        value={option.order ?? index + 1}
                        onChange={(event) =>
                          updateShade(index, { order: Number(event.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div>
                      <label className={labelClass}>{choiceNameCopy.label}</label>
                      <input
                        className={fieldClass}
                        value={option.label || ""}
                        placeholder={choiceNameCopy.placeholder}
                        onChange={(event) =>
                          updateShade(index, {
                            label: event.target.value,
                            cartValue: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Small Image Stock</label>
                      <label className="mb-2 flex min-h-11 items-center gap-2 rounded-md border border-[#d4d4d4] bg-[#f7f7f7] px-3 py-2 text-xs font-semibold text-[#111111]">
                        <input
                          type="checkbox"
                          checked={unlimitedStock}
                          onChange={(event) =>
                            updateShade(index, {
                              _stockUnlimited: event.target.checked,
                              stock: event.target.checked ? "" : option.stock || "",
                            })
                          }
                        />
                        Unlimited stock for this small image
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={fieldClass}
                        value={unlimitedStock ? "" : option.stock}
                        placeholder={unlimitedStock ? "Type stock to limit this option" : "5"}
                        onFocus={() => {
                          if (unlimitedStock) {
                            updateShade(index, {
                              _stockUnlimited: false,
                              stock: option.stock || "",
                            });
                          }
                        }}
                        onChange={(event) =>
                          updateShade(index, {
                            _stockUnlimited: false,
                            stock: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      className={`${fieldClass} min-h-20 resize-none`}
                      value={option.description || ""}
                      onChange={(event) =>
                        updateShade(index, { description: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <FileUploadField
                      title="Add Image"
                      note="This image appears inside the circular customer choice."
                      file={option._file}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const preview = makePreview(file);
                        updateShade(index, {
                          _file: file,
                          _preview: preview,
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeShade(index)}
                      className="rounded-md border border-[#7b2d2d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
            {!shadeOptions.length && (
              <p className="rounded-md border border-dashed border-[#e5e5e5] p-5 text-center text-sm text-[#4b5563]">
                Add small images only when this product needs circular choices.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
            Story Images
          </p>
          <div className="space-y-3">
            {sortByOrder(storyImages).map((story) => {
              const index = storyImages.indexOf(story);
              return (
              <article
                key={story.id || index}
                className="grid min-w-0 gap-3 rounded-md border border-[#e5e5e5] bg-white p-3 md:grid-cols-[80px_minmax(0,1fr)]"
              >
                <MediaPreview
                  src={story._preview || story.image}
                  file={story._file}
                  label={story.alt}
                />
                <div className="grid min-w-0 gap-3">
                  <div className="grid gap-3 lg:grid-cols-[120px_minmax(0,1fr)]">
                    <div>
                    <label className={labelClass}>Image Order</label>
                    <input
                      type="number"
                      min="1"
                      className={fieldClass}
                      value={story.order ?? index + 1}
                      onChange={(event) =>
                        updateStory(index, { order: Number(event.target.value) })
                      }
                    />
                    </div>
                    <div>
                    <label className={labelClass}>Image Name</label>
                    <input
                      className={fieldClass}
                      value={story.alt || ""}
                      placeholder="Front view, fabric detail, outfit..."
                      onChange={(event) =>
                        updateStory(index, { alt: event.target.value })
                      }
                    />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      className={`${fieldClass} min-h-20 resize-none`}
                      value={story.description || ""}
                      placeholder="Optional note for this story image."
                      onChange={(event) =>
                        updateStory(index, { description: event.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <FileUploadField
                      title="Add Image"
                      note="This image appears in the main product gallery."
                      file={story._file}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const preview = makePreview(file);
                        updateStory(index, {
                          _file: file,
                          _preview: preview,
                        });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeStory(index)}
                      className="rounded-md border border-[#7b2d2d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
            {!storyImages.length && (
              <p className="rounded-md border border-dashed border-[#e5e5e5] p-5 text-center text-sm text-[#4b5563]">
                Add separate story images when you want more vertical product storytelling.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSotraMediaEditor;
