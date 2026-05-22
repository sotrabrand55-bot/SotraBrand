import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminFormPreviewSkeleton, AdminInlineSkeleton } from "../components/AdminSkeletons";

const SUBS = ["Amber","Floral","Fresh","Woods","Oud","Musk","Citrus","Gift Sets"]; // must match frontend subCategory values

const SubcatTiles = ({ token }) => {
  // form state
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [subKey, setSubKey] = useState(SUBS[0]);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);

  // edit mode
  const [editingId, setEditingId] = useState(null);

  // list state
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/subcat-tiles/list`);
      if (res.data?.success) {
        const sorted = res.data.tiles
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.title || "").localeCompare(b.title || ""));
        setTiles(sorted);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load tiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setImage(null);
    setTitle("");
    setSubKey(SUBS[0]);
    setActive(true);
    setOrder(0);
    setEditingId(null);
  };

  const addOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      if (image) fd.append("image", image); // optional on edit
      fd.append("title", title || subKey);
      fd.append("subKey", subKey);
      fd.append("active", String(active));
      fd.append("order", String(order));

      if (!editingId) {
        if (!image) return toast.error("Please select an image.");
        const res = await axios.post(`${backendUrl}/api/subcat-tiles/add`, fd, { headers: { token } });
        if (res.data?.success) {
          toast.success("Tile added");
          resetForm();
          load();
        } else {
          toast.error(res.data?.message || "Failed to add tile");
        }
      } else {
        const res = await axios.put(`${backendUrl}/api/subcat-tiles/update/${editingId}`, fd, { headers: { token } });
        if (res.data?.success) {
          toast.success("Tile updated");
          resetForm();
          load();
        } else {
          toast.error(res.data?.message || "Failed to update tile");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Request failed");
    }
  };

  const startEdit = (t) => {
    setEditingId(t._id);
    setImage(null); // keep existing unless user picks a new one
    setTitle(t.title || "");
    setSubKey(t.subKey || SUBS[0]);
    setActive(!!t.active);
    setOrder(t.order ?? 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this tile?")) return;
    try {
      await axios.post(`${backendUrl}/api/subcat-tiles/remove`, { id }, { headers: { token } });
      toast.success("Removed");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const toggleActive = async (t) => {
    try {
      const res = await axios.put(
        `${backendUrl}/api/subcat-tiles/update/${t._id}`,
        { active: !t.active },
        { headers: { token } }
      );
      if (res.data?.success) {
        setTiles(prev => prev.map(x => x._id === t._id ? { ...x, active: !t.active } : x));
      } else {
        toast.error("Failed to toggle");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Toggle failed");
    }
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= tiles.length) return;
    const a = tiles[idx];
    const b = tiles[j];

    try {
      await axios.put(`${backendUrl}/api/subcat-tiles/update/${a._id}`, { order: b.order ?? 0 }, { headers: { token } });
      await axios.put(`${backendUrl}/api/subcat-tiles/update/${b._id}`, { order: a.order ?? 0 }, { headers: { token } });
      const cloned = tiles.slice();
      [cloned[idx], cloned[j]] = [cloned[j], cloned[idx]];
      setTiles(cloned);
    } catch (e) {
      toast.error("Reorder failed");
    }
  };

  if (loading) return <AdminFormPreviewSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Subcategory Tiles</h2>

      {/* FORM */}
      <form onSubmit={addOrUpdate} className="flex flex-col gap-3 bg-white p-5 rounded-xl border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <label className="block">
            <span className="text-sm">
              Image {editingId ? <em className="text-gray-400">(leave empty to keep current)</em> : ""}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e)=>setImage(e.target.files[0])}
              className="block mt-1"
              required={!editingId}
            />
            {(image) && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="w-40 h-28 object-cover rounded border"
                />
              </div>
            )}
          </label>

          <label className="block">
            <span className="text-sm">Title (optional)</span>
            <input
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="px-3 py-2 border rounded w-full"
              placeholder="e.g. Amber extrait"
            />
            <p className="text-xs text-gray-400 mt-1">Defaults to subcategory name if left empty.</p>
          </label>

          <label className="block">
            <span className="text-sm">Subcategory key</span>
            <select
              value={subKey}
              onChange={(e)=>setSubKey(e.target.value)}
              className="px-3 py-2 border rounded w-full"
            >
              {SUBS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={active} onChange={()=>setActive(p=>!p)} />
              Active
            </label>
            <label className="flex items-center gap-2 mt-6">
              Order
              <input
                type="number"
                value={order}
                onChange={(e)=>setOrder(e.target.value)}
                className="px-2 py-1 border rounded w-24"
              />
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">
            {editingId ? "Save Changes" : "Add Tile"}
          </button>
          {editingId && (
            <button type="button" className="px-4 py-2 border rounded" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* PREVIEW TOGGLE */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manage Tiles</h3>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPreviews}
            onChange={() => setShowPreviews(v => !v)}
          />
          Show previews
        </label>
      </div>

      {/* LIST */}
      {showPreviews && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <AdminInlineSkeleton cards={3} className="md:col-span-2 lg:col-span-3 md:grid-cols-2 lg:grid-cols-3" />
          ) : tiles.length === 0 ? (
            <p className="text-sm text-gray-500">No tiles yet.</p>
          ) : (
            tiles.map((t, idx) => (
              <div key={t._id} className="border rounded-xl overflow-hidden bg-white">
                <div className="aspect-[3/2] bg-gray-100">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{t.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {t.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <div className="text-gray-500">subKey: {t.subKey}</div>
                  <div className="text-gray-500">order: {t.order ?? 0}</div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button className="px-3 py-1 text-xs rounded border" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    <button className="px-3 py-1 text-xs rounded border" onClick={() => toggleActive(t)}>
                      {t.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded border border-red-400 text-red-500"
                      onClick={() => remove(t._id)}
                    >
                      Delete
                    </button>

                    <div className="ml-auto flex gap-1">
                      <button
                        className="px-2 py-1 text-xs rounded border"
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded border"
                        onClick={() => move(idx, +1)}
                        disabled={idx === tiles.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubcatTiles;
