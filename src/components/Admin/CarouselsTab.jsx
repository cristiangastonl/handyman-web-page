import { useState, useEffect, useCallback } from "react";
import { R, S, itemThumb } from "../../lib/constants";
import { fetchCarouselItems, addCarouselItem, removeCarouselItem, updateCarouselOrder } from "../../lib/supabase";
import DragList from "./DragList";

const CAROUSEL_TYPES = [
  { key: "recent_works", label: "Recent Works" },
  { key: "highlights", label: "Highlights" },
  { key: "returning_customers", label: "Returning Customers" },
  { key: "tailor_jobs", label: "Tailor Jobs" },
];

const PAGE_SIZE = 24;

const normalizeItem = (ci) => ({
  carouselItemId: ci.id,
  id: ci.work_items?.id,
  type: ci.work_items?.type,
  cat: ci.work_items?.cat,
  src: ci.work_items?.src,
  thumb: ci.work_items?.thumb,
  title: ci.work_items?.title,
  desc: ci.work_items?.description,
  videoId: ci.work_items?.video_id,
  sort_order: ci.sort_order,
});

export default function CarouselsTab({ items, cats, carouselData, setCarouselData, flash, adminLoading, setAdminLoading }) {
  const [subTab, setSubTab] = useState("recent_works");
  const [loaded, setLoaded] = useState({});
  const [page, setPage] = useState(0);
  const [filterCat, setFilterCat] = useState("");

  // Reset page when switching sub-tab or filter
  useEffect(() => { setPage(0); }, [subTab, filterCat]);

  // Load carousel items when sub-tab changes
  useEffect(() => {
    if (loaded[subTab]) return;
    (async () => {
      try {
        const data = await fetchCarouselItems(subTab);
        if (data) {
          setCarouselData(prev => ({ ...prev, [subTab]: data.map(normalizeItem) }));
        }
        setLoaded(prev => ({ ...prev, [subTab]: true }));
      } catch (err) {
        console.warn("Carousel load error:", err.message);
      }
    })();
  }, [subTab, loaded, setCarouselData]);

  const currentItems = carouselData[subTab] || [];

  // Filter portfolio items
  const filteredPortfolio = items.filter(i => i.id && (!filterCat || i.cat === filterCat));
  const totalPages = Math.ceil(filteredPortfolio.length / PAGE_SIZE);
  const pagedItems = filteredPortfolio.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAdd = async (workItemId) => {
    if (currentItems.some(ci => ci.id === workItemId)) return;
    setAdminLoading(true);
    try {
      const saved = await addCarouselItem(subTab, workItemId, currentItems.length);
      if (saved) {
        setCarouselData(prev => ({
          ...prev,
          [subTab]: [...prev[subTab], normalizeItem(saved)],
        }));
      }
      flash("Added to carousel");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleRemove = async (carouselItemId) => {
    setAdminLoading(true);
    try {
      await removeCarouselItem(carouselItemId);
      setCarouselData(prev => ({
        ...prev,
        [subTab]: prev[subTab].filter(ci => ci.carouselItemId !== carouselItemId),
      }));
      flash("Removed from carousel");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleReorder = useCallback(async (reordered) => {
    setCarouselData(prev => ({ ...prev, [subTab]: reordered }));
    try {
      const ids = reordered.map(ci => ci.carouselItemId).filter(Boolean);
      if (ids.length) await updateCarouselOrder(ids);
      flash("Order saved");
    } catch (err) { flash("Error saving order: " + err.message); }
  }, [subTab, setCarouselData, flash]);

  return (
    <div>
      <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
        <strong>How it works:</strong> Each carousel shows a curated selection of items from your Portfolio on the home page. Select which portfolio items to feature in each carousel. Drag to reorder.
      </div>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 18, borderBottom: "2px solid #f0f0f0", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {CAROUSEL_TYPES.map(({ key, label }) => (
          <button key={key} onClick={() => setSubTab(key)}
            style={{ padding: "5px 12px", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: subTab === key ? 600 : 400, color: subTab === key ? R : "#999", borderBottom: subTab === key ? `2px solid ${R}` : "2px solid transparent", marginBottom: -2, flexShrink: 0, whiteSpace: "nowrap" }}>
            {label} ({(carouselData[key] || []).length})
          </button>
        ))}
      </div>

      {/* Current items in carousel */}
      <p style={S.label}>Current items ({currentItems.length})</p>
      {currentItems.length === 0 ? (
        <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "18px 0" }}>No items in this carousel. Select from portfolio below.</p>
      ) : (
        <DragList
          items={currentItems}
          keyFn={(ci) => ci.carouselItemId || ci.id}
          onReorder={handleReorder}
          renderItem={(ci) => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={itemThumb(ci)} alt="" style={{ width: 52, height: 36, objectFit: "cover", borderRadius: 5, background: "#eee" }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ci.title}</div>
                <div style={{ fontSize: 10, color: "#777" }}>{ci.type} · {cats.find(c => c.id === ci.cat)?.label || ci.cat}</div>
              </div>
              <button className="admin-ghost" onClick={() => handleRemove(ci.carouselItemId)} disabled={adminLoading}
                style={{ ...S.btnDanger, opacity: adminLoading ? 0.5 : 1 }}>Remove</button>
            </div>
          )}
        />
      )}

      {/* Portfolio item picker */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, gap: 8, flexWrap: "wrap" }}>
        <p style={{ ...S.label, margin: 0 }}>Select from Portfolio ({filteredPortfolio.length})</p>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: "4px 8px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 11, color: filterCat ? "#222" : "#aaa" }}>
          <option value="">All categories</option>
          {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginTop: 8 }}>
        {pagedItems.map(item => {
          const isInCarousel = currentItems.some(ci => ci.id === item.id);
          return (
            <div key={item.id}
              onClick={() => isInCarousel ? handleRemove(currentItems.find(ci => ci.id === item.id)?.carouselItemId) : handleAdd(item.id)}
              style={{
                position: "relative", paddingTop: "100%", borderRadius: 8, overflow: "hidden", cursor: "pointer",
                border: isInCarousel ? `2px solid ${R}` : "1px solid #eee",
                opacity: adminLoading ? 0.5 : 1,
              }}>
              <img src={itemThumb(item)} alt={item.title}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
              {isInCarousel && (
                <div style={{
                  position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
                  background: R, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#fff", fontWeight: 700,
                }}>✓</div>
              )}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, padding: "2px 4px",
                background: "rgba(0,0,0,0.5)", fontSize: 9, color: "#fff",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{item.title}</div>
            </div>
          );
        })}
      </div>

      {filteredPortfolio.length === 0 && (
        <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "18px 0" }}>No portfolio items{filterCat ? " in this category" : " yet"}. Add work items first in the Portfolio tab.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 14 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ ...S.btnSmall, opacity: page === 0 ? 0.3 : 1 }}>← Prev</button>
          <span style={{ fontSize: 11, color: "#888" }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            style={{ ...S.btnSmall, opacity: page >= totalPages - 1 ? 0.3 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
