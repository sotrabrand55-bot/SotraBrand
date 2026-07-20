import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const fieldClass =
  "min-h-11 w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/30 focus:border-black focus:ring-2 focus:ring-black/10";

const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";

const panelClass =
  "border border-black/15 bg-white p-4 shadow-[0_16px_38px_rgba(0,0,0,0.05)]";

const buttonBlack =
  "bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:cursor-wait disabled:opacity-45";

const emptyImages = {
  aboutImage: "",
  aboutImageAlt: "SotraBrand collection",
  contactImage: "",
  contactImageAlt: "SotraBrand contact",
};

const imageFields = [
  {
    key: "aboutImage",
    fileKey: "aboutFile",
    altKey: "aboutImageAlt",
    title: "About Us Image",
    note: "Recommended: elegant vertical or wide brand image. Use bright white space where possible.",
  },
  {
    key: "contactImage",
    fileKey: "contactFile",
    altKey: "contactImageAlt",
    title: "Contact Us Image",
    note: "Recommended: clean product or beauty image that works on mobile and laptop.",
  },
];

const PageImagesManager = ({ token }) => {
  const [pageImages, setPageImages] = useState(emptyImages);
  const [files, setFiles] = useState({ aboutFile: null, contactFile: null });
  const [previews, setPreviews] = useState({ aboutFile: "", contactFile: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/page-images/list`);
      if (res.data?.success) {
        setPageImages({ ...emptyImages, ...(res.data.pageImages || {}) });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load page images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(
    () => () => {
      Object.values(previews).forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    },
    [previews]
  );

  const chooseFile = (fileKey, file) => {
    setFiles((current) => ({ ...current, [fileKey]: file || null }));
    setPreviews((current) => {
      if (current[fileKey]) URL.revokeObjectURL(current[fileKey]);
      return { ...current, [fileKey]: file ? URL.createObjectURL(file) : "" };
    });
  };

  const updateAlt = (key, value) => {
    setPageImages((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("aboutImageAlt", pageImages.aboutImageAlt || "");
      form.append("contactImageAlt", pageImages.contactImageAlt || "");
      if (files.aboutFile) form.append("aboutImage", files.aboutFile);
      if (files.contactFile) form.append("contactImage", files.contactFile);

      const res = await axios.post(`${backendUrl}/api/page-images/update`, form, {
        headers: { token, "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.success) throw new Error(res.data?.message || "Failed to save page images");
      setPageImages({ ...emptyImages, ...(res.data.pageImages || {}) });
      setFiles({ aboutFile: null, contactFile: null });
      setPreviews((current) => {
        Object.values(current).forEach((preview) => {
          if (preview) URL.revokeObjectURL(preview);
        });
        return { aboutFile: "", contactFile: "" };
      });
      toast.success("About and Contact images updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mb-6 border border-black/15 bg-white p-5 shadow-[0_18px_46px_rgba(0,0,0,0.05)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
          Nancy Studio
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.03em]">
          Page Images
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
          Control the main images used on About Us and Contact Us without changing
          the page layout.
        </p>
      </div>

      {loading ? (
        <div className="grid min-h-[360px] place-items-center border border-black/10 bg-[#EAEAEA] text-xs font-bold uppercase tracking-[0.2em] text-black/45">
          Loading Images
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {imageFields.map((field) => {
            const preview = previews[field.fileKey] || pageImages[field.key] || "";
            return (
              <section key={field.key} className={panelClass}>
                <div className="mb-4 border-b border-black/15 pb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c47b92]">
                    Editable Page
                  </p>
                  <h2 className="mt-1 text-2xl font-black uppercase">{field.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-black/50">{field.note}</p>
                </div>

                <div className="aspect-[4/5] overflow-hidden bg-[#EAEAEA] sm:aspect-[16/10]">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                      Page Image
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-4">
                  <div>
                    <label className={labelClass}>Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className={fieldClass}
                      onChange={(event) => chooseFile(field.fileKey, event.target.files?.[0])}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Alt Text</label>
                    <input
                      className={fieldClass}
                      value={pageImages[field.altKey] || ""}
                      onChange={(event) => updateAlt(field.altKey, event.target.value)}
                    />
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={save} disabled={saving || loading} className={buttonBlack}>
          {saving ? "Saving..." : "Save Page Images"}
        </button>
      </div>
    </main>
  );
};

export default PageImagesManager;
