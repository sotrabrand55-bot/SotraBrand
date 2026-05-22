import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminFormPreviewSkeleton, AdminInlineSkeleton } from "../components/AdminSkeletons";

const emptyForm = {
  image: null,
  existingImage: "",
  title: "",
  blurb: "",
  badgesText: "",
  order: 0,
  active: true,
};

const fallbackImage =
  "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85";

const HeaderSlides = ({ token }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  const authHeader = { headers: { token } };

  const previewImage = filePreview || form.existingImage || slides[0]?.image || fallbackImage;
  const activePreview = {
    image: previewImage,
    title: form.title || slides[0]?.title || "LEVON SIGNATURES",
    blurb:
      form.blurb ||
      slides[0]?.blurb ||
      "Modern extrait perfumes with a quiet luxury trail.",
    badges:
      form.badgesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean).length > 0
        ? form.badgesText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : slides[0]?.badges?.length
          ? slides[0].badges
          : ["Amber", "Oud", "Musk"],
  };

  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [slides]
  );

  const load = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/header-slides/list`);
      if (res.data?.success) {
        setSlides(res.data.slides || []);
      }
    } catch {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!form.image) {
      setFilePreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  const onField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toBadgesArray = (badgesText) =>
    badgesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      if (form.image) fd.append("image", form.image);
      fd.append("title", form.title);
      fd.append("blurb", form.blurb);
      fd.append("badges", JSON.stringify(toBadgesArray(form.badgesText)));
      fd.append("order", String(form.order));
      fd.append("active", String(form.active));

      if (editingId) {
        await axios.post(
          `${backendUrl}/api/header-slides/update/${editingId}`,
          fd,
          authHeader
        );
        toast.success("Slide updated");
      } else {
        await axios.post(`${backendUrl}/api/header-slides/add`, fd, authHeader);
        toast.success("Slide added");
      }

      resetForm();
      load();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (editingId ? "Update failed" : "Create failed")
      );
    }
  };

  const startEdit = (slide) => {
    setEditingId(slide._id);
    setForm({
      image: null,
      existingImage: slide.image || "",
      title: slide.title || "",
      blurb: slide.blurb || "",
      badgesText: (slide.badges || []).join(", "),
      order: Number(slide.order || 0),
      active: !!slide.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this slide?")) return;

    try {
      await axios.post(`${backendUrl}/api/header-slides/remove/${id}`, {}, authHeader);
      toast.success("Slide removed");
      if (editingId === id) resetForm();
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Remove failed");
    }
  };

  const quickUpdate = async (id, patch) => {
    try {
      const fd = new FormData();
      Object.entries(patch).forEach(([key, value]) => {
        if (key === "badges" && Array.isArray(value)) {
          fd.append("badges", JSON.stringify(value));
        } else {
          fd.append(key, String(value));
        }
      });

      await axios.post(`${backendUrl}/api/header-slides/update/${id}`, fd, authHeader);
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  const move = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedSlides.length) return;

    const current = orderedSlides[index];
    const target = orderedSlides[nextIndex];

    try {
      const currentFd = new FormData();
      currentFd.append("order", String(target.order ?? nextIndex));
      const targetFd = new FormData();
      targetFd.append("order", String(current.order ?? index));

      await axios.post(
        `${backendUrl}/api/header-slides/update/${current._id}`,
        currentFd,
        authHeader
      );
      await axios.post(
        `${backendUrl}/api/header-slides/update/${target._id}`,
        targetFd,
        authHeader
      );
      load();
    } catch {
      toast.error("Reorder failed");
    }
  };

  if (loading) return <AdminFormPreviewSkeleton />;

  return (
    <div className="min-h-screen bg-[#fffaf4] px-2 py-3 text-[#1f1b17] sm:px-4">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex flex-col gap-3 rounded-md border border-[#eadfd2] bg-white/70 px-4 py-4 shadow-[0_14px_34px_rgba(62,45,28,0.07)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c49a5e]">
              Levon Admin
            </p>
            <h1 className="mt-1 font-serif text-3xl leading-none text-[#1f1b17] sm:text-4xl">
              Hero Header Slides
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d6756]">
              Control the images, titles, notes, and order shown in the Levon
              homepage hero.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center rounded-full bg-[#1f1b17] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
          >
            + New Slide
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.82fr)_minmax(500px,1.18fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-md border border-[#eadfd2] bg-white/82 p-4 shadow-[0_14px_34px_rgba(62,45,28,0.07)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#eadfd2] pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                  Slide Details
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[#1f1b17]">
                  {editingId ? "Edit Slide" : "Create Slide"}
                </h2>
              </div>
              {editingId && (
                <span className="rounded-full border border-[#dfd1c1] bg-[#fffaf4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                  Editing
                </span>
              )}
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                Upload Hero Image
              </span>
              <div className="relative overflow-hidden rounded-md border border-dashed border-[#d8c8b5] bg-[#fffaf4]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onField("image", e.target.files[0] || null)}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  {...(!editingId ? { required: true } : {})}
                />
                <div className="grid min-h-[140px] place-items-center p-3">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Header slide preview"
                      className="h-[125px] w-full rounded-sm object-cover"
                    />
                  ) : (
                    <div className="text-center text-sm text-[#9a8068]">
                      Drop or select a perfume hero image
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-[#9a8068]">
                {editingId
                  ? "Choose a new image only if you want to replace the current one."
                  : "Use a wide, real perfume image for best frontend results."}
              </p>
            </label>

            <div className="mt-4 grid gap-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                  Slide Title
                </span>
                <input
                  value={form.title}
                  onChange={(e) => onField("title", e.target.value)}
                  className="w-full border-[#dfd1c1] bg-white px-3 py-2.5 text-sm text-[#1f1b17] outline-[#c49a5e]"
                  placeholder="LEVON SIGNATURES"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                  Short Blurb
                </span>
                <textarea
                  value={form.blurb}
                  onChange={(e) => onField("blurb", e.target.value)}
                  className="min-h-20 w-full border-[#dfd1c1] bg-white px-3 py-2.5 text-sm leading-6 text-[#1f1b17] outline-[#c49a5e]"
                  placeholder="Modern extrait perfumes with a quiet luxury trail."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                  Badges
                </span>
                <input
                  value={form.badgesText}
                  onChange={(e) => onField("badgesText", e.target.value)}
                  className="w-full border-[#dfd1c1] bg-white px-3 py-2.5 text-sm text-[#1f1b17] outline-[#c49a5e]"
                  placeholder="Amber, Oud, Musk"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#7d6756]">
                    Order
                  </span>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => onField("order", e.target.value)}
                    className="w-full border-[#dfd1c1] bg-white px-3 py-2.5 text-sm text-[#1f1b17] outline-[#c49a5e]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => onField("active", !form.active)}
                  className={`flex h-[42px] min-w-36 items-center justify-between rounded-full border px-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    form.active
                      ? "border-[#c49a5e] bg-[#c49a5e] text-white"
                      : "border-[#dfd1c1] bg-[#fffaf4] text-[#7d6756]"
                  }`}
                >
                  <span className="px-3">Active</span>
                  <span
                    className={`h-7 w-7 rounded-full bg-white shadow transition ${
                      form.active ? "translate-x-0" : "-translate-x-20 opacity-80"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-full bg-[#1f1b17] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#c49a5e]"
              >
                {editingId ? "Save Changes" : "Save Slide"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[#dfd1c1] bg-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f1b17] transition hover:border-[#c49a5e]"
              >
                Reset
              </button>
            </div>
          </form>

          <section className="rounded-md border border-[#eadfd2] bg-white/82 p-4 shadow-[0_14px_34px_rgba(62,45,28,0.07)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                  Live Frontend Preview
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[#1f1b17]">
                  Homepage Hero
                </h2>
              </div>
              <span className="h-2.5 w-2.5 rotate-45 bg-[#c49a5e]" />
            </div>

            <div className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fff7ef] p-3">
              <div className="grid min-h-[330px] items-center gap-4 lg:grid-cols-[0.92fr_1.08fr]">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b9945d]">
                    Levon Parfum
                  </p>
                  <h3 className="font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.9] text-[#1e1a16]">
                    Signature
                    <span className="block text-[#7c5f3a]">Scents</span>
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-6 text-[#665d53]">
                    {activePreview.blurb}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center rounded-full bg-[#1f1b17] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      Shop Now
                    </span>
                    {activePreview.badges.slice(0, 3).map((badge) => (
                      <span
                        key={badge}
                        className="rounded-full border border-[#dfd1c1] bg-white/65 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#625647]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative h-[310px]">
                  <div className="absolute -left-7 top-8 hidden h-24 w-24 rounded-full border border-[#dcc7ae] sm:block" />
                  <div className="grid h-full grid-cols-[1.1fr_0.78fr] grid-rows-2 gap-3">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-sm bg-[#eadfd2] shadow-[0_18px_45px_rgba(53,39,25,0.16)] ${
                          index === 0 ? "row-span-2" : ""
                        }`}
                      >
                        <img
                          src={orderedSlides[index]?.image || activePreview.image}
                          alt={orderedSlides[index]?.title || activePreview.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
                            {index === 0 ? "Featured" : "Note"}
                          </p>
                          <h4
                            className={`mt-1 font-serif leading-tight ${
                              index === 0 ? "text-2xl" : "text-lg"
                            }`}
                          >
                            {orderedSlides[index]?.title || activePreview.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-md border border-[#eadfd2] bg-white/78 p-4 shadow-[0_14px_34px_rgba(62,45,28,0.07)]">
          <div className="mb-4 flex flex-col gap-2 border-b border-[#eadfd2] pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                Existing Slides
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[#1f1b17]">
                Current Hero Set
              </h2>
            </div>
            <span className="text-sm text-[#7d6756]">
              {orderedSlides.length} slide{orderedSlides.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <AdminInlineSkeleton cards={3} className="md:grid-cols-2 xl:grid-cols-3" />
          ) : orderedSlides.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#7d6756]">
              No slides yet. Create your first Levon hero slide above.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {orderedSlides.map((slide, index) => (
                <article
                  key={slide._id}
                  className="grid gap-4 rounded-md border border-[#eadfd2] bg-[#fffaf4] p-3 sm:grid-cols-[150px_1fr]"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-36 w-full rounded-sm object-cover sm:h-full"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                          Order {slide.order ?? index}
                        </p>
                        <h3 className="mt-1 font-serif text-2xl leading-tight text-[#1f1b17]">
                          {slide.title}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] ${
                          slide.active
                            ? "border-[#c49a5e] bg-[#fff8eb] text-[#8a6530]"
                            : "border-[#dfd1c1] bg-white text-[#7d6756]"
                        }`}
                      >
                        {slide.active ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7d6756]">
                      {slide.blurb || "No supporting blurb."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(slide.badges || []).slice(0, 4).map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full border border-[#dfd1c1] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#746657]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(slide)}
                        className="rounded-full border border-[#dfd1c1] bg-white px-4 py-2 text-xs font-semibold text-[#1f1b17] hover:border-[#c49a5e]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => quickUpdate(slide._id, { active: !slide.active })}
                        className="rounded-full border border-[#dfd1c1] bg-white px-4 py-2 text-xs font-semibold text-[#1f1b17] hover:border-[#c49a5e]"
                      >
                        {slide.active ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="rounded-full border border-[#dfd1c1] bg-white px-4 py-2 text-xs font-semibold text-[#1f1b17] hover:border-[#c49a5e] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === orderedSlides.length - 1}
                        className="rounded-full border border-[#dfd1c1] bg-white px-4 py-2 text-xs font-semibold text-[#1f1b17] hover:border-[#c49a5e] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Move Down
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(slide._id)}
                        className="rounded-full border border-[#7b2d2d] bg-white px-4 py-2 text-xs font-semibold text-[#7b2d2d] hover:bg-[#7b2d2d] hover:text-white"
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
      </div>
    </div>
  );
};

export default HeaderSlides;
