import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-3 py-2 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#7d6756]";

const defaultStatement = {
  eyebrow: "Levon Craft",
  title: "Proudly Made by Our Brand",
  description:
    "At LEVON, we blend careful craftsmanship with modern perfume design, creating refined scents that celebrate everyday beauty and memorable rituals.",
  buttonText: "Explore More",
  buttonLink: "/Collection",
  image:
    "https://images.unsplash.com/photo-1600612253971-422e7f7faeb6?auto=format&fit=crop&w=1600&q=85",
  imageAlt: "Levon perfume craftsmanship",
  details: [
    { title: "Brand Craft", text: "Measured details, polished notes." },
    { title: "Modern Scent Rituals", text: "Designed for daily elegance." },
  ],
  imageEyebrow: "LEVON SIGNATURE",
  imageTitle: "Crafted to feel quiet, lasting, and unmistakably refined.",
  active: true,
  order: 0,
};

const buttonLinkOptions = [
  { label: "Collection", value: "/Collection" },
  { label: "Gift Sets", value: "/gift-sets" },
  { label: "About", value: "/About" },
  { label: "Contact", value: "/Contact" },
];

const normalizeStatement = (statement = {}) => {
  const details = Array.isArray(statement.details) ? statement.details : [];
  return {
    ...defaultStatement,
    ...statement,
    details: [
      details[0] || defaultStatement.details[0],
      details[1] || defaultStatement.details[1],
    ],
    buttonLink: buttonLinkOptions.some((option) => option.value === statement.buttonLink)
      ? statement.buttonLink
      : defaultStatement.buttonLink,
    active: statement.active === undefined ? true : Boolean(statement.active),
  };
};

const ImagePreview = ({ file, image, alt }) => {
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!file) {
      setSource("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!source && !image) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#eee4d9] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a49181]">
        Add image
      </div>
    );
  }

  return (
    <img
      src={source || image}
      alt={alt || "Brand statement preview"}
      className="h-full w-full object-cover"
    />
  );
};

const BrandStatementManager = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statement, setStatement] = useState(defaultStatement);
  const [image, setImage] = useState(null);

  const details = useMemo(
    () => [
      statement.details?.[0] || defaultStatement.details[0],
      statement.details?.[1] || defaultStatement.details[1],
    ],
    [statement.details]
  );

  const loadPage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/brand-statement`);
      if (res.data?.success) {
        const next = (res.data.statements || [])
          .filter((item) => item.active !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))[0];
        setStatement(normalizeStatement(next || defaultStatement));
        setImage(null);
      } else {
        toast.error(res.data?.message || "Failed to load brand statement");
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
    setStatement((current) => ({ ...current, [field]: value }));
  };

  const setDetail = (index, field, value) => {
    setStatement((current) => {
      const nextDetails = [
        current.details?.[0] || defaultStatement.details[0],
        current.details?.[1] || defaultStatement.details[1],
      ];
      nextDetails[index] = { ...nextDetails[index], [field]: value };
      return { ...current, details: nextDetails };
    });
  };

  const resetToMock = () => {
    setStatement(defaultStatement);
    setImage(null);
  };

  const saveStatement = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const body = new FormData();
      [
        "eyebrow",
        "title",
        "description",
        "buttonText",
        "buttonLink",
        "imageAlt",
        "imageEyebrow",
        "imageTitle",
      ].forEach((field) => body.append(field, statement[field] || ""));

      body.append("details", JSON.stringify(details));
      body.append("active", String(statement.active !== false));
      body.append("order", String(statement.order || 0));
      body.append("image", statement.image || "");
      if (image) body.append("image", image);

      const res = await axios.post(`${backendUrl}/api/brand-statement/update`, body, {
        headers: { token },
      });

      if (res.data?.success) {
        toast.success("Proudly Made section saved");
        const next = res.data.statement || res.data.statements?.[0];
        setStatement(normalizeStatement(next || statement));
        setImage(null);
      } else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminFormPreviewSkeleton />;

  return (
    <main className="mx-auto w-full max-w-[1480px] text-[#1f1b17]">
      <div className="mb-5 flex flex-col gap-3 border-b border-[#eadfd2] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b9945d]">
            Brand Statement
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            Proudly Made
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Control the homepage Proudly Made section from the same backend data the storefront reads.
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
            onClick={resetToMock}
            className="rounded-full border border-[#d8c2a5] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Mock Default
          </button>
          <button
            type="submit"
            form="brand-statement-form"
            disabled={saving}
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
          >
            {saving ? "Saving..." : "Save Section"}
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Frontend Section", value: "Homepage" },
          { label: "Content Source", value: "Backend" },
          { label: "Detail Blocks", value: details.filter((item) => item.title || item.text).length },
          { label: "Status", value: statement.active === false ? "Hidden" : "Active" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
              {stat.label}
            </p>
            <p className="mt-2 truncate font-serif text-2xl leading-none text-[#1f1b17]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <form
          id="brand-statement-form"
          onSubmit={saveStatement}
          className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Homepage Section
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                Edit Proudly Made content
              </h2>
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              <input
                type="checkbox"
                checked={statement.active !== false}
                onChange={() => setField("active", statement.active === false)}
              />
              Active
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <label className="block">
              <span className={labelClass}>Image</span>
              <div className="aspect-[4/5] overflow-hidden rounded-md border border-dashed border-[#d8c2a5] bg-[#fffdf9]">
                <ImagePreview file={image} image={statement.image} alt={statement.imageAlt} />
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
                  <label className={labelClass}>Eyebrow</label>
                  <input
                    value={statement.eyebrow}
                    onChange={(event) => setField("eyebrow", event.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Button Text</label>
                  <input
                    value={statement.buttonText}
                    onChange={(event) => setField("buttonText", event.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Title</label>
                <input
                  value={statement.title}
                  onChange={(event) => setField("title", event.target.value)}
                  className={fieldClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={statement.description}
                  onChange={(event) => setField("description", event.target.value)}
                  className={`${fieldClass} min-h-28 resize-none`}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Button Link</label>
                  <select
                    value={statement.buttonLink}
                    onChange={(event) => setField("buttonLink", event.target.value)}
                    className={fieldClass}
                  >
                    {buttonLinkOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Image Alt Text</label>
                  <input
                    value={statement.imageAlt}
                    onChange={(event) => setField("imageAlt", event.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#eadfd2] bg-[#fffdf9] p-3">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a8068]">
                  Detail Blocks
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {details.map((detail, index) => (
                    <div key={index} className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-3">
                      <label className={labelClass}>Detail {index + 1} Title</label>
                      <input
                        value={detail.title}
                        onChange={(event) => setDetail(index, "title", event.target.value)}
                        className={fieldClass}
                      />
                      <label className={`${labelClass} mt-3`}>Detail {index + 1} Text</label>
                      <input
                        value={detail.text}
                        onChange={(event) => setDetail(index, "text", event.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Image Eyebrow</label>
                  <input
                    value={statement.imageEyebrow}
                    onChange={(event) => setField("imageEyebrow", event.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Image Title</label>
                  <input
                    value={statement.imageTitle}
                    onChange={(event) => setField("imageTitle", event.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                  Live Frontend Preview
                </p>
                <h2 className="font-serif text-2xl text-[#1f1b17]">
                  Proudly Made section
                </h2>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Live
              </span>
            </div>

            <div className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
              <div className="relative aspect-[4/5] bg-[#eee4d9]">
                <ImagePreview file={image} image={statement.image} alt={statement.imageAlt} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b778]">
                    {statement.imageEyebrow}
                  </p>
                  <p className="mt-2 font-serif text-2xl leading-tight">
                    {statement.imageTitle}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
                  {statement.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-3xl leading-none text-[#1f1b17]">
                  {statement.title}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#7d6756]">
                  {statement.description}
                </p>
                <div className="mt-4 grid gap-2">
                  {details.map((detail) => (
                    <div key={detail.title} className="border-l border-[#c49a5e] pl-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1f1b17]">
                        {detail.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#7d6756]">
                        {detail.text}
                      </p>
                    </div>
                  ))}
                </div>
                <span className="mt-5 inline-flex rounded-full bg-[#1f1b17] px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                  {statement.buttonText}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
};

export default BrandStatementManager;
