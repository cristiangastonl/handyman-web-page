import { useState, useEffect } from "react";
import { R, S, ytThumb } from "../../lib/constants";
import { translateFaq } from "../../lib/translate";
import {
  supabase, uploadImage,
  fetchCategories, addCategory, deleteCategory,
  fetchWorkItems, addWorkItem, deleteWorkItem,
  fetchFaqs, addFaqRow, updateFaqRow, deleteFaqRow,
  fetchSiteConfig, upsertSiteConfig,
  fetchSubcategories, addSubcategory, deleteSubcategory,
  fetchHighlights, addHighlight, deleteHighlight,
  fetchFbReviews, addFbReview, deleteFbReview,
  fetchGoogleReviews, addGoogleReview, deleteGoogleReview,
} from "../../lib/supabase";

export default function AdminPanel({ onBack, cats, setCats, items, setItems, faqs, setFaqs, subcats, setSubcats, highlights, setHighlights, fbReviews, setFbReviews, googleReviews, setGoogleReviews }) {
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

  // Highlight form
  const [hlTitle, setHlTitle] = useState("");
  const [hlDesc, setHlDesc] = useState("");
  const [hlFile, setHlFile] = useState(null);

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

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) setSession(s);
    });
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

  const flash = (msg) => { setAdminMsg(msg); setTimeout(() => setAdminMsg(""), 2500); };

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
      setNcLabel(""); setNcFile(null);
      flash("Category added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteCategory = async (id) => {
    setAdminLoading(true);
    try {
      await deleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
      setItems(prev => prev.filter(w => w.cat !== id));
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
      if (wiType === "video" && wiThumbFile) thumb = await uploadImage(wiThumbFile, "work");
      const row = {
        type: wiType, cat: wiCat, title: wiTitle.trim(),
        description: wiDesc.trim() || null, src, thumb,
        video_id: wiType === "video" ? wiVideoId.trim() || null : null,
      };
      const saved = await addWorkItem(row);
      setItems(prev => [...prev, {
        id: saved.id, type: saved.type, cat: saved.cat, src: saved.src,
        thumb: saved.thumb, title: saved.title, desc: saved.description, videoId: saved.video_id,
      }]);
      setWiTitle(""); setWiDesc(""); setWiFile(null); setWiVideoId(""); setWiThumbFile(null);
      flash("Work item added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteWorkItem = async (id) => {
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
    setAdminLoading(true);
    try {
      await deleteFaqRow(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      flash("FAQ deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Subcategory CRUD ──
  const handleAddSubcategory = async () => {
    if (!scName.trim() || !scParent) return;
    setAdminLoading(true);
    try {
      let headerImage = null;
      if (scFile) headerImage = await uploadImage(scFile, "subcategories");
      const saved = await addSubcategory(scParent, scName.trim(), headerImage, scPlaylistId.trim() || null);
      setSubcats(prev => [...prev, saved]);
      setScName(""); setScParent(""); setScFile(null); setScPlaylistId("");
      flash("Subcategory added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteSubcategory = async (id) => {
    setAdminLoading(true);
    try {
      await deleteSubcategory(id);
      setSubcats(prev => prev.filter(s => s.id !== id));
      flash("Subcategory deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── Highlight CRUD ──
  const handleAddHighlight = async () => {
    if (!hlTitle.trim()) return;
    setAdminLoading(true);
    try {
      let imageUrl = null;
      if (hlFile) imageUrl = await uploadImage(hlFile, "highlights");
      const saved = await addHighlight(hlTitle.trim(), imageUrl, hlDesc.trim() || null);
      setHighlights(prev => [...prev, saved]);
      setHlTitle(""); setHlDesc(""); setHlFile(null);
      flash("Highlight added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteHighlight = async (id) => {
    setAdminLoading(true);
    try {
      await deleteHighlight(id);
      setHighlights(prev => prev.filter(h => h.id !== id));
      flash("Highlight deleted");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  // ── FB Review CRUD ──
  const handleAddFbReview = async () => {
    if (!fbrName.trim() || !fbrText.trim()) return;
    setAdminLoading(true);
    try {
      const saved = await addFbReview(fbrName.trim(), parseInt(fbrRating), fbrText.trim(), fbrDate || null);
      setFbReviews(prev => [...prev, saved]);
      setFbrName(""); setFbrRating("5"); setFbrText(""); setFbrDate("");
      flash("Facebook review added");
    } catch (err) { flash("Error: " + err.message); }
    finally { setAdminLoading(false); }
  };

  const handleDeleteFbReview = async (id) => {
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

  return (
    <div style={S.root}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Admin Panel</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {session && <button onClick={handleLogout} style={{ ...S.ghost, color: R, borderColor: "#fdd" }}>Logout</button>}
            <button onClick={onBack} style={S.ghost}>← Back</button>
          </div>
        </div>

        {!supabase && (
          <div style={{ padding: "14px 16px", background: "#FFF3E0", borderRadius: 8, marginBottom: 20, fontSize: 12, color: "#E65100", lineHeight: 1.5 }}>
            Supabase not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable persistence.
          </div>
        )}

        {supabase && !session ? (
          <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: "60px auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Admin Login</h3>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" required style={S.input}/>
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" required style={{ ...S.input, marginTop: 8 }}/>
            {loginErr && <div style={{ color: R, fontSize: 11, marginTop: 6 }}>{loginErr}</div>}
            <button type="submit" disabled={loginLoading} style={{ ...S.btnPrimary, marginTop: 12, width: "100%", opacity: loginLoading ? 0.6 : 1 }}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <>
            {adminMsg && (
              <div style={{ padding: "8px 14px", background: adminMsg.startsWith("Error") ? "#FFEBEE" : "#E8F5E9", borderRadius: 6, marginBottom: 14, fontSize: 12, color: adminMsg.startsWith("Error") ? R : "#2E7D32" }}>
                {adminMsg}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f0f0f0" }}>
              {[["categories","Categories"],["work","Work"],["faqs","FAQs"],["subcategories","Subcats"],["highlights","Highlights"],["fbreview","FB Reviews"],["greview","G Reviews"],["config","Config"]].map(([k, l]) => (
                <button key={k} onClick={() => setAdminTab(k)}
                  style={{ padding: "8px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: adminTab === k ? 600 : 400, color: adminTab === k ? R : "#999", borderBottom: adminTab === k ? `2px solid ${R}` : "2px solid transparent", marginBottom: -2 }}>
                  {l}
                </button>
              ))}
            </div>

            {/* ── Categories Tab ── */}
            {adminTab === "categories" && (
              <div>
                <p style={S.label}>Categories ({cats.filter(c => c.id !== "all").length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {cats.filter(c => c.id !== "all").map(c => (
                    <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f5f5", padding: "5px 12px", borderRadius: 14, fontSize: 12 }}>
                      {c.header_image && <img src={c.header_image} alt="" style={{ width: 18, height: 18, borderRadius: 3, objectFit: "cover" }}/>}
                      {c.label}
                      <button onClick={() => handleDeleteCategory(c.id)} disabled={adminLoading}
                        style={{ background: "none", border: "none", color: R, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Category</p>
                  <input value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name" style={S.input}/>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Header image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setNcFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                  </div>
                  <button onClick={handleAddCategory} disabled={adminLoading || !ncLabel.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !ncLabel.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Category"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Work Tab ── */}
            {adminTab === "work" && (
              <div>
                <p style={S.label}>Work Items ({items.length})</p>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Work Item</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {["image","video"].map(t => (
                      <button key={t} onClick={() => setWiType(t)}
                        style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontWeight: wiType === t ? 600 : 400, background: wiType === t ? "#222" : "#eee", color: wiType === t ? "#fff" : "#666" }}>
                        {t === "image" ? "Image" : "Video"}
                      </button>
                    ))}
                  </div>
                  <select value={wiCat} onChange={e => setWiCat(e.target.value)} style={{ ...S.input, marginBottom: 8, color: wiCat ? "#222" : "#aaa" }}>
                    <option value="" disabled>Select category...</option>
                    {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input value={wiTitle} onChange={e => setWiTitle(e.target.value)} placeholder="Title" style={{ ...S.input, marginBottom: 8 }}/>
                  <input value={wiDesc} onChange={e => setWiDesc(e.target.value)} placeholder="Description (optional)" style={{ ...S.input, marginBottom: 8 }}/>
                  {wiType === "image" && (
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: "#888" }}>Image file</label>
                      <input type="file" accept="image/*" onChange={e => setWiFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                    </div>
                  )}
                  {wiType === "video" && (
                    <>
                      <input value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="YouTube video ID" style={{ ...S.input, marginBottom: 8 }}/>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: "#888" }}>Thumbnail image <span style={{ color: "#bbb" }}>(optional)</span></label>
                        <input type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                      </div>
                    </>
                  )}
                  <button onClick={handleAddWorkItem} disabled={adminLoading || !wiTitle.trim() || !wiCat}
                    style={{ ...S.btnPrimary, opacity: (adminLoading || !wiTitle.trim() || !wiCat) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Item"}
                  </button>
                </div>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <img src={item.type === "video" ? ytThumb(item) : item.src} alt="" style={{ width: 52, height: 36, objectFit: "cover", borderRadius: 5, background: "#eee" }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: "#777" }}>{item.type} · {cats.find(c => c.id === item.cat)?.label}</div>
                    </div>
                    <button onClick={() => handleDeleteWorkItem(item.id)} disabled={adminLoading}
                      style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── FAQs Tab ── */}
            {adminTab === "faqs" && (
              <div>
                <p style={S.label}>FAQs ({faqs.length})</p>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add FAQ</p>
                  <input value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="Question" style={{ ...S.input, marginBottom: 8 }}/>
                  <textarea value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="Answer" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit" }}/>
                  <button onClick={handleAddFaq} disabled={adminLoading || !faqQ.trim() || !faqA.trim()}
                    style={{ ...S.btnPrimary, marginTop: 10, opacity: (adminLoading || !faqQ.trim() || !faqA.trim()) ? 0.5 : 1 }}>
                    {translating ? "Translating..." : adminLoading ? "Adding..." : "Add FAQ"}
                  </button>
                </div>
                {faqs.map(f => (
                  <div key={f.id || f.q} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                    {editingFaq === (f.id || f.q) ? (
                      <div>
                        <input value={editFaqQ} onChange={e => setEditFaqQ(e.target.value)} style={{ ...S.input, marginBottom: 6, fontWeight: 600 }}/>
                        <textarea value={editFaqA} onChange={e => setEditFaqA(e.target.value)} rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit" }}/>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button onClick={() => handleUpdateFaq(f.id)} disabled={adminLoading} style={{ ...S.btnPrimary, padding: "5px 14px", fontSize: 11 }}>{translating ? "Translating..." : "Save"}</button>
                          <button onClick={() => setEditingFaq(null)} style={S.ghost}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{f.q}</div>
                        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 6 }}>{f.a}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {f.id && <button onClick={() => { setEditingFaq(f.id); setEditFaqQ(f.q); setEditFaqA(f.a); }} style={{ ...S.ghost, fontSize: 10, padding: "2px 8px" }}>Edit</button>}
                          {f.id && <button onClick={() => handleDeleteFaq(f.id)} disabled={adminLoading} style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Delete</button>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Subcategories Tab ── */}
            {adminTab === "subcategories" && (
              <div>
                <p style={S.label}>Subcategories ({subcats.length})</p>
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
                              style={{ background: "none", border: "none", color: R, cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Subcategory</p>
                  <select value={scParent} onChange={e => setScParent(e.target.value)} style={{ ...S.input, marginBottom: 8, color: scParent ? "#222" : "#aaa" }}>
                    <option value="" disabled>Select parent category...</option>
                    {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input value={scName} onChange={e => setScName(e.target.value)} placeholder="Subcategory name" style={S.input}/>
                  <input value={scPlaylistId} onChange={e => setScPlaylistId(e.target.value)} placeholder="YouTube Playlist ID (optional)" style={{ ...S.input, marginTop: 8 }}/>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Header image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setScFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                  </div>
                  <button onClick={handleAddSubcategory} disabled={adminLoading || !scName.trim() || !scParent}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !scName.trim() || !scParent) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Subcategory"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Highlights Tab ── */}
            {adminTab === "highlights" && (
              <div>
                <p style={S.label}>Highlights ({highlights.length})</p>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Highlight</p>
                  <input value={hlTitle} onChange={e => setHlTitle(e.target.value)} placeholder="Title" style={{ ...S.input, marginBottom: 8 }}/>
                  <textarea value={hlDesc} onChange={e => setHlDesc(e.target.value)} placeholder="Description (optional)" rows={2} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}/>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Image file</label>
                    <input type="file" accept="image/*" onChange={e => setHlFile(e.target.files[0] || null)} style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                  </div>
                  <button onClick={handleAddHighlight} disabled={adminLoading || !hlTitle.trim()}
                    style={{ ...S.btnPrimary, opacity: (adminLoading || !hlTitle.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Highlight"}
                  </button>
                </div>
                {highlights.map(h => (
                  <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f3f3f3" }}>
                    {h.image_url && <img src={h.image_url} alt="" style={{ width: 52, height: 36, objectFit: "cover", borderRadius: 5, background: "#eee" }}/>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</div>
                      {h.description && <div style={{ fontSize: 10, color: "#777" }}>{h.description}</div>}
                    </div>
                    <button onClick={() => handleDeleteHighlight(h.id)} disabled={adminLoading}
                      style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── FB Reviews Tab ── */}
            {adminTab === "fbreview" && (
              <div>
                <p style={S.label}>Facebook Reviews ({fbReviews.length})</p>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Facebook Review</p>
                  <input value={fbrName} onChange={e => setFbrName(e.target.value)} placeholder="Reviewer name" style={{ ...S.input, marginBottom: 8 }}/>
                  <select value={fbrRating} onChange={e => setFbrRating(e.target.value)} style={{ ...S.input, marginBottom: 8 }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                  </select>
                  <textarea value={fbrText} onChange={e => setFbrText(e.target.value)} placeholder="Review text" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}/>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Review date (optional)</label>
                    <input type="date" value={fbrDate} onChange={e => setFbrDate(e.target.value)} style={{ ...S.input, marginTop: 4 }}/>
                  </div>
                  <button onClick={handleAddFbReview} disabled={adminLoading || !fbrName.trim() || !fbrText.trim()}
                    style={{ ...S.btnPrimary, opacity: (adminLoading || !fbrName.trim() || !fbrText.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Review"}
                  </button>
                </div>
                {fbReviews.map(r => (
                  <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: "#E8A317", marginLeft: 8 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        {r.review_date && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>{r.review_date}</span>}
                      </div>
                      <button onClick={() => handleDeleteFbReview(r.id)} disabled={adminLoading}
                        style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Remove</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Google Reviews Tab ── */}
            {adminTab === "greview" && (
              <div>
                <p style={S.label}>Google Reviews ({(googleReviews || []).length})</p>
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add Google Review</p>
                  <input value={grName} onChange={e => setGrName(e.target.value)} placeholder="Reviewer name" style={{ ...S.input, marginBottom: 8 }}/>
                  <select value={grRating} onChange={e => setGrRating(e.target.value)} style={{ ...S.input, marginBottom: 8 }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
                  </select>
                  <textarea value={grText} onChange={e => setGrText(e.target.value)} placeholder="Review text" rows={3} style={{ ...S.input, resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}/>
                  <input value={grTime} onChange={e => setGrTime(e.target.value)} placeholder="Time label (e.g. '2 weeks ago')" style={S.input}/>
                  <button onClick={handleAddGoogleReview} disabled={adminLoading || !grName.trim() || !grText.trim()}
                    style={{ ...S.btnPrimary, marginTop: 12, opacity: (adminLoading || !grName.trim() || !grText.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Review"}
                  </button>
                </div>
                {(googleReviews || []).map(r => (
                  <div key={r.id} style={{ padding: "10px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: "#E8A317", marginLeft: 8 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        {r.time_label && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>{r.time_label}</span>}
                      </div>
                      <button onClick={() => handleDeleteGoogleReview(r.id)} disabled={adminLoading}
                        style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Remove</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.4 }}>{r.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Config Tab ── */}
            {adminTab === "config" && (
              <div>
                <p style={S.label}>Site Configuration</p>
                {Object.keys(siteConfig).length === 0 && (
                  <p style={{ fontSize: 12, color: "#999" }}>No configuration keys found. Add keys via Supabase or save a new one below.</p>
                )}
                {Object.entries(siteConfig).map(([key, value]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f3f3f3" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, minWidth: 120 }}>{key}</label>
                    <input defaultValue={value} onBlur={e => { if (e.target.value !== value) handleSaveConfig(key, e.target.value); }} style={{ ...S.input, flex: 1, margin: 0 }}/>
                    <button onClick={e => { const input = e.target.previousElementSibling; handleSaveConfig(key, input.value); }} disabled={adminLoading}
                      style={{ ...S.btnPrimary, padding: "5px 12px", fontSize: 11 }}>Save</button>
                  </div>
                ))}
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add / Update Config Key</p>
                  <input id="cfg-key" placeholder="Key" style={{ ...S.input, marginBottom: 8 }}/>
                  <input id="cfg-val" placeholder="Value" style={S.input}/>
                  <button onClick={() => {
                    const k = document.getElementById("cfg-key").value.trim();
                    const v = document.getElementById("cfg-val").value.trim();
                    if (!k) return;
                    handleSaveConfig(k, v);
                    document.getElementById("cfg-key").value = "";
                    document.getElementById("cfg-val").value = "";
                  }} disabled={adminLoading} style={{ ...S.btnPrimary, marginTop: 12 }}>
                    {adminLoading ? "Saving..." : "Save Config"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
