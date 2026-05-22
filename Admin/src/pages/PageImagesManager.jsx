import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { AdminFormPreviewSkeleton } from "../components/AdminSkeletons";

const fieldClass =
  "min-h-11 w-full rounded-md border border-[#dfd1c1] bg-[#fffdf9] px-3 py-2 text-sm text-[#1f1b17] outline-none transition placeholder:text-[#a49181] focus:border-[#c49a5e] focus:ring-2 focus:ring-[#c49a5e]/15";

const labelClass =
  "mb-1.5 block text-[10px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#7d6756]";

const defaultImages = {
  aboutImage: "",
  aboutImageAlt: "LEVON fragrance collection",
  contactImage: "",
  contactImageAlt: "Levon perfume contact",
};

const ImagePreview = ({ file, image, alt, aspect = "aspect-[4/5]" }) => {
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
      <div
        className={`${aspect} grid w-full place-items-center bg-[#eee4d9] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a49181]`}
      >
        Add image
      </div>
    );
  }

  return (
    <div className={`${aspect} overflow-hidden bg-[#eee4d9]`}>
      <img
        src={source || image}
        alt={alt || "Page image preview"}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

const PageImagesManager = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState(defaultImages);
  const [aboutFile, setAboutFile] = useState(null);
  const [contactFile, setContactFile] = useState(null);

  const loadPage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/page-images`);
      if (res.data?.success) {
        setImages({ ...defaultImages, ...(res.data.pageImages || {}) });
        setAboutFile(null);
        setContactFile(null);
      } else {
        toast.error(res.data?.message || "Failed to load page images");
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
    setImages((current) => ({ ...current, [field]: value }));
  };

  const saveImages = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const body = new FormData();
      body.append("aboutImage", images.aboutImage || "");
      body.append("contactImage", images.contactImage || "");
      body.append("aboutImageAlt", images.aboutImageAlt || "");
      body.append("contactImageAlt", images.contactImageAlt || "");
      if (aboutFile) body.append("aboutImage", aboutFile);
      if (contactFile) body.append("contactImage", contactFile);

      const res = await axios.post(`${backendUrl}/api/page-images/update`, body, {
        headers: { token },
      });

      if (res.data?.success) {
        toast.success("About and Contact images saved");
        setImages({ ...defaultImages, ...(res.data.pageImages || {}) });
        setAboutFile(null);
        setContactFile(null);
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
            Page Images
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none text-[#1f1b17]">
            About + Contact
          </h1>
          <p className="mt-2 text-sm text-[#7d6756]">
            Control only the main image on About Us and the main image on Contact Us.
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
            type="submit"
            form="page-images-form"
            disabled={saving}
            className="rounded-full bg-[#1f1b17] px-6 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#c49a5e] disabled:cursor-wait disabled:bg-[#7d6756]"
          >
            {saving ? "Saving..." : "Save Images"}
          </button>
        </div>
      </div>

      <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "About Image", value: images.aboutImage ? "Set" : "Fallback" },
          { label: "Contact Image", value: images.contactImage ? "Set" : "Fallback" },
          { label: "Backend Sync", value: "Live" },
          { label: "Loading UI", value: "Skeleton" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_14px_34px_rgba(62,45,28,0.06)]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8068]">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-2xl leading-none text-[#1f1b17]">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <form
        id="page-images-form"
        onSubmit={saveImages}
        className="grid gap-5 xl:grid-cols-2"
      >
        <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                About Us
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                About page image
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              /About
            </span>
          </div>

          <div className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
            <ImagePreview
              file={aboutFile}
              image={images.aboutImage}
              alt={images.aboutImageAlt}
              aspect="aspect-[4/5]"
            />
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <label className={labelClass}>Image Alt Text</label>
              <input
                value={images.aboutImageAlt}
                onChange={(event) => setField("aboutImageAlt", event.target.value)}
                className={fieldClass}
              />
            </div>
            <label className="cursor-pointer rounded-full border border-[#d8c2a5] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]">
              Change About Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setAboutFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-md border border-[#eadfd2] bg-[#fffaf4] p-4 shadow-[0_18px_45px_rgba(62,45,28,0.08)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9945d]">
                Contact Us
              </p>
              <h2 className="font-serif text-2xl text-[#1f1b17]">
                Contact page image
              </h2>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
              /Contact
            </span>
          </div>

          <div className="overflow-hidden rounded-md border border-[#eadfd2] bg-[#fffdf9]">
            <ImagePreview
              file={contactFile}
              image={images.contactImage}
              alt={images.contactImageAlt}
              aspect="aspect-[487/459]"
            />
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <label className={labelClass}>Image Alt Text</label>
              <input
                value={images.contactImageAlt}
                onChange={(event) => setField("contactImageAlt", event.target.value)}
                className={fieldClass}
              />
            </div>
            <label className="cursor-pointer rounded-full border border-[#d8c2a5] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5844] transition hover:border-[#1f1b17] hover:text-[#1f1b17]">
              Change Contact Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => setContactFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
        </section>
      </form>
    </main>
  );
};

export default PageImagesManager;
