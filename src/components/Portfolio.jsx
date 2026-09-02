import { useTranslation } from "react-i18next";
import { R, G, getSocialUrls, itemThumb, svgP, playlistUrl } from "../lib/constants";
import { SocialIcon } from "./ui";

/**
 * Link a la playlist de YouTube. Vive acá y no inline porque ahora lo usan los
 * dos niveles: la categoría y la subcategoría. Anibal pidió las playlists en
 * categorías también — "si no tiene una playlist cargada se ve como si no
 * tuviera".
 */
function PlaylistLink({ playlistId, t }) {
  const href = playlistUrl(playlistId);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-testid="playlist-link"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: "1px solid #eee", background: "#fafafa", textDecoration: "none", color: "#333", marginBottom: 20, transition: "border-color .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF0000"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; }}>
      <SocialIcon type="yt" size={28}/>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t("portfolio.viewPlaylist", "View Playlist")}</div>
        <div style={{ fontSize: 10, color: "#666" }}>YouTube</div>
      </div>
    </a>
  );
}

// Reusable item card
function ItemCard({ item, setLb, contextItems }) {
  return (
    <div key={item.id} onClick={() => setLb(item, contextItems)}
      style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "relative", paddingTop: "62%" }}>
        <img src={item.type === "image" ? item.src : itemThumb(item)} alt={item.title + " - handyman service in Zurich"} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
        {(item.type === "video" || item.type === "facebook") && (
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
  );
}

// Tabs for photos/videos + grid
function ItemsGrid({ items, activeTab, onTabChange, setLb, t }) {
  const photos = items.filter(w => w.type === "image");
  const videos = items.filter(w => w.type === "video" || w.type === "facebook");
  const displayItems = activeTab === "photos" ? photos : videos;

  return (
    <>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f0f0f0" }}>
        {[["photos", t("portfolio.photos"), photos.length], ["videos", t("portfolio.videos"), videos.length]].map(([tab, label, count]) => (
          <button key={tab} onClick={() => onTabChange(tab)}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
        {displayItems.map(item => <ItemCard key={item.id} item={item} setLb={setLb} contextItems={displayItems}/>)}
      </div>
      {!displayItems.length && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>{t("portfolio.noItemsYet", "No items yet in this section.")}</p>
          <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
            {t("portfolio.askForPhotos", "Ask me for photos of this work")}
          </a>
        </div>
      )}
    </>
  );
}

// Header banner for category or subcategory
function DetailHeader({ title, subtitle, thumb, onBack, backLabel }) {
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 20, height: 120, background: G }}>
      {thumb && <img src={thumb} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)" }}/>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px" }}>
        <button onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500, padding: 0, marginBottom: 6, textAlign: "left" }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
          {backLabel}
        </button>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{title}</h3>
        {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export default function Portfolio({ cats, items, subcats, portfolioView, setPortfolioView, setLb, siteConfig = {} }) {
  const { t } = useTranslation();
  const activeCats = cats.filter(c => c.id !== "all" && (items.some(w => w.cat === c.id) || (subcats || []).some(s => s.category_id === c.id)));
  const totalPhotos = items.filter(w => w.type === "image").length;
  const totalVideos = items.filter(w => w.type === "video" || w.type === "facebook").length;

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t("portfolio.title")}</h1>
      {portfolioView === "categories" && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 18 }}>
          {activeCats.length} {t("portfolio.categories", "categories")}
          {totalPhotos > 0 && <> · {totalPhotos} {t("portfolio.photos")}</>}
          {totalVideos > 0 && <> · {totalVideos} {t("portfolio.videos")}</>}
        </p>
      )}

      {/* Level 1: Category Grid */}
      {portfolioView === "categories" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
            {activeCats.map(c => {
              const catItems = items.filter(w => w.cat === c.id);
              const catSubcats = (subcats || []).filter(s => s.category_id === c.id);
              const thumb = c.header_image || (catItems[0]?.type === "image" ? catItems[0]?.src : itemThumb(catItems[0])) || "";
              return (
                <div key={c.id} data-testid="category-card"
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
                        {catItems.length > 0 && catSubcats.length > 0 && " · "}
                        {catSubcats.length > 0 && <>{catSubcats.length} {t("portfolio.subcategories", "subcategories")}</>}
                        {c.playlist_id && <span data-testid="category-playlist-badge">
                          {(catItems.length > 0 || catSubcats.length > 0) && " · "}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ verticalAlign: "middle", marginRight: 3 }}><path d="M23 12l-10.5-7v14L23 12zM1 5h2v14H1V5zm4 0h2v14H5V5zm4 0h2v14H9V5z"/></svg>
                          {t("portfolio.playlist", "Playlist")}
                        </span>}
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

      {/* Level 2: Category Detail — subcategory cards + loose items */}
      {typeof portfolioView === "object" && portfolioView.cat && !portfolioView.subcat && (() => {
        const currentCat = cats.find(c => c.id === portfolioView.cat);
        const catItems = items.filter(w => w.cat === portfolioView.cat);
        const catSubcats = (subcats || []).filter(s => s.category_id === portfolioView.cat);
        const looseItems = catItems.filter(w => !w.subcategory_id);
        const catThumb = currentCat?.header_image || (catItems[0]?.type === "image" ? catItems[0]?.src : itemThumb(catItems[0])) || "";
        const activeTab = portfolioView.tab || "photos";
        const loosePhotos = looseItems.filter(w => w.type === "image").length;
        const looseVideos = looseItems.filter(w => w.type === "video" || w.type === "facebook").length;

        return (
          <>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, color: "#999" }}>
              <button onClick={() => { setPortfolioView("categories"); window.scrollTo?.(0, 0); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: R, fontWeight: 500, padding: 0, fontSize: 13 }}>
                {t("portfolio.title")}
              </button>
              <span style={{ color: "#ccc" }}>/</span>
              <span style={{ color: "#555", fontWeight: 600 }}>{currentCat?.label}</span>
            </div>
            <DetailHeader
              title={currentCat?.label}
              thumb={catThumb}
              onBack={() => { setPortfolioView("categories"); window.scrollTo?.(0, 0); }}
              backLabel={t("portfolio.backToCategories")} /* the translation already carries the ← */
            />

            <PlaylistLink playlistId={currentCat?.playlist_id} t={t}/>

            {/* Subcategory cards */}
            {catSubcats.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  {t("portfolio.subcategories", "Subcategories")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14 }}>
                  {catSubcats.map(sc => {
                    const scItems = catItems.filter(w => w.subcategory_id === sc.id);
                    const scThumb = sc.header_image || (scItems[0]?.type === "image" ? scItems[0]?.src : itemThumb(scItems[0])) || "";
                    return (
                      <div key={sc.id}
                        onClick={() => { setPortfolioView({ cat: portfolioView.cat, subcat: sc.id, tab: "photos" }); window.scrollTo?.(0, 0); }}
                        style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,120,31,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                        <div style={{ position: "relative", paddingTop: "65%", background: G }}>
                          {scThumb ? (
                            <img src={scThumb} alt={sc.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
                          ) : (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                              </svg>
                            </div>
                          )}
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}/>
                          <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{sc.name}</div>
                            {/* Counts belong on the cards you can click into, never on the
                                banner of the level you are already looking at. */}
                            {(scItems.length > 0 || sc.playlist_id) && (
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                                {scItems.length > 0 && <>{scItems.length} {scItems.length === 1 ? t("portfolio.item") : t("portfolio.items")}</>}
                                {sc.playlist_id && <>
                                  {scItems.length > 0 && " · "}
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" style={{ verticalAlign: "middle", marginRight: 3 }}><path d="M23 12l-10.5-7v14L23 12zM1 5h2v14H1V5zm4 0h2v14H5V5zm4 0h2v14H9V5z"/></svg>
                                  {t("portfolio.playlist", "Playlist")}
                                </>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loose items (no subcategory) */}
            {(loosePhotos > 0 || looseVideos > 0) && (
              <>
                {catSubcats.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                    {t("portfolio.general", "General")}
                  </div>
                )}
                <ItemsGrid
                  items={looseItems}
                  activeTab={activeTab}
                  onTabChange={tab => setPortfolioView({ ...portfolioView, tab })}
                  setLb={setLb}
                  t={t}
                />
              </>
            )}

            {/* No content at all */}
            {catSubcats.length === 0 && loosePhotos === 0 && looseVideos === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <p style={{ color: "#999", fontSize: 13, marginBottom: 12 }}>{t("portfolio.noItemsYet", "No items yet in this section.")}</p>
                <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#25D366", textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d={svgP.wa}/></svg>
                  {t("portfolio.askForPhotos", "Ask me for photos of this work")}
                </a>
              </div>
            )}
          </>
        );
      })()}

      {/* Level 3: Subcategory Detail — items within a subcategory */}
      {typeof portfolioView === "object" && portfolioView.subcat && (() => {
        const currentCat = cats.find(c => c.id === portfolioView.cat);
        const currentSubcat = (subcats || []).find(s => s.id === portfolioView.subcat);
        const scItems = items.filter(w => w.cat === portfolioView.cat && w.subcategory_id === portfolioView.subcat);
        const activeTab = portfolioView.tab || "photos";
        const scThumb = currentSubcat?.header_image || (scItems[0]?.type === "image" ? scItems[0]?.src : itemThumb(scItems[0])) || "";

        return (
          <>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, color: "#999", flexWrap: "wrap" }}>
              <button onClick={() => { setPortfolioView("categories"); window.scrollTo?.(0, 0); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: R, fontWeight: 500, padding: 0, fontSize: 13 }}>
                {t("portfolio.title")}
              </button>
              <span style={{ color: "#ccc" }}>/</span>
              <button onClick={() => { setPortfolioView({ cat: portfolioView.cat, tab: "photos" }); window.scrollTo?.(0, 0); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: R, fontWeight: 500, padding: 0, fontSize: 13 }}>
                {currentCat?.label}
              </button>
              <span style={{ color: "#ccc" }}>/</span>
              <span style={{ color: "#555", fontWeight: 600 }}>{currentSubcat?.name}</span>
            </div>
            <DetailHeader
              title={currentSubcat?.name}
              /* No subtitle: the back link and the breadcrumb already name the parent category. */
              thumb={scThumb}
              onBack={() => { setPortfolioView({ cat: portfolioView.cat, tab: "photos" }); window.scrollTo?.(0, 0); }}
              backLabel={`← ${currentCat?.label}`}
            />

            <PlaylistLink playlistId={currentSubcat?.playlist_id} t={t}/>

            <ItemsGrid
              items={scItems}
              activeTab={activeTab}
              onTabChange={tab => setPortfolioView({ ...portfolioView, tab })}
              setLb={setLb}
              t={t}
            />
          </>
        );
      })()}

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", marginTop: 40, padding: "24px 20px", background: "#fafafa", borderRadius: 12, border: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: G, marginBottom: 10 }}>{t("portfolio.ctaTitle", "Like what you see?")}</p>
        <a href={getSocialUrls(siteConfig).wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "transform .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
          {t("portfolio.ctaButton", "Tell me about your project")}
        </a>
      </div>
    </div>
  );
}
