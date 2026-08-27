import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  S, css,
  DEFAULT_CATS, DEFAULT_WORK, DEFAULT_FAQS, DEFAULT_SUBCATS,
  DEFAULT_HIGHLIGHTS, DEFAULT_FB_REVIEWS,
} from "./lib/constants";
import {
  supabase, fetchCategories, fetchWorkItems, fetchFaqs,
  fetchSubcategories, fetchHighlights, fetchFbReviews, fetchSiteConfig,
  fetchGoogleReviews, fetchCarouselItems,
} from "./lib/supabase";

// Components (eager — needed on home page)
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import ServiceAreas from "./components/ServiceAreas";
import { RecentWork } from "./components/RecentWork";
import Highlights from "./components/Highlights";
import TailorJobs from "./components/TailorJobs";
import BrandStrip from "./components/BrandStrip";
import { TailoringCTA, ServiceAreasCTA, BottomCTA } from "./components/CTA";
import { GoogleReviewsHome, ReviewsPage } from "./components/Reviews";
import { FAQHome, FAQPage } from "./components/FAQ";
import Footer from "./components/Footer";
import Lightbox from "./components/Lightbox";
import StickyBar from "./components/StickyBar";
import SpeedTuner from "./components/SpeedTuner";
import { isTunerEnabled } from "./lib/carouselSpeed";

// Lazy-loaded routes (code-split — only downloaded when user navigates)
const Portfolio = lazy(() => import("./components/Portfolio"));
const AdminPanel = lazy(() => import("./components/Admin/AdminPanel"));

// Normalize carousel_items join data into the shape Carousel component expects
const normalizeCarouselItem = (ci) => ({
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

export default function App() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = i18n.language === 'en' ? 'en-CH' : i18n.language;
  }, [i18n.language]);

  // Panel de velocidad de carruseles: visible por defecto mientras la web no
  // esté lanzada. ?tune=0 o la X lo apagan por el resto de la pestaña.
  const [tuner, setTuner] = useState(false);
  useEffect(() => {
    setTuner(isTunerEnabled(location.search));
  }, [location.search]);

  // ── Navigation ──
  // Derive page from current pathname for Nav highlighting
  const pathname = location.pathname;
  const page = pathname === "/" ? "home"
    : pathname === "/portfolio" ? "portfolio"
    : pathname === "/reviews" ? "reviews"
    : pathname === "/faq" ? "faq"
    : pathname === "/admin" ? "admin"
    : "home";

  const [mobileMenu, setMobileMenu] = useState(false);
  const nav = (p) => {
    navigate(p === "home" ? "/" : "/" + p);
    setPortfolioView("categories");
    setMobileMenu(false);
    window.scrollTo?.(0, 0);
  };
  const navToCategory = (skill) => {
    const norm = (s) => s.toLowerCase().replace(/\s+/g, "");
    const match = cats.find(c => c.id !== "all" && (
      norm(c.label) === norm(skill) || c.id === skill
    ));
    navigate("/portfolio");
    setPortfolioView(match ? { cat: match.id, tab: "photos" } : "categories");
    setMobileMenu(false);
    window.scrollTo?.(0, 0);
  };

  // ── UI state ──
  const [lb, setLb] = useState(null);
  const [lbItems, setLbItems] = useState([]);
  const openLightbox = (item, contextItems) => {
    setLb(item);
    setLbItems(Array.isArray(contextItems) && contextItems.length > 0 ? contextItems : (item ? [item] : []));
  };
  const [portfolioView, setPortfolioView] = useState("categories");
  const [loading, setLoading] = useState(!!supabase);
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Data ──
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [items, setItems] = useState(DEFAULT_WORK);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [subcats, setSubcats] = useState(DEFAULT_SUBCATS);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [fbReviews, setFbReviews] = useState(DEFAULT_FB_REVIEWS);
  const [siteConfig, setSiteConfig] = useState({});
  const [googleReviews, setGoogleReviews] = useState([]);
  const [adminTab, setAdminTab] = useState("categories");
  // returning_customers is retired from the site and the admin, but its rows are
  // still fetched so nothing breaks if the table is repopulated later.
  const [carouselData, setCarouselData] = useState({
    recent_works: [],
    highlights: [],
    returning_customers: [],
    tailor_jobs: [],
    happy_customers: [],
  });

  // ── Effects ──
  // Check admin session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setIsAdmin(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setIsAdmin(!!s));
    return () => subscription.unsubscribe();
  }, []);

  // Admin shortcut: Ctrl+Shift+A navigates to /admin
  useEffect(() => {
    const onKey = (e) => { if (e.ctrlKey && e.shiftKey && e.key === "A") navigate("/admin"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Load Supabase data on mount (each fetch is independent so one failure doesn't block others)
  useEffect(() => {
    if (!supabase) return;
    const safe = (fn) => fn().catch(err => { console.warn('Fetch error:', err.message); return null; });
    (async () => {
      const [dbCats, dbItems, dbFaqs, dbSubcats, dbHighlights, dbFbReviews, dbConfig, dbGoogleReviews,
        dbCarRecentWorks, dbCarHighlights, dbCarReturning, dbCarTailorJobs] = await Promise.all([
        safe(fetchCategories), safe(fetchWorkItems), safe(fetchFaqs),
        safe(fetchSubcategories), safe(fetchHighlights), safe(fetchFbReviews),
        safe(fetchSiteConfig), safe(fetchGoogleReviews),
        safe(() => fetchCarouselItems('recent_works')),
        safe(() => fetchCarouselItems('highlights')),
        safe(() => fetchCarouselItems('returning_customers')),
        safe(() => fetchCarouselItems('tailor_jobs')),
      ]);
      if (dbCats?.length > 0) setCats([{ id: "all", label: "All" }, ...dbCats.map(c => ({ id: c.id, label: c.label, header_image: c.header_image }))]);
      if (dbItems?.length > 0) setItems(dbItems.map(w => ({ id: w.id, type: w.type, cat: w.cat, src: w.src, thumb: w.thumb, title: w.title, desc: w.description, videoId: w.video_id, subcategory_id: w.subcategory_id || null, sort_order: w.sort_order ?? 0 })));
      if (dbFaqs?.length > 0) setFaqs(dbFaqs.map(f => ({
        id: f.id, q: f.question, a: f.answer,
        question_de: f.question_de, answer_de: f.answer_de,
        question_es: f.question_es, answer_es: f.answer_es,
        question_fr: f.question_fr, answer_fr: f.answer_fr,
        question_it: f.question_it, answer_it: f.answer_it,
      })));
      if (dbSubcats?.length > 0) setSubcats(dbSubcats);
      if (dbHighlights?.length > 0) setHighlights(dbHighlights);
      if (dbFbReviews?.length > 0) setFbReviews(dbFbReviews);
      if (dbConfig) setSiteConfig(dbConfig);
      if (dbGoogleReviews?.length > 0) setGoogleReviews(dbGoogleReviews);
      // Carousel curated items
      setCarouselData(prev => ({
        ...prev,
        recent_works: dbCarRecentWorks?.length > 0 ? dbCarRecentWorks.map(normalizeCarouselItem) : [],
        highlights: dbCarHighlights?.length > 0 ? dbCarHighlights.map(normalizeCarouselItem) : [],
        returning_customers: dbCarReturning?.length > 0 ? dbCarReturning.map(normalizeCarouselItem) : [],
        tailor_jobs: dbCarTailorJobs?.length > 0 ? dbCarTailorJobs.map(normalizeCarouselItem) : [],
        // happy_customers NO se pide acá. Tiene tabla propia y todavía no está
        // colocado en ninguna página del sitio, así que pedirlo en las 4 rutas
        // sería un request muerto. Lo carga quien lo necesita: el panel de admin
        // al abrir su sub-tab, y ReviewsPage sólo cuando se mira el preview.
      }));
      setLoading(false);
    })();
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  // ── Home page content ──
  const HomePage = () => (
    <>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTop: "3px solid #D4781F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
        </div>
      )}
      {!loading && (
        <>
          <Hero siteConfig={siteConfig} isAdmin={isAdmin} onConfigUpdate={setSiteConfig}/>
          <StatsBar siteConfig={siteConfig}/>
          <About nav={nav} navToCategory={navToCategory} cats={cats} siteConfig={siteConfig}/>
          <ServiceAreasCTA siteConfig={siteConfig}/>
          {/* Carousel order per client feedback: Recent works → Custom projects →
              orange Customs CTA → Highlights. Returning Customers was retired. */}
          <RecentWork items={items} curatedItems={carouselData.recent_works} setLb={openLightbox} nav={nav} siteConfig={siteConfig}/>
          <TailorJobs items={carouselData.tailor_jobs} setLb={openLightbox} siteConfig={siteConfig}/>
          <TailoringCTA nav={nav} siteConfig={siteConfig}/>
          <Highlights highlights={highlights} curatedItems={carouselData.highlights} setLb={openLightbox} siteConfig={siteConfig}/>
          <BrandStrip/>
          <GoogleReviewsHome nav={nav} googleReviews={googleReviews} fbReviews={fbReviews} siteConfig={siteConfig}/>
          <FAQHome faqs={faqs} nav={nav}/>
          <BottomCTA siteConfig={siteConfig}/>
        </>
      )}
    </>
  );

  // ── Admin page content (not a component — just JSX to avoid remounting) ──
  const adminPageContent = (
    <AdminPanel
      onBack={() => navigate("/")}
      cats={cats} setCats={setCats}
      items={items} setItems={setItems}
      faqs={faqs} setFaqs={setFaqs}
      subcats={subcats} setSubcats={setSubcats}
      highlights={highlights} setHighlights={setHighlights}
      fbReviews={fbReviews} setFbReviews={setFbReviews}
      googleReviews={googleReviews} setGoogleReviews={setGoogleReviews}
      carouselData={carouselData} setCarouselData={setCarouselData}
      siteConfig={siteConfig} setSiteConfig={setSiteConfig}
      adminTab={adminTab} setAdminTab={setAdminTab}
    />
  );

  // ── Main site ──
  return (
    <div style={S.root}><style>{css}</style>
      <img src="/anibal/watermark.png" alt="" aria-hidden="true"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 940, width: "90%", opacity: 0.03, pointerEvents: "none", objectFit: "contain", zIndex: 9999 }}/>
      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>Skip to main content</a>
      {page !== "admin" && <Nav page={page} nav={nav} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} changeLang={changeLang}/>}
      <main id="main-content">
        <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTop: "3px solid #D4781F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/></div>}>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/portfolio" element={
              <Portfolio cats={cats} items={items} subcats={subcats} portfolioView={portfolioView} setPortfolioView={setPortfolioView} setLb={openLightbox}/>
            }/>
            <Route path="/reviews" element={<ReviewsPage googleReviews={googleReviews} fbReviews={fbReviews} happyItems={carouselData.happy_customers} setLb={openLightbox}/>}/>
            <Route path="/faq" element={<FAQPage faqs={faqs}/>}/>
            <Route path="/admin" element={adminPageContent}/>
            <Route path="*" element={<HomePage/>}/>
          </Routes>
        </Suspense>
      </main>
      {page !== "admin" && (
        <>
          <Footer nav={nav} siteConfig={siteConfig}/>
          <StickyBar nav={nav}/>
          {/* Sin FAB flotante de WhatsApp: el cliente lo pidió fuera. El acceso
              a WhatsApp queda en el hero, en la StickyBar al scrollear y en el
              CTA de cierre. */}
          <Lightbox item={lb} items={lbItems} onClose={() => { setLb(null); setLbItems([]); }} onNavigate={setLb}/>
          {/* Panel para que el cliente elija la velocidad de los carruseles
              mirándolos. Se va del todo cuando defina el número. */}
          {tuner && <SpeedTuner/>}
        </>
      )}
    </div>
  );
}
