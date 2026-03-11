import { useState, useEffect, useCallback } from "react";
import { R, S, itemThumb, SITE_TEXTS, parseSiteText } from "../../lib/constants";
import { translateFaq } from "../../lib/translate";
import DragList from "./DragList";
import {
  supabase, uploadImage,
  fetchCategories, addCategory, deleteCategory,
  fetchWorkItems, addWorkItem, deleteWorkItem,
  fetchFaqs, addFaqRow, updateFaqRow, deleteFaqRow, updateFaqOrder,
  fetchSiteConfig, upsertSiteConfig,
  fetchSubcategories, addSubcategory, deleteSubcategory,
  fetchFbReviews, addFbReview, deleteFbReview,
  fetchGoogleReviews, addGoogleReview, deleteGoogleReview,
} from "../../lib/supabase";
import CarouselsTab from "./CarouselsTab";

const emptyMsg = (text) => <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "18px 0" }}>{text}</p>;

export default function AdminPanel({ onBack, cats, setCats, items, setItems, faqs, setFaqs, subcats, setSubcats, highlights, setHighlights, returningCustomers, setReturningCustomers, fbReviews, setFbReviews, googleReviews, setGoogleReviews, carouselData, setCarouselData }) {
  // Auth
  const [session, setSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin UI
  const [adminTab, setAdminTab] = useState("categories");
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState({});
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
        const dbConfig = await fetchSiteConfig();
        if (dbConfig) setSiteConfig(dbConfig);
      } catch (err) {
        console.warn("Config load failed:", err.message);
      }
    })();
  }, []);

  const flash = (msg) => { setAdminMsg(msg); setTimeout(() => setAdminMsg(""), 4000); };

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
      const row = {
        type: wiType, cat: wiCat, title: wiTitle.trim(),
        description: wiDesc.trim() || null, src, thumb,
        video_id: wiType === "video" ? wiVideoId.trim() || null : null,
        subcategory_id: wiSubcat || null,
      };
      const saved = await addWorkItem(row);
      setItems(prev => [...prev, {
        id: saved.id, type: saved.type, cat: saved.cat, src: saved.src,
        thumb: saved.thumb, title: saved.title, desc: saved.description, videoId: saved.video_id,
      }]);
      setWiTitle(""); setWiDesc(""); setWiFile(null); setWiVideoId(""); setWiThumbFile(null); setWiSubcat(""); resetFiles();
      flash("Work item added");
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

  // ── Google Review CRUD ──
  const handleAddGoogleReview = async () => {
    if (!grName.trim() || !grText.trim()) return;
    setAdminLoading(true);
    try {
      const saved = await addGoogleReview(grName.trim(), parseInt(grRating), grText.trim(), grTime.trim() || null);
      setGoogleReviews(prev => [...prev, saved]);
      setGrName(""); setGrRating("5"); setGrText(""); setGrTime("");
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
    <div style={S.root}>
      <div className="admin-container" style={{ maxWidth: 620, width: "100%", margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Admin Panel</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {session && <button className="admin-ghost" onClick={handleLogout} style={{ ...S.btnDanger }}>Logout</button>}
            <button className="admin-ghost" onClick={onBack} style={S.ghost}>← Back</button>
          </div>
        </div>

        {!supabase ? (
          <div style={{ padding: "14px 16px", background: "#FFF3E0", borderRadius: 8, marginBottom: 20, fontSize: 12, color: "#E65100", lineHeight: 1.5 }}>
            Supabase not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable persistence.
          </div>
        ) : !session ? (
          <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: "60px auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Admin Login</h3>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" required style={{ ...S.input, marginBottom: 10 }}/>
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" required style={S.input}/>
            {loginErr && <div style={{ color: R, fontSize: 11, marginTop: 6 }}>{loginErr}</div>}
            <button type="submit" className="admin-btn" disabled={loginLoading} style={{ ...S.btnPrimary, marginTop: 12, width: "100%", opacity: loginLoading ? 0.5 : 1 }}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <>
            {/* Sticky flash message */}
            {adminMsg && (
              <div style={{ position: "sticky", top: 52, zIndex: 50, padding: "8px 14px", background: adminMsg.startsWith("Error") ? "#FFEBEE" : "#E8F5E9", borderRadius: 6, marginBottom: 14, fontSize: 12, color: adminMsg.startsWith("Error") ? R : "#2E7D32", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                {adminMsg}
              </div>
            )}

            {/* Tabs — horizontal scroll */}
            <div className="admin-tabs" style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f0f0f0", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {TABS.map(([k, l]) => (
                <button key={k} className="admin-tab" onClick={() => { if (window.__dragActive) return; setAdminTab(k); }}
                  style={{ padding: "6px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: adminTab === k ? 600 : 400, color: adminTab === k ? R : "#999", borderBottom: adminTab === k ? `2px solid ${R}` : "2px solid transparent", marginBottom: -2, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── Categories & Subcategories Tab ── */}
            {adminTab === "categories" && (
              <div>
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Categories organize your Portfolio page into sections (e.g. Lighting, Assembly, Painting). Visitors see them as clickable cards. Subcategories are optional groups within a category — great for linking YouTube playlists.
                </div>

                {/* Categories section */}
                <p style={S.label}>Categories ({cats.filter(c => c.id !== "all").length})</p>
                {cats.filter(c => c.id !== "all").length === 0
                  ? emptyMsg("No categories yet. Add one below.")
                  : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {cats.filter(c => c.id !== "all").map(c => (
                        <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f5f5", padding: "5px 12px", borderRadius: 14, fontSize: 12 }}>
                          {c.header_image && <img src={c.header_image} alt="" style={{ width: 18, height: 18, borderRadius: 3, objectFit: "cover" }}/>}
                          {c.label}
                          <button onClick={() => handleDeleteCategory(c.id)} disabled={adminLoading}
                            style={{ background: "none", border: "none", color: R, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, opacity: adminLoading ? 0.5 : 1 }}>×</button>
                        </span>
                      ))}
                    </div>
                  )
                }
                <form onSubmit={prevent(handleAddCategory)} style={S.adminCard}>
                  <p style={S.adminCardTitle}>Add Category</p>
                  <input value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name" style={{ ...S.input, marginBottom: 10 }}/>
                  <div>
                    <label style={{ fontSize: 11, color: "#888" }}>Header image (optional) — shown as category cover in Portfolio</label>
                    <input key={fileKey} type="file" accept="image/*" onChange={e => setNcFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                  </div>
                  <button type="submit" className="admin-btn" disabled={adminLoading || !ncLabel.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !ncLabel.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Category"}
                  </button>
                </form>

                {/* Subcategories section */}
                <div style={{ borderTop: "2px solid #f0f0f0", marginTop: 24, paddingTop: 20 }}>
                  <p style={S.label}>Subcategories ({subcats.length}) — optional</p>
                  {subcats.length === 0 && emptyMsg("No subcategories yet. Add one below if needed.")}
                  {cats.filter(c => c.id !== "all").map(parentCat => {
                    const children = subcats.filter(s => s.category_id === parentCat.id);
                    if (children.length === 0) return null;
                    return (
                      <div key={parentCat.id} style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>{parentCat.label}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {children.map(sc => (
                            <span key={sc.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f5f5", padding: "5px 12px", borderRadius: 14, fontSize: 12 }}>
                              {sc.header_image && <img src={sc.header_image} alt="" style={{ width: 18, height: 18, borderRadius: 3, objectFit: "cover" }}/>}
                              {sc.name}
                              {sc.playlist_id && <span style={{ fontSize: 9, color: "#999" }}>▶</span>}
                              <button onClick={() => handleDeleteSubcategory(sc.id)} disabled={adminLoading}
                                style={{ background: "none", border: "none", color: R, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, opacity: adminLoading ? 0.5 : 1 }}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <form onSubmit={prevent(handleAddSubcategory)} style={{ ...S.adminCard, marginTop: 12 }}>
                    <p style={S.adminCardTitle}>Add Subcategory</p>
                    <select value={scParent} onChange={e => setScParent(e.target.value)} style={{ ...S.input, marginBottom: 10, color: scParent ? "#222" : "#aaa" }}>
                      <option value="" disabled>Select parent category...</option>
                      {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <input value={scName} onChange={e => setScName(e.target.value)} placeholder="Subcategory name" style={{ ...S.input, marginBottom: 10 }}/>
                    <input value={scPlaylistId} onChange={e => setScPlaylistId(e.target.value)} placeholder="YouTube Playlist ID (optional) — links to playlist in Portfolio" style={{ ...S.input, marginBottom: 10 }}/>
                    <div>
                      <label style={{ fontSize: 11, color: "#888" }}>Header image (optional)</label>
                      <input key={fileKey + 1} type="file" accept="image/*" onChange={e => setScFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                    </div>
                    <button type="submit" className="admin-btn" disabled={adminLoading || !scName.trim() || !scParent}
                      style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !scName.trim() || !scParent) ? 0.5 : 1 }}>
                      {adminLoading ? "Adding..." : "Add Subcategory"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── Portfolio Tab ── */}
            {adminTab === "work" && (
              <div>
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Upload photos, YouTube videos, or Facebook reels here. Each item needs a category (required) and optionally a subcategory. These items appear in the Portfolio page and can be selected for the home page carousels.
                </div>
                <p style={S.label}>Portfolio Items ({items.length})</p>
                <form onSubmit={prevent(handleAddWorkItem)} style={{ ...S.adminCard, marginBottom: 20 }}>
                  <p style={S.adminCardTitle}>Add Item</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    {["image","video","facebook"].map(t => (
                      <button key={t} type="button" className="admin-btn" onClick={() => setWiType(t)}
                        style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontWeight: wiType === t ? 600 : 400, background: wiType === t ? "#222" : "#eee", color: wiType === t ? "#fff" : "#666" }}>
                        {t === "image" ? "Image" : t === "video" ? "YouTube" : "Facebook"}
                      </button>
                    ))}
                  </div>
                  <select value={wiCat} onChange={e => { setWiCat(e.target.value); setWiSubcat(""); }} style={{ ...S.input, marginBottom: 10, color: wiCat ? "#222" : "#aaa" }}>
                    <option value="" disabled>Select category...</option>
                    {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  {wiCat && subcats.filter(s => s.category_id === wiCat).length > 0 && (
                    <select value={wiSubcat} onChange={e => setWiSubcat(e.target.value)} style={{ ...S.input, marginBottom: 10, color: wiSubcat ? "#222" : "#aaa" }}>
                      <option value="">No subcategory (optional)</option>
                      {subcats.filter(s => s.category_id === wiCat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  <input value={wiTitle} onChange={e => setWiTitle(e.target.value)} placeholder="Title" style={{ ...S.input, marginBottom: 10 }}/>
                  <input value={wiDesc} onChange={e => setWiDesc(e.target.value)} placeholder="Description (optional)" style={{ ...S.input, marginBottom: 10 }}/>
                  {wiType === "image" && (
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 11, color: "#888" }}>Image file</label>
                      <input key={fileKey} type="file" accept="image/*" onChange={e => setWiFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                    </div>
                  )}
                  {wiType === "video" && (
                    <>
                      <input value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="YouTube video ID" style={{ ...S.input, marginBottom: 10 }}/>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, color: "#888" }}>Thumbnail image <span style={{ color: "#bbb" }}>(optional)</span></label>
                        <input key={fileKey} type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                      </div>
                    </>
                  )}
                  {wiType === "facebook" && (
                    <>
                      <input value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="Facebook reel/video URL (e.g. https://www.facebook.com/reel/123...)" style={{ ...S.input, marginBottom: 10 }}/>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: 11, color: "#888" }}>Thumbnail image <span style={{ color: "#bbb" }}>(recommended)</span></label>
                        <input key={fileKey} type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                      </div>
                    </>
                  )}
                  <button type="submit" className="admin-btn" disabled={adminLoading || !wiTitle.trim() || !wiCat}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !wiTitle.trim() || !wiCat) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Item"}
                  </button>
                </form>
                {items.length === 0 && emptyMsg("No work items yet.")}
                {items.map(item => (
                  <div key={item.id} style={S.listItem}>
                    <img src={itemThumb(item)} alt="" style={{ width: 52, height: 36, objectFit: "cover", borderRadius: 5, background: "#eee" }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: "#777" }}>{item.type} · {cats.find(c => c.id === item.cat)?.label}</div>
                    </div>
                    <button className="admin-ghost" onClick={() => handleDeleteWorkItem(item.id)} disabled={adminLoading}
                      style={{ ...S.btnDanger, opacity: adminLoading ? 0.5 : 1 }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── FAQs Tab ── */}
            {adminTab === "faqs" && (
              <div>
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> FAQs appear on the home page (top 3) and the full FAQ page. They are automatically translated to all 5 languages. Drag to reorder.
                </div>
                <p style={S.label}>FAQs ({faqs.length})</p>
                {faqs.length === 0 && emptyMsg("No FAQs yet. Add one below.")}
                <DragList
                  items={faqs}
                  keyFn={(f) => f.id || f.q}
                  onReorder={handleFaqReorder}
                  renderItem={(f) => (
                    editingFaq === (f.id || f.q) ? (
                      <div>
                        <input value={editFaqQ} onChange={e => setEditFaqQ(e.target.value)} style={{ ...S.input, marginBottom: 10, fontWeight: 600 }}/>
                        <textarea value={editFaqA} onChange={e => setEditFaqA(e.target.value)} rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 10 }}/>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="admin-btn" onClick={() => handleUpdateFaq(f.id)} disabled={adminLoading} style={{ ...S.btnSmall, background: "#222", color: "#fff", borderColor: "#222", fontWeight: 600 }}>{translating ? "Translating..." : "Save"}</button>
                          <button className="admin-ghost" onClick={() => setEditingFaq(null)} style={S.btnSmall}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{f.q}</div>
                        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 6 }}>{f.a}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {f.id && <button className="admin-ghost" onClick={() => { setEditingFaq(f.id); setEditFaqQ(f.q); setEditFaqA(f.a); }} style={S.btnSmall}>Edit</button>}
                          {f.id && <button className="admin-ghost" onClick={() => handleDeleteFaq(f.id)} disabled={adminLoading} style={{ ...S.btnDanger, opacity: adminLoading ? 0.5 : 1 }}>Delete</button>}
                        </div>
                      </div>
                    )
                  )}
                />
                <form onSubmit={prevent(handleAddFaq)} style={{ ...S.adminCard, marginTop: 20 }}>
                  <p style={S.adminCardTitle}>Add FAQ</p>
                  <input value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="Question" style={{ ...S.input, marginBottom: 10 }}/>
                  <textarea value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="Answer" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit" }}/>
                  <button type="submit" className="admin-btn" disabled={adminLoading || !faqQ.trim() || !faqA.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !faqQ.trim() || !faqA.trim()) ? 0.5 : 1 }}>
                    {translating ? "Translating..." : adminLoading ? "Adding..." : "Add FAQ"}
                  </button>
                </form>
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
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Facebook reviews show as "Recommends" (no star ratings). They appear in the Reviews section on home page and the Reviews page, mixed with Google reviews.
                </div>
                <p style={S.label}>Facebook Reviews ({fbReviews.length})</p>
                <form onSubmit={prevent(handleAddFbReview)} style={{ ...S.adminCard, marginBottom: 20 }}>
                  <p style={S.adminCardTitle}>Add Facebook Review</p>
                  <input value={fbrName} onChange={e => setFbrName(e.target.value)} placeholder="Reviewer name" style={{ ...S.input, marginBottom: 10 }}/>
                  <textarea value={fbrText} onChange={e => setFbrText(e.target.value)} placeholder="Review text" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 10 }}/>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Review date (optional)</label>
                    <input type="date" value={fbrDate} onChange={e => setFbrDate(e.target.value)} style={{ ...S.input, marginTop: 4 }}/>
                  </div>
                  <button type="submit" className="admin-btn" disabled={adminLoading || !fbrName.trim() || !fbrText.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !fbrName.trim() || !fbrText.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Review"}
                  </button>
                </form>
                {fbReviews.length === 0 && emptyMsg("No Facebook reviews yet.")}
                {fbReviews.map(r => (
                  <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: "#1877F2", marginLeft: 8 }}>👍 Recommends</span>
                        {r.review_date && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>{r.review_date}</span>}
                      </div>
                      <button className="admin-ghost" onClick={() => handleDeleteFbReview(r.id)} disabled={adminLoading}
                        style={{ ...S.btnDanger, opacity: adminLoading ? 0.5 : 1 }}>Remove</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Google Reviews Tab ── */}
            {adminTab === "greview" && (
              <div>
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Google reviews with star ratings (1-5). They appear in the Reviews section on home page and the Reviews page. The star average is calculated only from these.
                </div>
                <p style={S.label}>Google Reviews ({(googleReviews || []).length})</p>
                <form onSubmit={prevent(handleAddGoogleReview)} style={{ ...S.adminCard, marginBottom: 20 }}>
                  <p style={S.adminCardTitle}>Add Google Review</p>
                  <input value={grName} onChange={e => setGrName(e.target.value)} placeholder="Reviewer name" style={{ ...S.input, marginBottom: 10 }}/>
                  <select value={grRating} onChange={e => setGrRating(e.target.value)} style={{ ...S.input, marginBottom: 10 }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                  </select>
                  <textarea value={grText} onChange={e => setGrText(e.target.value)} placeholder="Review text" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 10 }}/>
                  <input value={grTime} onChange={e => setGrTime(e.target.value)} placeholder="Time label (e.g. '2 weeks ago')" style={S.input}/>
                  <button type="submit" className="admin-btn" disabled={adminLoading || !grName.trim() || !grText.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !grName.trim() || !grText.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Review"}
                  </button>
                </form>
                {(googleReviews || []).length === 0 && emptyMsg("No Google reviews yet.")}
                {(googleReviews || []).map(r => (
                  <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: "#E8A317", marginLeft: 8 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        {r.time_label && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>{r.time_label}</span>}
                      </div>
                      <button className="admin-ghost" onClick={() => handleDeleteGoogleReview(r.id)} disabled={adminLoading}
                        style={{ ...S.btnDanger, opacity: adminLoading ? 0.5 : 1 }}>Remove</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Site Texts Tab ── */}
            {adminTab === "config" && (
              <div>
                <div style={{ padding: "10px 14px", background: "#F5F5F5", borderRadius: 8, marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  <strong>How it works:</strong> Customize the main texts on the site. You can change the content, font size, and font family. Leave blank to use the default. Changes appear immediately.
                </div>
                <p style={S.label}>Site Texts</p>
                {Object.entries(SITE_TEXTS).map(([key, def]) => (
                  <SiteTextRow key={key} configKey={key} def={def} currentValue={siteConfig[key]} onSave={handleSaveConfig} loading={adminLoading} />
                ))}

                {/* Extra config keys (not in SITE_TEXTS) */}
                {Object.entries(siteConfig).filter(([key]) => !SITE_TEXTS[key]).length > 0 && (
                  <>
                    <p style={{ ...S.label, marginTop: 24 }}>Other Settings</p>
                    {Object.entries(siteConfig).filter(([key]) => !SITE_TEXTS[key]).map(([key, value]) => (
                      <ConfigRow key={key} configKey={key} initialValue={value} onSave={handleSaveConfig} loading={adminLoading} />
                    ))}
                  </>
                )}
                <form onSubmit={prevent(() => {
                  if (!cfgKey.trim()) return;
                  handleSaveConfig(cfgKey.trim(), cfgVal.trim());
                  setCfgKey(""); setCfgVal("");
                })} style={{ ...S.adminCard, marginTop: 16 }}>
                  <p style={S.adminCardTitle}>Add Custom Setting</p>
                  <input value={cfgKey} onChange={e => setCfgKey(e.target.value)} placeholder="Key" style={{ ...S.input, marginBottom: 10 }}/>
                  <input value={cfgVal} onChange={e => setCfgVal(e.target.value)} placeholder="Value" style={S.input}/>
                  <button type="submit" className="admin-btn" disabled={adminLoading} style={{ ...S.btnPrimary, marginTop: 12, opacity: adminLoading ? 0.5 : 1 }}>
                    {adminLoading ? "Saving..." : "Save"}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Controlled config row component for extra settings
function ConfigRow({ configKey, initialValue, onSave, loading }) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { setValue(initialValue); }, [initialValue]);
  return (
    <div style={S.listItem}>
      <label style={{ fontSize: 12, fontWeight: 600, minWidth: 120 }}>{configKey}</label>
      <input value={value} onChange={e => setValue(e.target.value)} style={{ ...S.input, flex: 1, margin: 0 }}/>
      <button className="admin-btn" onClick={() => onSave(configKey, value)} disabled={loading}
        style={{ ...S.btnSmall, background: "#222", color: "#fff", borderColor: "#222", fontWeight: 600, opacity: loading ? 0.5 : 1 }}>Save</button>
    </div>
  );
}

const FONT_OPTIONS = ["DM Sans", "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Playfair Display", "Dancing Script", "Georgia", "Arial", "Comic Sans MS", "Comic Neue", "Patrick Hand", "Caveat", "Indie Flower"];

// Site text row with text + fontSize + fontFamily
function SiteTextRow({ configKey, def, currentValue, onSave, loading }) {
  const parsed = parseSiteText(currentValue) || {};
  const [text, setText] = useState(parsed.text || "");
  const [fontSize, setFontSize] = useState(parsed.fontSize || "");
  const [fontFamily, setFontFamily] = useState(parsed.fontFamily || "");

  useEffect(() => {
    const p = parseSiteText(currentValue) || {};
    setText(p.text || "");
    setFontSize(p.fontSize || "");
    setFontFamily(p.fontFamily || "");
  }, [currentValue]);

  const handleSave = () => {
    const val = { text: text || "", fontSize: fontSize ? Number(fontSize) : undefined, fontFamily: fontFamily || undefined };
    // Clean undefined values
    Object.keys(val).forEach(k => val[k] === undefined && delete val[k]);
    onSave(configKey, JSON.stringify(val));
  };

  return (
    <div style={{ ...S.adminCard, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600 }}>{def.label}</p>
        <span style={{ fontSize: 9, color: "#bbb", fontFamily: "monospace" }}>{configKey}</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={def.defaultText || "(uses translation default)"}
        rows={configKey === "bio_text" ? 4 : 2}
        style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}/>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: "#888" }}>Font size (px)</label>
          <input type="number" value={fontSize} onChange={e => setFontSize(e.target.value)}
            placeholder={`${def.defaultFontSize}`}
            style={{ ...S.input, marginTop: 2 }}/>
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: 10, color: "#888" }}>Font family</label>
          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)}
            style={{ ...S.input, marginTop: 2, color: fontFamily ? "#222" : "#aaa" }}>
            <option value="">Default ({def.defaultFontFamily})</option>
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      {/* Preview */}
      {text && (
        <div style={{ marginTop: 8, padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px dashed #e0e0e0" }}>
          <span style={{ fontSize: 9, color: "#bbb", display: "block", marginBottom: 4 }}>Preview:</span>
          <span style={{
            fontSize: fontSize ? `${fontSize}px` : `${def.defaultFontSize}px`,
            fontFamily: fontFamily ? `'${fontFamily}', sans-serif` : `'${def.defaultFontFamily}', sans-serif`,
          }}>{text}</span>
        </div>
      )}
      <button className="admin-btn" onClick={handleSave} disabled={loading}
        style={{ ...S.btnPrimary, marginTop: 10, opacity: loading ? 0.5 : 1 }}>
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
