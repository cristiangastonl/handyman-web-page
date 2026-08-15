import React, { useState, useEffect, useCallback } from "react";
import { itemThumb, fbEmbedUrl, ytId, toDateInput } from "../../lib/constants";
import { colors, spacing, typography, shadows, radii, A } from "../../lib/adminStyles";
import { AdminButton, AdminInput, AdminTextarea, AdminCard, AdminLabel, AdminSelect, AdminFlash, AdminStyles } from "./adminUI";
import { translateFaq } from "../../lib/translate";
import DragList from "./DragList";
import {
  supabase, uploadImage, fetchStorageUsage,
  fetchCategories, addCategory, updateCategory, deleteCategory,
  fetchWorkItems, addWorkItem, updateWorkItem, deleteWorkItem, updateWorkItemsOrder,
  fetchFaqs, addFaqRow, updateFaqRow, deleteFaqRow, updateFaqOrder,
  upsertSiteConfig,
  fetchSubcategories, addSubcategory, updateSubcategory, deleteSubcategory,
  fetchFbReviews, addFbReview, updateFbReview, deleteFbReview,
  fetchGoogleReviews, addGoogleReview, updateGoogleReview, deleteGoogleReview,
} from "../../lib/supabase";
import CarouselsTab from "./CarouselsTab";
import SiteTextsTab from "./SiteTextsTab";

const emptyMsg = (text) => <p style={{ ...A.emptyState, padding: `${spacing.lg}px 0` }}>{text}</p>;

function HelpTooltip({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label="Help"
        title="How does this work?"
        style={{
          width: 18, height: 18, borderRadius: "50%",
          border: `1px solid ${colors.gray300}`,
          background: open ? colors.brand : colors.white,
          color: open ? colors.white : colors.gray600,
          cursor: "pointer", fontSize: 11, fontWeight: 700,
          lineHeight: 1, padding: 0,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >?</button>
      {open && (
        <>
          <span
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 50 }}
          />
          <span style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 51,
            background: colors.gray900, color: colors.white,
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: radii.md, fontSize: 12, lineHeight: 1.5,
            width: 280, boxShadow: shadows.lg, fontWeight: 400,
          }}>
            {children}
            <span style={{
              position: "absolute", top: -5, left: 6,
              width: 10, height: 10, background: colors.gray900,
              transform: "rotate(45deg)",
            }}/>
          </span>
        </>
      )}
    </span>
  );
}

function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function AdminPanel({ onBack, cats, setCats, items, setItems, faqs, setFaqs, subcats, setSubcats, highlights, setHighlights, fbReviews, setFbReviews, googleReviews, setGoogleReviews, carouselData, setCarouselData, adminTab, setAdminTab, siteConfig = {}, setSiteConfig }) {
  // Auth
  const [session, setSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Storage usage
  const [storageUsage, setStorageUsage] = useState(null);

  // Admin UI
  // adminTab and setAdminTab come from props (lifted to App.jsx to survive re-renders)
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  // File input reset key — increment to clear file inputs after submit
  const [fileKey, setFileKey] = useState(0);
  const resetFiles = () => setFileKey(k => k + 1);

  // Category form
  const [ncLabel, setNcLabel] = useState("");
  const [ncFile, setNcFile] = useState(null);

  // Work item form
  const [wiType, setWiType] = useState("image");
  const [wiCat, setWiCat] = useState("");
  const [wiTitle, setWiTitle] = useState("");
  const [wiDesc, setWiDesc] = useState("");
  const [wiFile, setWiFile] = useState(null);
  const [wiVideoId, setWiVideoId] = useState("");
  const [wiThumbFile, setWiThumbFile] = useState(null);

  // FAQ form
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [editingFaq, setEditingFaq] = useState(null);
  const [editFaqQ, setEditFaqQ] = useState("");
  const [editFaqA, setEditFaqA] = useState("");
  const [translating, setTranslating] = useState(false);

  // Subcategory form
  const [scParent, setScParent] = useState("");
  const [scName, setScName] = useState("");
  const [scFile, setScFile] = useState(null);
  const [scPlaylistId, setScPlaylistId] = useState("");

  // Work item subcategory (optional)
  const [wiSubcat, setWiSubcat] = useState("");

  // Portfolio filter state
  const [filterCat, setFilterCat] = useState("");
  const [filterSubcat, setFilterSubcat] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [previewItem, setPreviewItem] = useState(null);

  // Inline editing state: { type: "cat"|"subcat"|"fbr", id, value, ... }
  const [editing, setEditing] = useState(null);

  // Image picker modal for cat/subcat header images: { kind: "cat"|"subcat", id, label, currentImage }
  const [imagePicker, setImagePicker] = useState(null);
  const [imagePickerMode, setImagePickerMode] = useState("upload");

  // FB Review form
  const [fbrName, setFbrName] = useState("");
  const [fbrRating, setFbrRating] = useState("5");
  const [fbrText, setFbrText] = useState("");
  const [fbrDate, setFbrDate] = useState("");

  // Google Review form
  const [grName, setGrName] = useState("");
  const [grRating, setGrRating] = useState("5");
  const [grText, setGrText] = useState("");
  const [grTime, setGrTime] = useState("");
  const [grDate, setGrDate] = useState("");

  // Config form (controlled inputs)
  const [cfgKey, setCfgKey] = useState("");
  const [cfgVal, setCfgVal] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) setSession(s);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const usage = await fetchStorageUsage();
        if (usage) setStorageUsage(usage);
      } catch (err) {
        console.warn("Storage usage load failed:", err.message);
      }
    })();
  }, []);

  const flash = (msg) => {
    setAdminMsg(msg);
    if (!msg.startsWith("Error")) {
      setTimeout(() => setAdminMsg(""), 4000);
    }
  };
  const dismissFlash = () => setAdminMsg("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) { setLoginErr("Supabase not configured"); return; }
    setLoginLoading(true);
    setLoginErr("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
      if (error) throw error;
      setSession(data.session);
    } catch (err) {
      setLoginErr(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  // ── Category CRUD ──
  const handleAddCategory = async () => {
    const label = ncLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setAdminLoading(true);
    try {
      let headerImage = null;
      if (ncFile) headerImage = await uploadImage(ncFile, "categories");
      await addCategory(id, label, headerImage);
      setCats(prev => [...prev, { id, label, header_image: headerImage }]);
      setNcLabel(""); setNcFile(null); resetFiles();
      flash("Category added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteCategory = async (id) => {
    const cat = cats.find(c => c.id === id);
    const childCount = subcats.filter(s => s.category_id === id).length;
    const workCount = items.filter(w => w.cat === id).length;
    let msg = `Delete "${cat?.label || id}"?`;
    if (childCount || workCount) msg += ` This will also delete ${childCount} subcategories and ${workCount} work items.`;
    if (!window.confirm(msg)) return;
    setAdminLoading(true);
    try {
      if (supabase) {
        await supabase.from("subcategories").delete().eq("category_id", id);
        await supabase.from("work_items").delete().eq("cat", id);
      }
      await deleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
      setItems(prev => prev.filter(w => w.cat !== id));
      setSubcats(prev => prev.filter(s => s.category_id !== id));
      flash("Category deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Work item CRUD ──
  const handleAddWorkItem = async () => {
    if (!wiTitle.trim() || !wiCat) return;
    setAdminLoading(true);
    try {
      let src = null, thumb = null;
      if (wiType === "image" && wiFile) src = await uploadImage(wiFile, "work");
      if ((wiType === "video" || wiType === "facebook") && wiThumbFile) thumb = await uploadImage(wiThumbFile, "work");
      if (wiType === "facebook") src = wiVideoId.trim() || null; // Store FB URL in src
      // Assign sort_order = max(siblings in same cat/subcat) + 1 so new items go to the END
      const siblings = items.filter(it =>
        it.cat === wiCat && (it.subcategory_id || null) === (wiSubcat || null)
      );
      const nextSortOrder = siblings.length > 0
        ? Math.max(...siblings.map(it => it.sort_order ?? 0)) + 1
        : 0;
      const row = {
        type: wiType, cat: wiCat, title: wiTitle.trim(),
        description: wiDesc.trim() || null, src, thumb,
        video_id: wiType === "video" ? wiVideoId.trim() || null : null,
        subcategory_id: wiSubcat || null,
        sort_order: nextSortOrder,
      };
      const saved = await addWorkItem(row);
      setItems(prev => [...prev, {
        id: saved.id, type: saved.type, cat: saved.cat, src: saved.src,
        thumb: saved.thumb, title: saved.title, desc: saved.description, videoId: saved.video_id,
        subcategory_id: saved.subcategory_id || null,
        sort_order: saved.sort_order ?? nextSortOrder,
      }]);
      setWiTitle(""); setWiDesc(""); setWiFile(null); setWiVideoId(""); setWiThumbFile(null); setWiSubcat(""); resetFiles();
      flash("Work item added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // Reorder a work item within the current filter (only when filter is active).
  // Normalizes sort_order across the filtered subset on every move — safe because
  // ordering only matters within a category/subcategory at the public site.
  const handleMoveItem = async (itemId, direction) => {
    if (!filterCat) return;
    const filtered = items
      .filter(it => it.cat === filterCat && (!filterSubcat || it.subcategory_id === filterSubcat))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const idx = filtered.findIndex(it => it.id === itemId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filtered.length) return;
    const reordered = [...filtered];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    try {
      setAdminLoading(true);
      await updateWorkItemsOrder(reordered.map(it => it.id));
      setItems(prev => prev.map(it => {
        const newIdx = reordered.findIndex(r => r.id === it.id);
        return newIdx >= 0 ? { ...it, sort_order: newIdx } : it;
      }));
      flash("Order updated");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteWorkItem = async (id) => {
    if (!window.confirm("Delete this work item?")) return;
    setAdminLoading(true);
    try {
      await deleteWorkItem(id);
      setItems(prev => prev.filter(w => w.id !== id));
      flash("Item deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── FAQ CRUD ──
  const handleAddFaq = async () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setAdminLoading(true);
    setTranslating(true);
    try {
      const translations = await translateFaq(faqQ.trim(), faqA.trim());
      setTranslating(false);
      const saved = await addFaqRow(faqQ.trim(), faqA.trim(), translations);
      setFaqs(prev => [...prev, { id: saved.id, q: saved.question, a: saved.answer, ...translations }]);
      setFaqQ(""); setFaqA("");
      flash("FAQ added");
    } catch (err) { setTranslating(false); flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleUpdateFaq = async (id) => {
    if (!editFaqQ.trim() || !editFaqA.trim()) return;
    setAdminLoading(true);
    setTranslating(true);
    try {
      const translations = await translateFaq(editFaqQ.trim(), editFaqA.trim());
      setTranslating(false);
      await updateFaqRow(id, editFaqQ.trim(), editFaqA.trim(), translations);
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, q: editFaqQ.trim(), a: editFaqA.trim(), ...translations } : f));
      setEditingFaq(null);
      flash("FAQ updated");
    } catch (err) { setTranslating(false); flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    setAdminLoading(true);
    try {
      await deleteFaqRow(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      flash("FAQ deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleFaqReorder = useCallback(async (reordered) => {
    setFaqs(reordered);
    try {
      const ids = reordered.map(f => f.id).filter(Boolean);
      if (ids.length) await updateFaqOrder(ids);
      flash("Order saved");
    } catch (err) { flash("Error saving order: " + err.message); }
  }, [setFaqs]);

  // ── Subcategory CRUD ──
  const handleAddSubcategory = async () => {
    if (!scName.trim() || !scParent) return;
    setAdminLoading(true);
    try {
      let headerImage = null;
      if (scFile) headerImage = await uploadImage(scFile, "subcategories");
      const saved = await addSubcategory(scParent, scName.trim(), headerImage, scPlaylistId.trim() || null);
      setSubcats(prev => [...prev, saved]);
      setScName(""); setScParent(""); setScFile(null); setScPlaylistId(""); resetFiles();
      flash("Subcategory added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    setAdminLoading(true);
    try {
      await deleteSubcategory(id);
      setSubcats(prev => prev.filter(s => s.id !== id));
      flash("Subcategory deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── FB Review CRUD ──
  const handleAddFbReview = async () => {
    if (!fbrName.trim() || !fbrText.trim()) return;
    setAdminLoading(true);
    try {
      const saved = await addFbReview(fbrName.trim(), 5, fbrText.trim(), fbrDate || null);
      setFbReviews(prev => [...prev, saved]);
      setFbrName(""); setFbrText(""); setFbrDate("");
      flash("Facebook review added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteFbReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setAdminLoading(true);
    try {
      await deleteFbReview(id);
      setFbReviews(prev => prev.filter(r => r.id !== id));
      flash("Review deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Header image (categories & subcategories) ──
  const handleSetCatSubcatImage = async (newUrl) => {
    if (!imagePicker) return;
    const { kind, id } = imagePicker;
    try {
      setAdminLoading(true);
      if (kind === "cat") {
        await updateCategory(id, { header_image: newUrl });
        setCats(prev => prev.map(c => c.id === id ? { ...c, header_image: newUrl } : c));
      } else {
        await updateSubcategory(id, { header_image: newUrl });
        setSubcats(prev => prev.map(s => s.id === id ? { ...s, header_image: newUrl } : s));
      }
      flash(newUrl ? "Image updated" : "Image removed");
      setImagePicker(null);
      resetFiles();
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Inline edit handlers ──
  const handleSaveEdit = async () => {
    if (!editing) return;
    setAdminLoading(true);
    try {
      if (editing.type === "cat") {
        await updateCategory(editing.id, { label: editing.value.trim() });
        setCats(prev => prev.map(c => c.id === editing.id ? { ...c, label: editing.value.trim() } : c));
        flash("Category updated");
      } else if (editing.type === "subcat") {
        await updateSubcategory(editing.id, { name: editing.value.trim() });
        setSubcats(prev => prev.map(s => s.id === editing.id ? { ...s, name: editing.value.trim() } : s));
        flash("Subcategory updated");
      } else if (editing.type === "fbr") {
        const fields = { name: editing.name.trim(), text: editing.text.trim(), review_date: editing.date || null };
        await updateFbReview(editing.id, fields);
        setFbReviews(prev => prev.map(r => r.id === editing.id ? { ...r, ...fields } : r));
        flash("Review updated");
      } else if (editing.type === "grv") {
        const fields = {
          name: editing.name.trim(),
          text: editing.text.trim(),
          rating: parseInt(editing.rating),
          time_label: editing.timeLabel.trim() || null,
          review_date: editing.date || null,
        };
        const { dateSaved } = await updateGoogleReview(editing.id, fields);
        // Don't show a date the database didn't actually accept.
        const applied = dateSaved ? fields : { ...fields, review_date: undefined };
        setGoogleReviews(prev => prev.map(r => r.id === editing.id ? { ...r, ...applied } : r));
        flash(dateSaved ? "Review updated" : "Review updated — date NOT saved, run client-feedback-migration.sql first");
      }
      setEditing(null);
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Google Review CRUD ──
  const handleAddGoogleReview = async () => {
    if (!grName.trim() || !grText.trim()) return;
    setAdminLoading(true);
    try {
      const saved = await addGoogleReview(grName.trim(), parseInt(grRating), grText.trim(), grTime.trim() || null, grDate || null);
      setGoogleReviews(prev => [...prev, saved]);
      setGrName(""); setGrRating("5"); setGrText(""); setGrTime(""); setGrDate("");
      flash("Google review added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteGoogleReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setAdminLoading(true);
    try {
      await deleteGoogleReview(id);
      setGoogleReviews(prev => prev.filter(r => r.id !== id));
      flash("Review deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Site Config ──
  const handleSaveConfig = async (key, value) => {
    setAdminLoading(true);
    try {
      await upsertSiteConfig(key, value);
      setSiteConfig(prev => ({ ...prev, [key]: value }));
      flash(`Config "${key}" saved`);
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const TABS = [["categories","Categories"],["work","Portfolio"],["carousels","Carousels"],["fbreview","FB Reviews"],["greview","G Reviews"],["faqs","FAQs"],["config","Site Texts"]];

  const prevent = (fn) => (e) => { e.preventDefault(); fn(); };

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: colors.gray50, minHeight: "100vh", color: colors.gray900 }}>
      <AdminStyles />
      <div className="admin-container" style={{ maxWidth: 900, width: "100%", margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["2xl"] }}>
          <div>
            <h2 style={typography.pageTitle}>Admin Panel</h2>
            {storageUsage && (() => {
              const mb = (storageUsage.bytes / (1024 * 1024)).toFixed(1);
              const gb = (storageUsage.bytes / (1024 * 1024 * 1024)).toFixed(2);
              const limitGb = parseFloat(siteConfig.storage_limit_gb) || 10;
              const pct = Math.min(100, ((storageUsage.bytes / (limitGb * 1024 * 1024 * 1024)) * 100)).toFixed(1);
              return (
                <div style={{ fontSize: 11, color: "#888", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{storageUsage.files} files · {mb < 1000 ? `${mb} MB` : `${gb} GB`} / {limitGb} GB ({pct}%)</span>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: "#eee", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: pct > 80 ? "#e53e3e" : pct > 50 ? "#d69e2e" : "#38a169" }}/>
                  </div>
                </div>
              );
            })()}
          </div>
          <div style={{ display: "flex", gap: spacing.sm }}>
            {session && (
              <AdminButton variant="danger" size="small" onClick={handleLogout}>
                Logout
              </AdminButton>
            )}
            <AdminButton variant="secondary" size="small" onClick={onBack}>
              Back
            </AdminButton>
          </div>
        </div>

        {!supabase ? (
          <div style={{ padding: `${spacing.md}px ${spacing.lg}px`, background: colors.brandLight, borderRadius: radii.md, marginBottom: spacing.xl, fontSize: 12, color: colors.brandDark, lineHeight: 1.5 }}>
            Supabase not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable persistence.
          </div>
        ) : !session ? (
          <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: "60px auto" }}>
            <h3 style={{ ...typography.sectionHeader, fontSize: 15, marginBottom: spacing.lg, textAlign: "center" }}>
              Admin Login
            </h3>
            <AdminInput label="Email" type="email" value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)} required />
            <AdminInput label="Password" type="password" value={loginPass}
              onChange={e => setLoginPass(e.target.value)} required />
            {loginErr && <div style={{ color: colors.danger, fontSize: 11, marginTop: spacing.xs }}>{loginErr}</div>}
            <AdminButton type="submit" loading={loginLoading} style={{ marginTop: spacing.md, width: "100%" }}>
              Sign In
            </AdminButton>
          </form>
        ) : (
          <>
            <AdminFlash message={adminMsg} onDismiss={dismissFlash} />

            {/* Tabs — horizontal scroll, sticky */}
            <div className="admin-tabs" style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: colors.white,
              boxShadow: shadows.sm,
              display: "flex",
              gap: 0,
              borderBottom: `2px solid ${colors.gray200}`,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              marginBottom: spacing.xl,
            }}>
              {TABS.map(([k, l]) => (
                <button
                  key={k}
                  className="admin-tab"
                  onClick={() => { window.__dragActive = false; setAdminTab(k); }}
                  style={{
                    padding: `${spacing.sm}px ${spacing.lg}px`,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    ...typography.body,
                    fontWeight: adminTab === k ? 600 : 400,
                    color: adminTab === k ? colors.brand : colors.gray400,
                    borderBottom: adminTab === k ? `3px solid ${colors.brand}` : "3px solid transparent",
                    marginBottom: -2,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* ── Categories & Subcategories Tab ── */}
            {adminTab === "categories" && (
              <div>
                <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Categories organize your Portfolio page into sections (e.g. Lighting, Assembly, Painting). Visitors see them as clickable cards. Subcategories are optional groups within a category — great for linking YouTube playlists.
                </div>

                {/* Categories section */}
                <AdminCard title="Add Category">
                  <form onSubmit={prevent(handleAddCategory)}>
                    <AdminInput label="Category name" value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name" />
                    <div>
                      <label style={typography.caption}>Header image (optional) — shown as category cover in Portfolio</label>
                      <input key={fileKey} type="file" accept="image/*" onChange={e => setNcFile(e.target.files[0] || null)} style={{ display: "block", marginTop: spacing.xs, fontSize: 11 }}/>
                    </div>
                    <AdminButton type="submit" loading={adminLoading} disabled={!ncLabel.trim()}
                      style={{ marginTop: spacing.md }}>
                      Add Category
                    </AdminButton>
                  </form>
                </AdminCard>

                <AdminCard title={
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    Categories ({cats.filter(c => c.id !== "all").length})
                    <HelpTooltip>
                      <strong>Cómo cambiar la imagen de portada:</strong><br/>
                      Hacé click en la <strong>miniatura</strong> ☐ que está al lado del nombre de la categoría.<br/><br/>
                      Se abre una ventana con dos opciones:<br/>
                      • <strong>Upload from disk</strong> — subir una foto desde tu computadora.<br/>
                      • <strong>Pick from portfolio</strong> — elegir una foto que ya cargaste en el Portfolio.<br/><br/>
                      Para sacar la imagen y volver al modo automático, usá <em>Remove cover image</em> al final de la ventana.
                    </HelpTooltip>
                  </span>
                } style={{ marginTop: spacing.xl }}>
                  {cats.filter(c => c.id !== "all").length === 0
                    ? emptyMsg("No categories yet. Add your first category above to organize your Portfolio.")
                    : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                        {cats.filter(c => c.id !== "all").map(c => (
                          <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm, background: colors.gray100, padding: `5px ${spacing.md}px`, borderRadius: radii.full, fontSize: 12 }}>
                            <button
                              type="button"
                              onClick={() => { setImagePicker({ kind: "cat", id: c.id, label: c.label, currentImage: c.header_image }); setImagePickerMode("upload"); }}
                              title={c.header_image ? "Change cover image" : "Set cover image"}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                            >
                              {c.header_image
                                ? <img src={c.header_image} alt="" style={{ width: 18, height: 18, borderRadius: radii.sm, objectFit: "cover", display: "block" }}/>
                                : <span style={{ width: 18, height: 18, borderRadius: radii.sm, background: colors.gray300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: colors.gray600 }}>📷</span>
                              }
                            </button>
                            {editing?.type === "cat" && editing.id === c.id ? (
                              <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <input
                                  autoFocus
                                  value={editing.value}
                                  onChange={e => setEditing({ ...editing, value: e.target.value })}
                                  onBlur={handleSaveEdit}
                                  onKeyDown={e => e.key === "Escape" && setEditing(null)}
                                  style={{ width: 120, fontSize: 12, border: `1px solid ${colors.brand}`, borderRadius: radii.sm, padding: "2px 6px", outline: "none" }}
                                />
                              </form>
                            ) : (
                              <span onClick={() => setEditing({ type: "cat", id: c.id, value: c.label })} style={{ cursor: "pointer" }} title="Click to edit name">
                                {c.label}
                              </span>
                            )}
                            <button onClick={() => handleDeleteCategory(c.id)} disabled={adminLoading}
                              style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, opacity: adminLoading ? 0.5 : 1 }}>x</button>
                          </span>
                        ))}
                      </div>
                    )
                  }
                </AdminCard>

                {/* Subcategories section */}
                <AdminCard title={
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    Subcategories ({subcats.length})
                    <HelpTooltip>
                      <strong>Cómo cambiar la imagen de portada:</strong><br/>
                      Hacé click en la <strong>miniatura</strong> ☐ que está al lado del nombre de la subcategoría.<br/><br/>
                      Se abre una ventana con dos opciones:<br/>
                      • <strong>Upload from disk</strong> — subir una foto desde tu computadora.<br/>
                      • <strong>Pick from portfolio</strong> — elegir una foto del Portfolio (las fotos de la categoría padre aparecen primero).<br/><br/>
                      Para sacar la imagen y volver al modo automático, usá <em>Remove cover image</em> al final de la ventana.
                    </HelpTooltip>
                  </span>
                } style={{ marginTop: spacing.xl }}>
                  {subcats.length === 0
                    ? emptyMsg("No subcategories yet. These are optional — use them to group items within a category.")
                    : cats.filter(c => c.id !== "all").map(parentCat => {
                        const children = subcats.filter(s => s.category_id === parentCat.id);
                        if (children.length === 0) return null;
                        return (
                          <div key={parentCat.id} style={{ marginBottom: spacing.lg }}>
                            <p style={{ ...typography.body, fontWeight: 600, marginBottom: spacing.sm }}>{parentCat.label}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                              {children.map(sc => (
                                <span key={sc.id} style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm, background: colors.gray100, padding: `5px ${spacing.md}px`, borderRadius: radii.full, fontSize: 12 }}>
                                  <button
                                    type="button"
                                    onClick={() => { setImagePicker({ kind: "subcat", id: sc.id, label: sc.name, currentImage: sc.header_image, parentCat: sc.category_id }); setImagePickerMode("upload"); }}
                                    title={sc.header_image ? "Change cover image" : "Set cover image"}
                                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                                  >
                                    {sc.header_image
                                      ? <img src={sc.header_image} alt="" style={{ width: 18, height: 18, borderRadius: radii.sm, objectFit: "cover", display: "block" }}/>
                                      : <span style={{ width: 18, height: 18, borderRadius: radii.sm, background: colors.gray300, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: colors.gray600 }}>📷</span>
                                    }
                                  </button>
                                  {editing?.type === "subcat" && editing.id === sc.id ? (
                                    <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                      <input
                                        autoFocus
                                        value={editing.value}
                                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                                        onBlur={handleSaveEdit}
                                        onKeyDown={e => e.key === "Escape" && setEditing(null)}
                                        style={{ width: 120, fontSize: 12, border: `1px solid ${colors.brand}`, borderRadius: radii.sm, padding: "2px 6px", outline: "none" }}
                                      />
                                    </form>
                                  ) : (
                                    <span onClick={() => setEditing({ type: "subcat", id: sc.id, value: sc.name })} style={{ cursor: "pointer" }} title="Click to edit name">
                                      {sc.name}
                                    </span>
                                  )}
                                  {sc.playlist_id && <span style={{ fontSize: 9, color: colors.gray500 }}>&#9654;</span>}
                                  <button onClick={() => handleDeleteSubcategory(sc.id)} disabled={adminLoading}
                                    style={{ background: "none", border: "none", color: colors.danger, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, opacity: adminLoading ? 0.5 : 1 }}>x</button>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  }
                </AdminCard>

                <AdminCard title="Add Subcategory" style={{ marginTop: spacing.xl }}>
                  <form onSubmit={prevent(handleAddSubcategory)}>
                    <AdminSelect label="Parent category" value={scParent} onChange={e => setScParent(e.target.value)} style={{ color: scParent ? colors.gray900 : colors.gray400 }}>
                      <option value="" disabled>Select parent category...</option>
                      {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </AdminSelect>
                    <AdminInput label="Subcategory name" value={scName} onChange={e => setScName(e.target.value)} placeholder="Subcategory name" />
                    <AdminInput label="YouTube Playlist ID (optional)" value={scPlaylistId} onChange={e => setScPlaylistId(e.target.value)} placeholder="Links to playlist in Portfolio" />
                    <div>
                      <label style={typography.caption}>Header image (optional)</label>
                      <input key={fileKey + 1} type="file" accept="image/*" onChange={e => setScFile(e.target.files[0] || null)} style={{ display: "block", marginTop: spacing.xs, fontSize: 11 }}/>
                    </div>
                    <AdminButton type="submit" loading={adminLoading} disabled={!scName.trim() || !scParent}
                      style={{ marginTop: spacing.md }}>
                      Add Subcategory
                    </AdminButton>
                  </form>
                </AdminCard>
              </div>
            )}

            {/* ── Portfolio Tab ── */}
            {adminTab === "work" && (
              <div>
                <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Upload photos, YouTube videos, or Facebook reels here. Each item needs a category and a subcategory (both required when subcategories exist for that category). These items appear in the Portfolio page and can be selected for the home page carousels.
                </div>
                <AdminCard title="Add Item" style={{ marginBottom: spacing.xl }}>
                  <form onSubmit={prevent(handleAddWorkItem)}>
                    <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.sm }}>
                      {["image","video","facebook"].map(t => (
                        <button key={t} type="button" onClick={() => setWiType(t)}
                          style={{
                            ...A.btnSmall,
                            background: wiType === t ? colors.brand : "none",
                            color: wiType === t ? colors.white : colors.gray600,
                            border: wiType === t ? "none" : `1px solid ${colors.gray300}`,
                            borderRadius: radii.md,
                            cursor: "pointer",
                          }}>
                          {t === "image" ? "Image" : t === "video" ? "YouTube" : "Facebook"}
                        </button>
                      ))}
                    </div>
                    <AdminSelect label="Category" value={wiCat} onChange={e => { setWiCat(e.target.value); setWiSubcat(""); }} style={{ color: wiCat ? colors.gray900 : colors.gray400 }}>
                      <option value="" disabled>Select category...</option>
                      {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </AdminSelect>
                    {wiCat && subcats.filter(s => s.category_id === wiCat).length > 0 && (
                      <AdminSelect label="Subcategory" value={wiSubcat} onChange={e => setWiSubcat(e.target.value)} style={{ color: wiSubcat ? colors.gray900 : colors.gray400 }}>
                        <option value="" disabled>Select subcategory...</option>
                        {subcats.filter(s => s.category_id === wiCat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </AdminSelect>
                    )}
                    <AdminInput label="Title" value={wiTitle} onChange={e => setWiTitle(e.target.value)} placeholder="Title" />
                    <AdminInput label="Description (optional)" value={wiDesc} onChange={e => setWiDesc(e.target.value)} placeholder="Description" />
                    {wiType === "image" && (
                      <div style={{ marginBottom: spacing.sm }}>
                        <label style={typography.caption}>Image file</label>
                        <input key={fileKey} type="file" accept="image/*" onChange={e => setWiFile(e.target.files[0] || null)} style={{ display: "block", marginTop: spacing.xs, fontSize: 11 }}/>
                      </div>
                    )}
                    {wiType === "video" && (
                      <>
                        <AdminInput label="YouTube video ID" value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="YouTube video ID" />
                        <div style={{ marginBottom: spacing.sm }}>
                          <label style={typography.caption}>Thumbnail image <span style={{ color: colors.gray400 }}>(optional)</span></label>
                          <input key={fileKey} type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)} style={{ display: "block", marginTop: spacing.xs, fontSize: 11 }}/>
                        </div>
                      </>
                    )}
                    {wiType === "facebook" && (
                      <>
                        <AdminInput label="Facebook reel/video URL" value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="https://www.facebook.com/reel/123..." />
                        <div style={{ marginBottom: spacing.sm }}>
                          <label style={typography.caption}>Thumbnail image <span style={{ color: colors.gray400 }}>(recommended)</span></label>
                          <input key={fileKey} type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)} style={{ display: "block", marginTop: spacing.xs, fontSize: 11 }}/>
                        </div>
                      </>
                    )}
                    <AdminButton type="submit" loading={adminLoading} disabled={!wiTitle.trim() || !wiCat}
                      style={{ marginTop: spacing.md }}>
                      Add Item
                    </AdminButton>
                  </form>
                </AdminCard>

                <AdminCard title="Portfolio Items">
                  {/* Filter dropdowns */}
                  <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <AdminSelect label="Filter by category" value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterSubcat(""); setPage(1); }} style={{ marginBottom: 0 }}>
                        <option value="">All categories</option>
                        {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </AdminSelect>
                    </div>
                    {filterCat && subcats.filter(s => s.category_id === filterCat).length > 0 && (
                      <div style={{ flex: 1 }}>
                        <AdminSelect label="Subcategory" value={filterSubcat} onChange={e => { setFilterSubcat(e.target.value); setPage(1); }} style={{ marginBottom: 0 }}>
                          <option value="">All subcategories</option>
                          {subcats.filter(s => s.category_id === filterCat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </AdminSelect>
                      </div>
                    )}
                  </div>
                  {/* Filtered + paginated items */}
                  {(() => {
                    const filteredItems = items
                      .filter(item => {
                        if (filterCat && item.cat !== filterCat) return false;
                        if (filterSubcat && item.subcategory_id !== filterSubcat) return false;
                        return true;
                      })
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                    const canReorder = !!filterCat;
                    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
                    const safePage = Math.min(page, totalPages);
                    const pagedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);
                    return (
                      <>
                        {/* Count + page size selector */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                          <span style={typography.caption}>Showing {filteredItems.length} of {items.length}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                            <span style={typography.caption}>Per page:</span>
                            {[20, 30, 50].map(n => (
                              <button key={n} type="button" onClick={() => { setPageSize(n); setPage(1); }}
                                style={{
                                  background: pageSize === n ? colors.brand : "none",
                                  color: pageSize === n ? colors.white : colors.gray600,
                                  border: pageSize === n ? "none" : `1px solid ${colors.gray300}`,
                                  borderRadius: radii.sm,
                                  padding: "2px 8px",
                                  fontSize: 11,
                                  cursor: "pointer",
                                  fontWeight: pageSize === n ? 600 : 400,
                                }}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        {items.length === 0
                          ? emptyMsg("No portfolio items yet. Add photos, YouTube videos, or Facebook reels above.")
                          : filteredItems.length === 0
                            ? emptyMsg("No items match the current filters.")
                            : (
                              <>
                              {canReorder && (
                                <div style={{ ...typography.caption, marginBottom: spacing.sm, color: colors.gray500 }}>
                                  Tip: use the ↑ ↓ arrows on each item to reorder. Order is saved automatically.
                                </div>
                              )}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: spacing.md }}>
                                {pagedItems.map((item, idxInPage) => {
                                  const globalIdx = filteredItems.findIndex(it => it.id === item.id);
                                  const isFirst = globalIdx === 0;
                                  const isLast = globalIdx === filteredItems.length - 1;
                                  return (
                                  <div
                                    key={item.id}
                                    onClick={() => setPreviewItem(item)}
                                    style={{
                                      cursor: "pointer",
                                      borderRadius: radii.md,
                                      overflow: "hidden",
                                      border: `1px solid ${colors.gray200}`,
                                      background: colors.white,
                                      transition: "box-shadow 0.15s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = shadows.md}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                                  >
                                    <div style={{ position: "relative", paddingTop: "75%", background: colors.gray100 }}>
                                      <img
                                        src={itemThumb(item)}
                                        alt={item.title || ""}
                                        loading="lazy"
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                      {canReorder && (
                                        <div style={{ position: "absolute", top: 4, left: 4, display: "flex", flexDirection: "column", gap: 2 }}>
                                          <button
                                            type="button"
                                            disabled={isFirst || adminLoading}
                                            onClick={e => { e.stopPropagation(); handleMoveItem(item.id, "up"); }}
                                            title="Move up"
                                            style={{
                                              width: 22, height: 22, borderRadius: radii.sm, border: "none",
                                              background: "rgba(0,0,0,0.65)", color: isFirst ? "rgba(255,255,255,0.3)" : "#fff",
                                              cursor: isFirst || adminLoading ? "not-allowed" : "pointer",
                                              fontSize: 13, lineHeight: 1, padding: 0,
                                              display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                          >↑</button>
                                          <button
                                            type="button"
                                            disabled={isLast || adminLoading}
                                            onClick={e => { e.stopPropagation(); handleMoveItem(item.id, "down"); }}
                                            title="Move down"
                                            style={{
                                              width: 22, height: 22, borderRadius: radii.sm, border: "none",
                                              background: "rgba(0,0,0,0.65)", color: isLast ? "rgba(255,255,255,0.3)" : "#fff",
                                              cursor: isLast || adminLoading ? "not-allowed" : "pointer",
                                              fontSize: 13, lineHeight: 1, padding: 0,
                                              display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                          >↓</button>
                                        </div>
                                      )}
                                      {item.type !== "image" && (
                                        <span style={{
                                          position: "absolute",
                                          top: 4,
                                          right: 4,
                                          background: "rgba(0,0,0,0.6)",
                                          color: "#fff",
                                          fontSize: 9,
                                          fontWeight: 600,
                                          padding: "2px 5px",
                                          borderRadius: radii.sm,
                                          textTransform: "uppercase",
                                        }}>
                                          {item.type === "video" ? "YT" : "FB"}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ padding: `${spacing.xs}px ${spacing.sm}px` }}>
                                      <div style={{ fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: colors.gray800 }}>
                                        {item.title || "(untitled)"}
                                      </div>
                                      <div style={{ fontSize: 9, color: colors.gray400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {cats.find(c => c.id === item.cat)?.label}
                                      </div>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                              </>
                            )
                        }
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: spacing.xs, paddingTop: spacing.lg, marginTop: spacing.md, borderTop: `1px solid ${colors.gray200}` }}>
                            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}
                              style={{
                                background: "none",
                                border: `1px solid ${colors.gray300}`,
                                borderRadius: radii.sm,
                                color: safePage <= 1 ? colors.gray300 : colors.gray700,
                                cursor: safePage <= 1 ? "not-allowed" : "pointer",
                                fontSize: 13, padding: "2px 10px", height: 28,
                              }}>
                              &lt;
                            </button>
                            {generatePageNumbers(safePage, totalPages).map((p, i) =>
                              p === "..." ? (
                                <span key={`ellipsis-${i}`} style={{ color: colors.gray400, fontSize: 12, padding: "0 2px" }}>...</span>
                              ) : (
                                <button key={p} type="button" onClick={() => setPage(p)}
                                  style={{
                                    background: p === safePage ? colors.brand : "none",
                                    color: p === safePage ? colors.white : colors.gray700,
                                    border: p === safePage ? "none" : `1px solid ${colors.gray300}`,
                                    borderRadius: radii.sm,
                                    minWidth: 28, height: 28,
                                    fontSize: 12, fontWeight: p === safePage ? 600 : 400,
                                    cursor: "pointer",
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                  {p}
                                </button>
                              )
                            )}
                            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                              style={{
                                background: "none",
                                border: `1px solid ${colors.gray300}`,
                                borderRadius: radii.sm,
                                color: safePage >= totalPages ? colors.gray300 : colors.gray700,
                                cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                                fontSize: 13, padding: "2px 10px", height: 28,
                              }}>
                              &gt;
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </AdminCard>

                {/* Preview Modal */}
                {previewItem && (
                  <div
                    onClick={() => setPreviewItem(null)}
                    onKeyDown={e => e.key === "Escape" && setPreviewItem(null)}
                    tabIndex={-1}
                    ref={el => el && el.focus()}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 1000,
                      background: "rgba(0,0,0,0.75)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                    }}
                  >
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        background: colors.white,
                        borderRadius: radii.lg,
                        overflow: "hidden",
                        maxWidth: 700,
                        width: "100%",
                        maxHeight: "90vh",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: shadows.lg,
                      }}
                    >
                      {/* Media */}
                      {previewItem.type === "video" ? (
                        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId(previewItem.videoId)}?autoplay=1`}
                            title="Video preview"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      ) : previewItem.type === "facebook" ? (
                        <div style={{ position: "relative", paddingTop: "177.78%", background: "#000", maxHeight: "70vh" }}>
                          <iframe
                            src={fbEmbedUrl(previewItem.videoId || previewItem.src)}
                            title="Facebook video preview"
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <img
                          src={previewItem.src}
                          alt={previewItem.title || ""}
                          style={{ width: "100%", display: "block", maxHeight: "70vh", objectFit: "contain", background: colors.gray100 }}
                        />
                      )}
                      {/* Info bar */}
                      <div style={{ padding: `${spacing.md}px ${spacing.lg}px`, borderTop: `1px solid ${colors.gray200}`, overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                          <div style={{ ...typography.caption, flex: 1, minWidth: 0 }}>
                            {cats.find(c => c.id === previewItem.cat)?.label}
                            {previewItem.subcategory_id && subcats.find(s => s.id === previewItem.subcategory_id)?.name && ` / ${subcats.find(s => s.id === previewItem.subcategory_id).name}`}
                            {" · "}{previewItem.type === "image" ? "Photo" : previewItem.type === "video" ? "YouTube" : "Facebook"}
                          </div>
                          <div style={{ display: "flex", gap: spacing.sm, alignItems: "center", marginLeft: spacing.md }}>
                            <AdminButton variant="danger" size="small" onClick={() => { handleDeleteWorkItem(previewItem.id); setPreviewItem(null); }} loading={adminLoading}>
                              Remove
                            </AdminButton>
                            <button
                              onClick={() => setPreviewItem(null)}
                              style={{
                                background: "none",
                                border: `1px solid ${colors.gray300}`,
                                borderRadius: radii.sm,
                                cursor: "pointer",
                                fontSize: 13,
                                color: colors.gray600,
                                height: 28,
                                padding: "0 12px",
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                        {/* Edit title */}
                        <AdminInput
                          label="Title"
                          value={previewItem.title || ""}
                          onChange={e => setPreviewItem(prev => ({ ...prev, title: e.target.value }))}
                          onBlur={async e => {
                            const newTitle = e.target.value.trim();
                            const original = items.find(it => it.id === previewItem.id)?.title || "";
                            if (newTitle === original) return;
                            try {
                              setAdminLoading(true);
                              await updateWorkItem(previewItem.id, { title: newTitle });
                              setItems(prev => prev.map(it => it.id === previewItem.id ? { ...it, title: newTitle } : it));
                              flash("Title updated");
                            } catch (err) { flash("Error: " + err.message); }
                            finally { setAdminLoading(false); }
                          }}
                          style={{ marginBottom: spacing.sm }}
                        />
                        {/* Edit description */}
                        <AdminTextarea
                          label="Description"
                          rows={2}
                          value={previewItem.desc || ""}
                          onChange={e => setPreviewItem(prev => ({ ...prev, desc: e.target.value }))}
                          onBlur={async e => {
                            const newDesc = e.target.value.trim();
                            const original = items.find(it => it.id === previewItem.id)?.desc || "";
                            if (newDesc === original) return;
                            try {
                              setAdminLoading(true);
                              await updateWorkItem(previewItem.id, { description: newDesc || null });
                              setItems(prev => prev.map(it => it.id === previewItem.id ? { ...it, desc: newDesc || null } : it));
                              flash("Description updated");
                            } catch (err) { flash("Error: " + err.message); }
                            finally { setAdminLoading(false); }
                          }}
                          style={{ marginBottom: spacing.sm }}
                        />
                        {/* Replace image / thumbnail */}
                        {(previewItem.type === "image" || previewItem.type === "video" || previewItem.type === "facebook") && (
                          <div style={{ marginBottom: spacing.md }}>
                            <label style={A.inputLabel}>
                              {previewItem.type === "image" ? "Replace photo" : "Replace thumbnail"}
                            </label>
                            <input
                              key={`replace-${previewItem.id}-${fileKey}`}
                              type="file"
                              accept="image/*"
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const field = previewItem.type === "image" ? "src" : "thumb";
                                try {
                                  setAdminLoading(true);
                                  const newUrl = await uploadImage(file, "work");
                                  await updateWorkItem(previewItem.id, { [field]: newUrl });
                                  setItems(prev => prev.map(it => it.id === previewItem.id ? { ...it, [field]: newUrl } : it));
                                  setPreviewItem(prev => ({ ...prev, [field]: newUrl }));
                                  resetFiles();
                                  flash(previewItem.type === "image" ? "Photo replaced" : "Thumbnail replaced");
                                } catch (err) { flash("Error: " + err.message); }
                                finally { setAdminLoading(false); }
                              }}
                              style={{ display: "block", fontSize: 12 }}
                            />
                          </div>
                        )}
                        {/* Edit category / subcategory */}
                        <div style={{ display: "flex", gap: spacing.md, alignItems: "flex-end", paddingTop: spacing.sm, borderTop: `1px solid ${colors.gray100}` }}>
                          <div style={{ flex: 1 }}>
                            <AdminSelect label="Category" value={previewItem.cat || ""} onChange={async e => {
                              const newCat = e.target.value;
                              try {
                                setAdminLoading(true);
                                await updateWorkItem(previewItem.id, { cat: newCat, subcategory_id: null });
                                setItems(prev => prev.map(it => it.id === previewItem.id ? { ...it, cat: newCat, subcategory_id: null } : it));
                                setPreviewItem(prev => ({ ...prev, cat: newCat, subcategory_id: null }));
                                flash("Category updated");
                              } catch (err) { flash("Error: " + err.message); }
                              finally { setAdminLoading(false); }
                            }} style={{ marginBottom: 0 }}>
                              {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </AdminSelect>
                          </div>
                          {subcats.filter(s => s.category_id === previewItem.cat).length > 0 && (
                            <div style={{ flex: 1 }}>
                              <AdminSelect label="Subcategory" value={previewItem.subcategory_id || ""} onChange={async e => {
                                const newSubcat = e.target.value || null;
                                try {
                                  setAdminLoading(true);
                                  await updateWorkItem(previewItem.id, { subcategory_id: newSubcat });
                                  setItems(prev => prev.map(it => it.id === previewItem.id ? { ...it, subcategory_id: newSubcat } : it));
                                  setPreviewItem(prev => ({ ...prev, subcategory_id: newSubcat }));
                                  flash(newSubcat ? "Subcategory updated" : "Subcategory removed");
                                } catch (err) { flash("Error: " + err.message); }
                                finally { setAdminLoading(false); }
                              }} style={{ marginBottom: 0 }}>
                                <option value="">No subcategory</option>
                                {subcats.filter(s => s.category_id === previewItem.cat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </AdminSelect>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FAQs Tab ── */}
            {adminTab === "faqs" && (
              <div>
                <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
                  <strong>How it works:</strong> FAQs appear on the home page (top 3) and the full FAQ page. They are automatically translated to all 5 languages. Drag to reorder.
                </div>
                <AdminCard title="Add FAQ">
                  <form onSubmit={prevent(handleAddFaq)}>
                    <AdminInput label="Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="Question" />
                    <AdminTextarea label="Answer" value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="Answer" rows={3} />
                    <AdminButton type="submit" loading={adminLoading || translating} disabled={!faqQ.trim() || !faqA.trim()}
                      style={{ marginTop: spacing.md }}>
                      Add FAQ
                    </AdminButton>
                  </form>
                </AdminCard>

                <AdminCard title={`FAQs (${faqs.length})`} style={{ marginTop: spacing.xl }}>
                  {faqs.length === 0
                    ? emptyMsg("No FAQs yet. Add your first question and answer above — they'll be auto-translated to all 5 languages.")
                    : <DragList
                        items={faqs}
                        keyFn={(f) => f.id || f.q}
                        onReorder={handleFaqReorder}
                        renderItem={(f) => (
                          editingFaq === (f.id || f.q) ? (
                            <div>
                              <AdminInput value={editFaqQ} onChange={e => setEditFaqQ(e.target.value)} style={{ fontWeight: 600 }} />
                              <AdminTextarea value={editFaqA} onChange={e => setEditFaqA(e.target.value)} rows={3} />
                              <div style={{ display: "flex", gap: spacing.sm }}>
                                <AdminButton size="small" loading={adminLoading || translating} onClick={() => handleUpdateFaq(f.id)}>
                                  Save
                                </AdminButton>
                                <AdminButton variant="secondary" size="small" onClick={() => setEditingFaq(null)}>
                                  Cancel
                                </AdminButton>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{f.q}</div>
                              <div style={{ fontSize: 12, color: colors.gray600, lineHeight: 1.5, marginBottom: spacing.sm }}>{f.a}</div>
                              <div style={{ display: "flex", gap: spacing.sm }}>
                                {f.id && <AdminButton variant="secondary" size="small" onClick={() => { setEditingFaq(f.id); setEditFaqQ(f.q); setEditFaqA(f.a); }}>Edit</AdminButton>}
                                {f.id && <AdminButton variant="danger" size="small" onClick={() => handleDeleteFaq(f.id)} loading={adminLoading}>Delete</AdminButton>}
                              </div>
                            </div>
                          )
                        )}
                      />
                  }
                </AdminCard>
              </div>
            )}

            {/* ── Carousels Tab ── */}
            {adminTab === "carousels" && (
              <CarouselsTab
                items={items}
                cats={cats}
                carouselData={carouselData}
                setCarouselData={setCarouselData}
                flash={flash}
                adminLoading={adminLoading}
                setAdminLoading={setAdminLoading}
              />
            )}

            {/* ── FB Reviews Tab ── */}
            {adminTab === "fbreview" && (
              <div>
                <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Facebook reviews show as "Recommends" (no star ratings). They appear in the Reviews section on home page and the Reviews page, mixed with Google reviews. Reviews are listed newest first, so fill in the review date — undated ones fall to the bottom of the list.
                </div>

                <AdminCard title="Add Facebook Review">
                  <form onSubmit={prevent(handleAddFbReview)}>
                    <AdminInput label="Reviewer name" value={fbrName} onChange={e => setFbrName(e.target.value)} placeholder="Reviewer name" />
                    <AdminTextarea label="Review text" value={fbrText} onChange={e => setFbrText(e.target.value)} placeholder="Review text" rows={3} />
                    <AdminInput label="Review date (optional)" type="date" value={fbrDate} onChange={e => setFbrDate(e.target.value)} />
                    <AdminButton type="submit" loading={adminLoading} disabled={!fbrName.trim() || !fbrText.trim()}
                      style={{ marginTop: spacing.md }}>
                      Add Review
                    </AdminButton>
                  </form>
                </AdminCard>

                <AdminCard title={`Facebook Reviews (${fbReviews.length})`} style={{ marginTop: spacing.xl }}>
                  {fbReviews.length === 0
                    ? emptyMsg("No Facebook reviews yet. Add reviews from your Facebook page above.")
                    : fbReviews.map(r => (
                        <div key={r.id} style={A.listItem}>
                          {editing?.type === "fbr" && editing.id === r.id ? (
                            <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} style={{ flex: 1, minWidth: 0 }}>
                              <AdminInput label="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                              <AdminTextarea label="Review text" value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} rows={3} />
                              <AdminInput label="Review date" type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                              <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.sm }}>
                                <AdminButton type="submit" loading={adminLoading} disabled={!editing.name.trim() || !editing.text.trim()}>Save</AdminButton>
                                <AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                                  <span style={{ fontSize: 11, color: "#1877F2", marginLeft: spacing.sm }}>&#128077; Recommends</span>
                                  {r.review_date && <span style={{ fontSize: 10, color: colors.gray400, marginLeft: spacing.sm }}>{r.review_date}</span>}
                                </div>
                                <div style={{ ...typography.caption, marginTop: spacing.xs, lineHeight: 1.4 }}>{r.text}</div>
                              </div>
                              <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                                <AdminButton variant="secondary" size="small" onClick={() => setEditing({ type: "fbr", id: r.id, name: r.name, text: r.text, date: toDateInput(r.review_date) })}>
                                  Edit
                                </AdminButton>
                                <AdminButton variant="danger" size="small" onClick={() => handleDeleteFbReview(r.id)} loading={adminLoading}>
                                  Remove
                                </AdminButton>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                  }
                </AdminCard>
              </div>
            )}

            {/* ── Google Reviews Tab ── */}
            {adminTab === "greview" && (
              <div>
                <div style={{ ...A.infoBox, marginBottom: spacing.lg, fontSize: 11, lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Google reviews with star ratings (1-5). They appear in the Reviews section on home page and the Reviews page. The star average is calculated only from these. Reviews are listed newest first, so fill in the review date — undated ones fall to the bottom of the list.
                </div>

                <AdminCard title="Add Google Review">
                  <form onSubmit={prevent(handleAddGoogleReview)}>
                    <AdminInput label="Reviewer name" value={grName} onChange={e => setGrName(e.target.value)} placeholder="Reviewer name" />
                    <AdminSelect label="Rating" value={grRating} onChange={e => setGrRating(e.target.value)}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                    </AdminSelect>
                    <AdminTextarea label="Review text" value={grText} onChange={e => setGrText(e.target.value)} placeholder="Review text" rows={3} />
                    <AdminInput label="Review date" type="date" value={grDate} onChange={e => setGrDate(e.target.value)} />
                    <AdminInput label="Time label (optional)" value={grTime} onChange={e => setGrTime(e.target.value)} placeholder="e.g. '2 weeks ago' — shown instead of the date" />
                    <AdminButton type="submit" loading={adminLoading} disabled={!grName.trim() || !grText.trim()}
                      style={{ marginTop: spacing.md }}>
                      Add Review
                    </AdminButton>
                  </form>
                </AdminCard>

                <AdminCard title={`Google Reviews (${(googleReviews || []).length})`} style={{ marginTop: spacing.xl }}>
                  {(googleReviews || []).length === 0
                    ? emptyMsg("No Google reviews yet. Add reviews from your Google Business profile above.")
                    : (googleReviews || []).map(r => (
                        <div key={r.id} style={A.listItem}>
                          {editing?.type === "grv" && editing.id === r.id ? (
                            <form onSubmit={e => { e.preventDefault(); handleSaveEdit(); }} style={{ flex: 1, minWidth: 0 }}>
                              <AdminInput label="Name" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                              <AdminSelect label="Rating" value={editing.rating} onChange={e => setEditing({ ...editing, rating: e.target.value })}>
                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                              </AdminSelect>
                              <AdminTextarea label="Review text" value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })} rows={3} />
                              <AdminInput label="Review date" type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                              <AdminInput label="Time label (optional)" value={editing.timeLabel} onChange={e => setEditing({ ...editing, timeLabel: e.target.value })} placeholder="e.g. '2 weeks ago'" />
                              <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.sm }}>
                                <AdminButton type="submit" loading={adminLoading} disabled={!editing.name.trim() || !editing.text.trim()}>Save</AdminButton>
                                <AdminButton variant="secondary" onClick={() => setEditing(null)}>Cancel</AdminButton>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                                  <span style={{ fontSize: 11, color: "#E8A317", marginLeft: spacing.sm }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                  {(r.time_label || r.review_date) && <span style={{ fontSize: 10, color: colors.gray400, marginLeft: spacing.sm }}>{r.time_label || r.review_date}</span>}
                                  {!r.review_date && <span style={{ fontSize: 10, color: colors.danger, marginLeft: spacing.sm }}>no date — won't sort</span>}
                                </div>
                                <div style={{ ...typography.caption, marginTop: spacing.xs, lineHeight: 1.4 }}>{r.text}</div>
                              </div>
                              <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                                <AdminButton variant="secondary" size="small"
                                  onClick={() => setEditing({ type: "grv", id: r.id, name: r.name, text: r.text, rating: String(r.rating ?? 5), timeLabel: r.time_label || "", date: toDateInput(r.review_date) })}>
                                  Edit
                                </AdminButton>
                                <AdminButton variant="danger" size="small" onClick={() => handleDeleteGoogleReview(r.id)} loading={adminLoading}>
                                  Remove
                                </AdminButton>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                  }
                </AdminCard>
              </div>
            )}

            {/* ── Site Texts Tab ── */}
            {adminTab === "config" && (
              <SiteTextsTab
                siteConfig={siteConfig}
                onSave={handleSaveConfig}
                loading={adminLoading}
                cfgKey={cfgKey}
                setCfgKey={setCfgKey}
                cfgVal={cfgVal}
                setCfgVal={setCfgVal}
              />
            )}
          </>
        )}
      </div>
      {/* Image picker modal for category / subcategory cover image */}
      {imagePicker && (() => {
        const portfolioImages = items
          .filter(it => it.type === "image" && it.src)
          .sort((a, b) => {
            const parentCat = imagePicker.kind === "subcat" ? imagePicker.parentCat : imagePicker.id;
            const aMatch = a.cat === parentCat ? 0 : 1;
            const bMatch = b.cat === parentCat ? 0 : 1;
            if (aMatch !== bMatch) return aMatch - bMatch;
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
          });
        return (
          <div onClick={() => setImagePicker(null)} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: colors.white, borderRadius: radii.lg, maxWidth: 720, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: shadows.lg, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: `${spacing.md}px ${spacing.lg}px`, borderBottom: `1px solid ${colors.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    Cover image — {imagePicker.kind === "cat" ? "Category" : "Subcategory"}: {imagePicker.label}
                  </div>
                  {imagePicker.currentImage && (
                    <div style={{ ...typography.caption, marginTop: 4, display: "flex", alignItems: "center", gap: spacing.sm }}>
                      <img src={imagePicker.currentImage} alt="" style={{ width: 24, height: 24, borderRadius: radii.sm, objectFit: "cover" }}/>
                      <span>Current image</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setImagePicker(null)} style={{ background: "none", border: `1px solid ${colors.gray300}`, borderRadius: radii.sm, cursor: "pointer", fontSize: 13, color: colors.gray600, height: 28, padding: "0 12px" }}>Close</button>
              </div>
              {/* Mode tabs */}
              <div style={{ display: "flex", borderBottom: `1px solid ${colors.gray200}` }}>
                {[["upload", "Upload from disk"], ["portfolio", "Pick from portfolio"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => setImagePickerMode(mode)}
                    style={{
                      padding: `${spacing.sm}px ${spacing.lg}px`, background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: imagePickerMode === mode ? 600 : 400,
                      color: imagePickerMode === mode ? colors.brand : colors.gray600,
                      borderBottom: imagePickerMode === mode ? `2px solid ${colors.brand}` : "2px solid transparent",
                      marginBottom: -1,
                    }}>{label}</button>
                ))}
              </div>
              {/* Mode content */}
              <div style={{ padding: spacing.lg, overflowY: "auto", flex: 1 }}>
                {imagePickerMode === "upload" && (
                  <div>
                    <p style={{ ...typography.caption, marginBottom: spacing.md }}>
                      Pick an image from your computer. It will be uploaded and set as the cover.
                    </p>
                    <input
                      key={`cover-${imagePicker.kind}-${imagePicker.id}-${fileKey}`}
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setAdminLoading(true);
                          const folder = imagePicker.kind === "cat" ? "categories" : "subcategories";
                          const url = await uploadImage(file, folder);
                          await handleSetCatSubcatImage(url);
                        } catch (err) { flash("Error: " + err.message); }
                        finally { setAdminLoading(false); }
                      }}
                      style={{ display: "block", fontSize: 13 }}
                    />
                  </div>
                )}
                {imagePickerMode === "portfolio" && (
                  <div>
                    <p style={{ ...typography.caption, marginBottom: spacing.md }}>
                      Click any photo from your portfolio to use it as the cover. Photos from this {imagePicker.kind === "cat" ? "category" : "subcategory's category"} appear first.
                    </p>
                    {portfolioImages.length === 0
                      ? emptyMsg("No photos in your portfolio yet. Upload some via the Portfolio tab first.")
                      : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: spacing.sm }}>
                          {portfolioImages.map(it => {
                            const isSelected = it.src === imagePicker.currentImage;
                            return (
                              <button
                                key={it.id}
                                type="button"
                                onClick={() => handleSetCatSubcatImage(it.src)}
                                disabled={adminLoading}
                                title={it.title || ""}
                                style={{
                                  background: "none",
                                  border: isSelected ? `2px solid ${colors.brand}` : `1px solid ${colors.gray200}`,
                                  borderRadius: radii.md,
                                  overflow: "hidden",
                                  cursor: adminLoading ? "not-allowed" : "pointer",
                                  padding: 0,
                                  position: "relative",
                                  aspectRatio: "1 / 1",
                                }}>
                                <img src={it.src} alt={it.title || ""} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
                                {isSelected && (
                                  <span style={{ position: "absolute", top: 4, right: 4, background: colors.brand, color: colors.white, fontSize: 9, padding: "2px 6px", borderRadius: radii.full, fontWeight: 600 }}>CURRENT</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )
                    }
                  </div>
                )}
              </div>
              {/* Footer: remove image */}
              {imagePicker.currentImage && (
                <div style={{ padding: `${spacing.sm}px ${spacing.lg}px`, borderTop: `1px solid ${colors.gray200}`, display: "flex", justifyContent: "flex-end" }}>
                  <AdminButton variant="danger" size="small" onClick={() => handleSetCatSubcatImage(null)} loading={adminLoading}>
                    Remove cover image
                  </AdminButton>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

