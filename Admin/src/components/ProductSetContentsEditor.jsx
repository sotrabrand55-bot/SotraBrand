import { useEffect, useState } from "react";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#d4d4d4] bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-[#9ca3af] focus:border-black focus:ring-2 focus:ring-black/10";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#4b5563]";

const stripPrivateFields = (item = {}) => {
  const { _file, _preview, ...publicItem } = item;
  if (_file && String(publicItem.image || "").startsWith("blob:")) {
    publicItem.image = "";
  }
  return publicItem;
};

export const stripSetContentPrivateFields = (item) => ({
  ...stripPrivateFields(item),
  gallery: (Array.isArray(item?.gallery) ? item.gallery : []).map(stripPrivateFields),
});

const ItemPreview = ({ item }) => {
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => {
    if (!item?._file || item?._preview || item?.image) {
      setFilePreview("");
      return undefined;
    }

    const preview = URL.createObjectURL(item._file);
    setFilePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [item?._file, item?._preview, item?.image]);

  const src = item?._preview || item?.image || filePreview;

  return (
    <div className="aspect-square overflow-hidden rounded-md border border-black/10 bg-[#EAEAEA]">
      {src ? (
        <img src={src} alt={item?.alt || item?.label || ""} className="h-full w-full object-contain" />
      ) : (
        <div className="grid h-full place-items-center text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
          Set item
        </div>
      )}
    </div>
  );
};

const ProductSetContentsEditor = ({
  items,
  setItems,
  submitLabel = "Save Inside Sets",
  saving = false,
}) => {
  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `set-content-${Date.now()}-${current.length}`,
        image: "",
        fileId: "",
        label: "",
        description: "",
        alt: "",
        order: current.length + 1,
        gallery: [],
        _file: null,
        _preview: "",
      },
    ]);
  };

  const updateItem = (index, patch) => {
    setItems((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addGalleryImage = (itemIndex) => {
    setItems((current) => {
      const next = [...current];
      const gallery = Array.isArray(next[itemIndex]?.gallery) ? next[itemIndex].gallery : [];
      next[itemIndex] = {
        ...next[itemIndex],
        gallery: [
          ...gallery,
          {
            id: `set-detail-${Date.now()}-${gallery.length}`,
            image: "",
            fileId: "",
            alt: next[itemIndex]?.label || "",
            order: gallery.length + 1,
            _file: null,
            _preview: "",
          },
        ],
      };
      return next;
    });
  };

  const updateGalleryImage = (itemIndex, galleryIndex, patch) => {
    setItems((current) => {
      const next = [...current];
      const gallery = [...(next[itemIndex]?.gallery || [])];
      gallery[galleryIndex] = { ...gallery[galleryIndex], ...patch };
      next[itemIndex] = { ...next[itemIndex], gallery };
      return next;
    });
  };

  const removeGalleryImage = (itemIndex, galleryIndex) => {
    setItems((current) => {
      const next = [...current];
      next[itemIndex] = {
        ...next[itemIndex],
        gallery: (next[itemIndex]?.gallery || []).filter(
          (_, index) => index !== galleryIndex
        ),
      };
      return next;
    });
  };

  const sortedItems = [...items].sort(
    (a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999)
  );

  return (
    <section className="mt-5 rounded-md border border-[#e5e5e5] bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={labelClass}>Set Product Only</p>
          <h3 className="font-serif text-2xl text-black">Inside the Sets</h3>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#4b5563]">
            Optional. Add the individual products included in a set. This section appears below the purchase area only when images are added.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-full bg-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition hover:bg-[#222]"
        >
          Add Set Item
        </button>
      </div>

      {items.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {sortedItems.map((item) => (
            <div key={`preview-${item.id}`}>
              <ItemPreview item={item} />
              <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-black">
                {item.label || "Set item"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {sortedItems.map((item) => {
          const index = items.indexOf(item);
          return (
            <article
              key={item.id || index}
              className="grid gap-3 rounded-md border border-[#e5e5e5] p-3 sm:grid-cols-[110px_1fr]"
            >
              <ItemPreview item={item} />
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Order</label>
                    <input
                      type="number"
                      min="1"
                      className={fieldClass}
                      value={item.order ?? index + 1}
                      onChange={(event) => updateItem(index, { order: Number(event.target.value) })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Product Label</label>
                    <input
                      className={fieldClass}
                      value={item.label || ""}
                      placeholder="Body Lotion"
                      onChange={(event) =>
                        updateItem(index, {
                          label: event.target.value,
                          alt: item.alt || event.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alt Text</label>
                    <input
                      className={fieldClass}
                      value={item.alt || ""}
                      onChange={(event) => updateItem(index, { alt: event.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Short Description</label>
                  <input
                    className={fieldClass}
                    value={item.description || ""}
                    placeholder="Hydrates and softens the skin."
                    onChange={(event) => updateItem(index, { description: event.target.value })}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input
                    type="file"
                    accept="image/*"
                    className={fieldClass}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      updateItem(index, {
                        _file: file,
                        _preview: URL.createObjectURL(file),
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-md border border-[#7b2d2d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                  >
                    Remove
                  </button>
                </div>

                <div className="rounded-md bg-[#f7f7f7] p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className={labelClass}>Item Detail Gallery</p>
                      <p className="text-xs text-[#4b5563]">
                        Optional. These images open only when this set item is clicked.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addGalleryImage(index)}
                      className="rounded-full border border-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white"
                    >
                      Add Detail Image
                    </button>
                  </div>

                  <div className="space-y-2">
                    {[...(item.gallery || [])]
                      .sort(
                        (a, b) =>
                          (Number(a.order) || 9999) - (Number(b.order) || 9999)
                      )
                      .map((galleryItem) => {
                        const galleryIndex = (item.gallery || []).indexOf(galleryItem);
                        return (
                          <div
                            key={galleryItem.id || galleryIndex}
                            className="grid gap-2 bg-white p-2 sm:grid-cols-[72px_90px_1fr]"
                          >
                            <ItemPreview item={galleryItem} />
                            <div>
                              <label className={labelClass}>Order</label>
                              <input
                                type="number"
                                min="1"
                                className={fieldClass}
                                value={galleryItem.order ?? galleryIndex + 1}
                                onChange={(event) =>
                                  updateGalleryImage(index, galleryIndex, {
                                    order: Number(event.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <input
                                className={fieldClass}
                                value={galleryItem.alt || ""}
                                placeholder={`${item.label || "Set item"} detail`}
                                onChange={(event) =>
                                  updateGalleryImage(index, galleryIndex, {
                                    alt: event.target.value,
                                  })
                                }
                              />
                              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className={fieldClass}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (!file) return;
                                    updateGalleryImage(index, galleryIndex, {
                                      _file: file,
                                      _preview: URL.createObjectURL(file),
                                    });
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeGalleryImage(index, galleryIndex)}
                                  className="rounded-md border border-[#7b2d2d] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {!item.gallery?.length && (
                      <p className="border border-dashed border-black/15 bg-white p-3 text-center text-xs text-black/45">
                        No detail images. Clicking this item will show only its main image.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {!items.length && (
          <p className="rounded-md border border-dashed border-[#d4d4d4] p-5 text-center text-sm text-[#4b5563]">
            Leave empty for regular products. Add items only for complete sets.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[#4b5563]">
          Changes here save with the product. Use this after removing items, editing labels, or changing detail images.
        </p>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-black px-5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#222] disabled:cursor-wait disabled:bg-[#4b5563]"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </section>
  );
};

export default ProductSetContentsEditor;
