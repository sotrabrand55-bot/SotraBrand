import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const defaultGroups = [
  {
    label: "Pheromone Touch",
    active: true,
    order: 0,
    children: [
      { label: "Pheromone Touch", active: true, order: 0 },
      { label: "Body lotion pheromone", active: true, order: 1 },
      { label: "Body oil pheromone", active: true, order: 2 },
      { label: "Body splash pheromone", active: true, order: 3 },
      { label: "Body scrub pheromone", active: true, order: 4 },
    ],
  },
  {
    label: "Mystique Set",
    active: true,
    order: 1,
    children: [
      { label: "Mystique parfum", active: true, order: 0 },
      { label: "Body lotion mystique", active: true, order: 1 },
      { label: "Body splash mystique", active: true, order: 2 },
    ],
  },
  {
    label: "Roll-on",
    active: true,
    order: 2,
    children: [{ label: "Radiant charm", active: true, order: 0 }],
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

  const save = async () => {
    setSaving(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/categories/save`,
        { groups },
        { headers: { token } }
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
    if (!confirm("Restore Nancy default categories?")) return;
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
            Menu + Collection
          </p>
          <h1 className="mt-1 font-serif text-4xl leading-none">Category Manager</h1>
          <p className="mt-2 text-sm text-black/55">
            Control desktop hover dropdowns, mobile menu dropdowns, and collection filters.
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
            <div className="grid gap-3 border-b border-black/10 pb-4 lg:grid-cols-[minmax(0,1fr)_140px_120px_auto]">
              <div>
                <label className={labelClass}>Main Category</label>
                <input
                  className={fieldClass}
                  value={group.label}
                  placeholder="Pheromone Touch"
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
                    <label className={labelClass}>Subcategory</label>
                    <input
                      className={fieldClass}
                      value={child.label}
                      placeholder="Body oil pheromone"
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
              Add Subcategory
            </button>
          </section>
        ))}
      </div>
    </main>
  );
};

export default CategoriesManager;
