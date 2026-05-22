import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { AdminFormPreviewSkeleton, AdminInlineSkeleton } from "../components/AdminSkeletons";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-3 py-2 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#7d6756]";

const defaultFamilies = ["Amber", "Floral", "Fresh", "Woods", "Oud", "Musk", "Citrus", "Vanilla"];
const categoryOptions = ["Fragrance", "Gift Sets", "For Her", "For Him"];
const moodSlots = [0, 1, 2, 3];
const controlledTargetTypes = ["scentFamily", "category", "product"];

const emptyForm = {
  title: "",
  description: "",
  tags: "",
  targetType: "scentFamily",
  targetValue: "Amber",
  customLink: "/collection",
  active: true,
  order: 0,
};

const PreviewImage = ({ file, image, title }) => {
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!file) {
      setSource("");
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!source && !image) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#eee4d9] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a49181]">
        Add image
      </div>
    );
  }

  if (loading) return <AdminFormPreviewSkeleton />;

  return (
    <img
      src={source || image}
      alt={title || "Mood preview"}
      className="h-full w-full object-cover"
    />
  );
};

const buildLink = ({ targetType, targetValue, customLink }) => {
  if (targetType === "product" && targetValue) return `/Product/${targetValue}`;
  if (targetType === "category" && targetValue) {
    return `/collection?cat=${encodeURIComponent(targetValue)}`;
  }
  if (targetType === "scentFamily" && targetValue) {
    return `/collection?sub=${encodeURIComponent(targetValue)}&cat=Fragrance`;
  }
  return customLink || "/collection";
};

const ScentWardrobeManager = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moods, setMoods] = useState([]);
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState(defaultFamilies);
  const [editingId, setEditingId] = useState("");
  const [image, setImage] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const productOptions = useMemo(
    () =>
      products
        .filter((product) => product.active !== false)
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [products]
  );

  const activeMoods = moods.filter((mood) => mood.active).length;
  const slotMoods = useMemo(() => {
    const slots = Array.from({ length: moodSlots.length }, () => null);
    moods.forEach((mood) => {
      const slotIndex = Number(mood.order || 0);
      if (slotIndex >= 0 && slotIndex < moodSlots.length && !slots[slotIndex]) {
        slots[slotIndex] = mood;
      }
    });
    return slots;
  }, [moods]);
  const previewLink = buildLink(form);

  const getDefaultTargetValue = (targetType) => {
    if (targetType === "category") return categoryOptions[0];
    if (targetType === "product") return productOptions[0]?._id || "";
    return families[0] || "Amber";
  };

  const getFirstOpenSlot = () => {
    const openSlot = slotMoods.findIndex((mood) => !mood);
    return openSlot >= 0 ? openSlot : moodSlots.length - 1;
  };

  const loadPage = async () => {
    setLoading(true);
    try {
      const [moodRes, productRes, familyRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/scent-wardrobe/list`),
        axios.get(`${backendUrl}/api/product/list`, { headers: { token } }),
        axios.get(`${backendUrl}/api/scent-families/list`),
      ]);

      if (moodRes.status === "fulfilled" && moodRes.value.data?.success) {
        setMoods(
          (moodRes.value.data.moods || []).sort(
            (a, b) => Number(a.order || 0) - Number(b.order || 0)
          )
        );
      }

      if (productRes.status === "fulfilled" && productRes.value.data?.success) {
        setProducts(productRes.value.data.products || []);
      }

      if (familyRes.status === "fulfilled" && familyRes.value.data?.success) {
        const next = (familyRes.value.data.families || [])
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter(Boolean);
        if (next.length) setFamilies([...new Set(next)]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "targetType") {
        next.targetValue = getDefaultTargetValue(value);
      }
      return next;
    });
  };

  const resetForm = () => {
    setEditingId("");
    setImage(null);
    setForm({
      ...emptyForm,
      targetValue: families[0] || "Amber",
      order: getFirstOpenSlot(),
    });
  };

  const startEdit = (mood) => {
    const targetType = controlledTargetTypes.includes(mood.targetType)
      ? mood.targetType
      : "scentFamily";
    setEditingId(mood._id);
    setImage(null);
    setForm({
      title: mood.title || "",
      description: mood.description || "",
      tags: (mood.tags || []).join(", "),
      targetType,
      targetValue:
        controlledTargetTypes.includes(mood.targetType) && mood.targetValue
          ? mood.targetValue
          : getDefaultTargetValue(targetType),
      customLink: mood.linkTo || "/collection",
      active: mood.active !== false,
      order: Math.min(Math.max(Number(mood.order || 0), 0), moodSlots.length - 1),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitMood = async (event) => {
    event.preventDefault();

    if (!editingId && !image) {
      toast.error("Please select an image.");
      return;
    }

    try {
      setSaving(true);
      const body = new FormData();
      if (image) body.append("image", image);
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("tags", form.tags);
      body.append("targetType", form.targetType);
      body.append("targetValue", form.targetValue);
      body.append("linkTo", form.customLink);
      body.append("active", String(form.active));
      body.append("order", String(form.order));

      const res = editingId
        ? await axios.put(`${backendUrl}/api/scent-wardrobe/update/${editingId}`, body, {
            headers: { token },
          })
        : await axios.post(`${backendUrl}/api/scent-wardrobe/add`, body, {
            headers: { token },
          });

      if (res.data?.success) {
        toast.success(editingId ? "Mood tile updated" : "Mood tile added");
        resetForm();
        await loadPage();
      } else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMood = async (id) => {
    if (!confirm("Delete this mood tile?")) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/scent-wardrobe/remove`,
        { id },
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success("Mood tile removed");
        await loadPage();
      } else {
        toast.error(res.data?.message || "Remove failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const toggleActive = async (mood) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/scent-wardrobe/update/${mood._id}`,
        { active: !mood.active },
        { headers: { token } }
      );
      if (res.data?.success) {
        setMoods((current) =>
          current.map((item) =>
            item._id === mood._id ? { ...item, active: !mood.active } : item
          )
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#1f1b17]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Choose Your Mood
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            Choose Your Mood
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Control the exact 4 mood pictures shown on the homepage and choose where each one sends customers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadPage}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Reset
          </button>
          <button
            type="submit"
            form="scent-wardrobe-form"
            disabled={saving}
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
          >
            {saving ? "Saving..." : editingId ? "Save Mood" : "Add Mood"}
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {slotMoods.map((mood, index) => (
          <div
            key={`slot-${index + 1}`}
            className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
              Slot {index + 1}
            </p>
            <p className="mt-2 truncate font-serif text-2xl leading-none text-[#1f1b17]">
              {mood ? mood.title : "Open"}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                mood?.active
                  ? "bg-emerald-50 text-emerald-700"
                  : mood
                  ? "bg-[#eee4d9] text-[#6f5844]"
                  : "bg-[#fffdf9] text-[#9a8068]"
              }`}
            >
              {mood?.active ? "Active" : mood ? "Hidden" : "Empty"}
            </span>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form
          id="scent-wardrobe-form"
          onSubmit={submitMood}
          className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Mood Card
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                {editingId ? "Edit mood" : "Add mood"}
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Live backend sync
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label className="block">
              <span className={labelClass}>
                Image {editingId ? "(optional)" : ""}
              </span>
              <div className="aspect-[4/5] overflow-hidden rounded-md border border-dashed border-[#d8c2a5] bg-[#fffdf9]">
                <PreviewImage
                  file={image}
                  image={editingId ? moods.find((mood) => mood._id === editingId)?.image : ""}
                  title={form.title}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-xs text-[#7d6756]"
                onChange={(event) => setImage(event.target.files?.[0] || null)}
              />
            </label>

            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Mood Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className={fieldClass}
                    placeholder="Amber Night"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Tags</label>
                  <input
                    value={form.tags}
                    onChange={(event) => setField("tags", event.target.value)}
                    className={fieldClass}
                    placeholder="Amber, Vanilla"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  className={`${fieldClass} min-h-24 resize-none`}
                  placeholder="Warm resin and polished woods for evening presence."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Target Type</label>
                  <select
                    value={form.targetType}
                    onChange={(event) => setField("targetType", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="scentFamily">Scent Family</option>
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Target</label>
                  {form.targetType === "scentFamily" && (
                    <select
                      value={form.targetValue}
                      onChange={(event) => setField("targetValue", event.target.value)}
                      className={fieldClass}
                    >
                      {families.map((family) => (
                        <option key={family} value={family}>
                          {family}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.targetType === "category" && (
                    <select
                      value={form.targetValue}
                      onChange={(event) => setField("targetValue", event.target.value)}
                      className={fieldClass}
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.targetType === "product" && (
                    <select
                      value={form.targetValue}
                      onChange={(event) => setField("targetValue", event.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Choose product</option>
                      {productOptions.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Frontend Slot</label>
                  <select
                    value={form.order}
                    onChange={(event) => setField("order", event.target.value)}
                    className={fieldClass}
                  >
                    {moodSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        Slot {slot + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8068]">
                      Frontend Link
                    </p>
                    <p className="mt-1 break-all text-sm text-[#1f1b17]">{previewLink}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f5844]">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={() => setField("active", !form.active)}
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Live Mood Preview
            </p>
            <div className="mt-4 overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
              <div className="relative aspect-[4/5] bg-[#eee4d9]">
                <PreviewImage file={image} image={editingId ? moods.find((mood) => mood._id === editingId)?.image : ""} title={form.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-2xl text-[#1f1b17]">
                  {form.title || "Amber Night"}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#7d6756]">
                  {form.description || "Warm resin and polished woods for evening presence."}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(form.tags ? form.tags.split(",") : ["Amber", "Vanilla"])
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#d8c2a5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844]"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="mt-5 rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
              Homepage Mood Cards
            </p>
            <h2 className="font-serif text-2xl text-[#1f1b17]">
              Live 4-slot Choose Your Mood section
            </h2>
          </div>
          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            {activeMoods} active / {moods.length} saved
          </span>
        </div>

        {loading ? (
          <AdminInlineSkeleton cards={4} className="md:grid-cols-2 xl:grid-cols-4" />
        ) : moods.length === 0 ? (
          <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-8 text-center">
            <p className="font-serif text-2xl text-[#1f1b17]">No mood cards yet</p>
            <p className="mt-2 text-sm text-[#7d6756]">
              Add the first mood card above and it will feed the homepage Choose Your Mood section.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {moods.map((mood) => (
              <article
                key={mood._id}
                className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]"
              >
                <div className="aspect-[4/3] bg-[#eee4d9]">
                  <img src={mood.image} alt={mood.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-serif text-xl text-[#1f1b17]">
                        {mood.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] uppercase tracking-[0.15em] text-[#8a7b6b]">
                        Slot {Number(mood.order || 0) + 1} / {mood.targetType} / {mood.targetValue || "collection"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        mood.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#eee4d9] text-[#6f5844]"
                      }`}
                    >
                      {mood.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7d6756]">
                    {mood.description}
                  </p>
                  <p className="mt-3 truncate text-xs text-[#7d6756]">{mood.linkTo}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(mood)}
                      className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#c49a5e]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(mood)}
                      className="rounded-full border border-[#d8c2a5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
                    >
                      {mood.active ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMood(mood._id)}
                      className="rounded-full border border-[#7b2d2d]/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b2d2d] transition hover:border-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default ScentWardrobeManager;
