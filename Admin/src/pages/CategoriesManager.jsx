import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const defaultGroups = [
  {
    label: "Abaya",
    active: true,
    order: 0,
    children: [{ label: "Abaya", active: true, order: 0 }],
  },
  {
    label: "Dresses",
    active: true,
    order: 1,
    children: [{ label: "Dresses", active: true, order: 0 }],
  },
  {
    label: "Hijabs",
    active: true,
    order: 2,
    children: [{ label: "Hijabs", active: true, order: 0 }],
  },
  {
    label: "Islamic Essentials",
    active: true,
    order: 3,
    children: [{ label: "Islamic Essentials", active: true, order: 0 }],
  },
  {
    label: "Blouses",
    active: true,
    order: 4,
    children: [{ label: "Blouses", active: true, order: 0 }],
  },
];

const fieldClass =
  "min-h-11 w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10";

const labelClass =
  "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-black/55";

const normalizeGroups = (groups = []) =>
  groups.map((group, groupIndex) => ({
    _localId: group._localId || group._id || `group-${Date.now()}-${groupIndex}`,
    label: group.label || "",
    slug: group.slug || "",
    image: group.image || "",
    imageFileId: group.imageFileId || "",
    _imageFile: null,
    _imagePreview: "",
    active: group.active !== false,
    order: group.order ?? groupIndex,
    children: (group.children || []).map((child, childIndex) => ({
      _localId:
        child._localId ||
        child._id ||
        `child-${group._id || groupIndex}-${Date.now()}-${childIndex}`,
      label: child.label || "",
      slug: child.slug || "",
      active: child.active !== false,
      order: child.order ?? childIndex,
    })),
  }));

const CategoriesManager = ({ token }) => {
  const [groups, setGroups] = useState(defaultGroups);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const groupRefs = useRef({});
  const childRefs = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/categories/list`);
      if (res.data?.success) {
        setGroups(normalizeGroups(res.data.groups || defaultGroups));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load categories");
      setGroups(defaultGroups);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateGroup = (index, patch) =>
    setGroups((current) => {
      const next = [...current];
      next[index] = { ...next[index], ...patch };
      return next;
    });

  const updateChild = (groupIndex, childIndex, patch) =>
    setGroups((current) => {
      const next = [...current];
      const group = { ...next[groupIndex] };
      const children = [...(group.children || [])];
      children[childIndex] = { ...children[childIndex], ...patch };
      group.children = children;
      next[groupIndex] = group;
      return next;
    });

  const addGroup = () => {
    const id = `group-new-${Date.now()}`;
    setGroups((current) => [
      ...current,
      {
        _localId: id,
        label: "",
        slug: "",
        image: "",
        imageFileId: "",
        _imageFile: null,
        _imagePreview: "",
        active: true,
        order: current.length,
        children: [],
      },
    ]);
    setTimeout(() => {
      groupRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      groupRefs.current[id]?.querySelector("input")?.focus();
    }, 80);
  };

  const addChild = (groupIndex) => {
    const id = `child-new-${Date.now()}`;
    setGroups((current) => {
      const next = [...current];
      const group = { ...next[groupIndex] };
      const children = [...(group.children || [])];
      children.push({
        _localId: id,
        label: "",
        slug: "",
        active: true,
        order: children.length,
      });
      group.children = children;
      next[groupIndex] = group;
      return next;
    });
    setTimeout(() => {
      childRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
      childRefs.current[id]?.querySelector("input")?.focus();
    }, 80);
  };

  const removeGroup = (index) =>
    setGroups((current) => current.filter((_, groupIndex) => groupIndex !== index));

  const removeChild = (groupIndex, childIndex) =>
    setGroups((current) => {
      const next = [...current];
      const group = { ...next[groupIndex] };
      group.children = (group.children || []).filter(
        (_, index) => index !== childIndex
      );
      next[groupIndex] = group;
      return next;
    });

  const chooseGroupImage = (groupIndex, file) => {
    if (!file) return;
    setGroups((current) => {
      const next = [...current];
      const group = { ...next[groupIndex] };
      if (group._imagePreview) URL.revokeObjectURL(group._imagePreview);
      group._imageFile = file;
      group._imagePreview = URL.createObjectURL(file);
      next[groupIndex] = group;
      return next;
    });
  };

  const clearGroupImage = (groupIndex) =>
    setGroups((current) => {
      const next = [...current];
      const group = { ...next[groupIndex] };
      if (group._imagePreview) URL.revokeObjectURL(group._imagePreview);
      group.image = "";
      group.imageFileId = "";
      group._imageFile = null;
      group._imagePreview = "";
      next[groupIndex] = group;
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append(
        "groups",
        JSON.stringify(
          groups.map(({ _imageFile, _imagePreview, _localId, children, ...group }) => ({
            ...group,
            children: (children || []).map(({ _localId: _childLocalId, ...child }) => child),
          }))
        )
      );
      groups.forEach((group, index) => {
        if (group._imageFile) form.append(`groupImage${index}`, group._imageFile);
      });
      const res = await axios.post(
        `${backendUrl}/api/categories/save`,
        form,
        { headers: { token, "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.success) {
        toast.success("Categories updated");
        setGroups(normalizeGroups(res.data.groups));
      } else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    if (!confirm("Restore SotraBrand default categories?")) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/categories/restore-defaults`,
        {},
        { headers: { token } }
      );
      if (res.data?.success) {
        toast.success("Default categories restored");
        setGroups(normalizeGroups(res.data.groups));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[1480px]">
        <div className="admin-skeleton h-40" />
        <div className="admin-skeleton mt-5 h-96" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] text-black">
      <div className="mb-5 flex flex-col gap-3 border-b border-black/15 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#c47b92]">
            Menu + Collections
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none">Category Manager</h1>
          <p className="mt-2 text-sm text-black/55">
            Control the storefront menu, product category options, and homepage collections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addGroup}
            className="border border-black px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
          >
            Add Group
          </button>
          <button
            type="button"
            onClick={restoreDefaults}
            className="border border-black/30 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-black"
          >
            Restore Defaults
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-black px-6 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#222] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Categories"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {groups.map((group, groupIndex) => (
          <section
            key={group._localId || groupIndex}
            ref={(node) => {
              if (node && group._localId) groupRefs.current[group._localId] = node;
            }}
            className="border border-black/15 bg-white p-4 shadow-[0_16px_38px_rgba(0,0,0,0.05)]"
          >
            <div className="grid gap-3 border-b border-black/10 pb-4 lg:grid-cols-[150px_minmax(0,1fr)_140px_120px_auto]">
              <div>
                <label className={labelClass}>Homepage Picture</label>
                <div className="aspect-[4/3] overflow-hidden border border-black/15 bg-[#EAEAEA]">
                  {group._imagePreview || group.image ? (
                    <img
                      src={group._imagePreview || group.image}
                      alt={group.label || "Category"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center px-3 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-black/35">
                      Category Image
                    </div>
                  )}
                </div>
                <label className="mt-2 block cursor-pointer border border-black px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] transition hover:bg-black hover:text-white">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => chooseGroupImage(groupIndex, event.target.files?.[0])}
                  />
                </label>
                {(group._imagePreview || group.image) && (
                  <button
                    type="button"
                    onClick={() => clearGroupImage(groupIndex)}
                    className="mt-2 w-full border border-[#7b2d2d]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
              <div>
                <label className={labelClass}>Main Category</label>
                <input
                  className={fieldClass}
                  value={group.label}
                  placeholder="Abaya"
                  onChange={(event) => updateGroup(groupIndex, { label: event.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  className={fieldClass}
                  value={group.slug || ""}
                  placeholder="auto"
                  onChange={(event) => updateGroup(groupIndex, { slug: event.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input
                  type="number"
                  className={fieldClass}
                  value={group.order}
                  onChange={(event) => updateGroup(groupIndex, { order: Number(event.target.value) })}
                />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex h-11 items-center gap-2 border border-black/15 px-3 text-xs font-bold uppercase tracking-[0.14em]">
                  <input
                    type="checkbox"
                    checked={group.active !== false}
                    onChange={(event) => updateGroup(groupIndex, { active: event.target.checked })}
                    className="h-4 w-4 accent-black"
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => removeGroup(groupIndex)}
                  className="h-11 border border-[#7b2d2d] px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(group.children || []).map((child, childIndex) => (
                <div
                  key={child._localId || childIndex}
                  ref={(node) => {
                    if (node && child._localId) childRefs.current[child._localId] = node;
                  }}
                  className="grid gap-3 bg-[#f7f7f7] p-3 lg:grid-cols-[minmax(0,1fr)_150px_110px_auto]"
                >
                  <div>
                    <label className={labelClass}>Storefront Category</label>
                    <input
                      className={fieldClass}
                      value={child.label}
                      placeholder="Abaya"
                      onChange={(event) =>
                        updateChild(groupIndex, childIndex, { label: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Slug</label>
                    <input
                      className={fieldClass}
                      value={child.slug || ""}
                      placeholder="auto"
                      onChange={(event) =>
                        updateChild(groupIndex, childIndex, { slug: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Order</label>
                    <input
                      type="number"
                      className={fieldClass}
                      value={child.order}
                      onChange={(event) =>
                        updateChild(groupIndex, childIndex, {
                          order: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex h-11 items-center gap-2 border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em]">
                      <input
                        type="checkbox"
                        checked={child.active !== false}
                        onChange={(event) =>
                          updateChild(groupIndex, childIndex, {
                            active: event.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-black"
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => removeChild(groupIndex, childIndex)}
                      className="h-11 border border-[#7b2d2d] px-4 text-xs font-bold uppercase tracking-[0.14em] text-[#7b2d2d] transition hover:bg-[#7b2d2d] hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addChild(groupIndex)}
              className="mt-4 border border-black px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-black hover:text-white"
            >
              Add Storefront Category
            </button>
          </section>
        ))}
      </div>
    </main>
  );
};

export default CategoriesManager;
