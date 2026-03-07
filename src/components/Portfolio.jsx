import { useTranslation } from "react-i18next";
import { R, G, WA_LINK, ytThumb, svgP, socialIcons } from "../lib/constants";

export default function Portfolio({ cats, items, subcats, portfolioView, setPortfolioView, setLb }) {
  const { t } = useTranslation();
  const activeCats = cats.filter(c => c.id !== "all" && (items.some(w => w.cat === c.id) || (subcats || []).some(s => s.category_id === c.id)));
  const totalPhotos = items.filter(w => w.type === "image").length;
  const totalVideos = items.filter(w => w.type === "video").length;
  const totalPlaylists = (subcats || []).filter(s => s.playlist_id).length;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t("portfolio.title")}</h2>
      {portfolioView === "categories" && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 18 }}>
          {activeCats.length} {t("portfolio.categories", "categories")}
          {totalPhotos > 0 && <> · {totalPhotos} {t("portfolio.photos")}</>}
          {totalVideos > 0 && <> · {totalVideos} {t("portfolio.videos")}</>}
          {totalPlaylists > 0 && <> · {totalPlaylists} {t("portfolio.playlists")}</>}
        </p>
      )}

      {/* Level 1: Category Grid */}
      {portfolioView === "categories" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
            {activeCats.map(c => {
              const catItems = items.filter(w => w.cat === c.id);
              const catPlaylists = (subcats || []).filter(s => s.category_id === c.id && s.playlist_id).length;
              const thumb = c.header_image || (catItems[0]?.type === "video" ? ytThumb(catItems[0]) : catItems[0]?.src) || "";
              return (
                <div key={c.id}
                  onClick={() => { setPortfolioView({ cat: c.id, tab: "photos" }); window.scrollTo?.(0, 0); }}
                  style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "relative", paddingTop: "65%", background: G }}>
                    {thumb ? (
                      <img src={thumb} alt={c.label} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}/>
                    <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                        {catItems.length > 0 && <>{catItems.length} {catItems.length === 1 ? t("portfolio.item") : t("portfolio.items")}</>}
                        {catItems.length > 0 && catPlaylists > 0 && " · "}
                        {catPlaylists > 0 && <>{catPlaylists} {t("portfolio.playlists")}</>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {!activeCats.length && <p style={{ textAlign: "center", padding: 60, color: "#ccc", fontSize: 13 }}>{t("portfolio.noItems")}</p>}
        </>
      )}

      {/* Level 2: Category Detail View */}
      {typeof portfolioView === "object" && portfolioView.cat && (() => {
        const currentCat = cats.find(c => c.id === portfolioView.cat);
        const catItems = items.filter(w => w.cat === portfolioView.cat);
        const photos = catItems.filter(w => w.type === "image");
        const videos = catItems.filter(w => w.type === "video");
        const activeTab = portfolioView.tab || "photos";
        const displayItems = activeTab === "photos" ? photos : videos;
        const catSubcats = (subcats || []).filter(s => s.category_id === portfolioView.cat);
        const catThumb = currentCat?.header_image || (catItems[0]?.type === "video" ? ytThumb(catItems[0]) : catItems[0]?.src) || "";

        return (
          <>
            {/* Category header with image */}
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 20, height: 120, background: G }}>
              {catThumb && <img src={catThumb} alt={currentCat?.label} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)" }}/>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
                <button onClick={() => { setPortfolioView("categories"); window.scrollTo?.(0, 0); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500, padding: 0, marginBottom: 6, textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
                  {t("portfolio.backToCategories")}
                </button>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{currentCat?.label}</h3>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  {photos.length} {t("portfolio.photos")} · {videos.length} {t("portfolio.videos")}
                  {catSubcats.length > 0 && <> · {catSubcats.length} {t("portfolio.playlists")}</>}
                </div>
              </div>
            </div>

            {/* Subcategories (YouTube Playlists) */}
            {catSubcats.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  {t("portfolio.playlists")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                  {catSubcats.map(sc => (
                    <a key={sc.id}
                      href={sc.playlist_id ? `https://www.youtube.com/playlist?list=${sc.playlist_id}` : "#"}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1px solid #eee", background: "#fafafa", textDecoration: "none", color: "#333", transition: "border-color .2s, box-shadow .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF0000"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,0,0,0.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; }}>
                      <img src={socialIcons.yt} alt="YouTube" width={32} height={32} style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sc.name}</div>
                        <div style={{ fontSize: 10, color: "#666" }}>{t("portfolio.viewPlaylist")}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs: Photos / Videos */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f0f0f0" }}>
              {[["photos", t("portfolio.photos"), photos.length], ["videos", t("portfolio.videos"), videos.length]].map(([tab, label, count]) => (
                <button key={tab} onClick={() => setPortfolioView({ ...portfolioView, tab })}
                  style={{
                    padding: "8px 18px", background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? R : "#666",
                    borderBottom: activeTab === tab ? `2px solid ${R}` : "2px solid transparent",
                    marginBottom: -2,
                  }}>
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
              {displayItems.map(item => (
                <div key={item.id} onClick={() => setLb(item)}
                  style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "relative", paddingTop: "62%" }}>
                    <img src={item.type === "video" ? ytThumb(item) : item.src} alt={item.title + " - handyman service in Zurich"} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                    {item.type === "video" && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.08)" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="13" height="13" viewBox="0 0 20 20" fill={R}><path d="M6 4l10 6-10 6V4z"/></svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "9px 11px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                    {item.desc && <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{item.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
            {!displayItems.length && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <p style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>{t("portfolio.noItemsYet", "No items yet in this section. Check out the playlists above!")}</p>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
                  {t("portfolio.askForPhotos", "Ask me for photos of this work")}
                </a>
              </div>
            )}
          </>
        );
      })()}

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", marginTop: 40, padding: "24px 20px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: G, marginBottom: 10 }}>{t("portfolio.ctaTitle", "Like what you see?")}</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("portfolio.ctaButton", "Tell me about your project")}
        </a>
      </div>
    </div>
  );
}
