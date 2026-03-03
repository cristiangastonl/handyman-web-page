import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  S, css,
  DEFAULT_CATS, DEFAULT_WORK, DEFAULT_FAQS, DEFAULT_SUBCATS,
  DEFAULT_HIGHLIGHTS, DEFAULT_FB_REVIEWS,
} from "./lib/constants";
import {
  supabase, fetchCategories, fetchWorkItems, fetchFaqs,
  fetchSubcategories, fetchHighlights, fetchReturningCustomers, fetchFbReviews, fetchSiteConfig,
  fetchGoogleReviews,
} from "./lib/supabase";

// Components
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import ServiceAreas from "./components/ServiceAreas";
import { RecentWork } from "./components/RecentWork";
import Highlights from "./components/Highlights";
import ReturningCustomers from "./components/ReturningCustomers";
import { TailoringCTA, BottomCTA } from "./components/CTA";
import { GoogleReviewsHome, ReviewsPage } from "./components/Reviews";
import { FAQHome, FAQPage } from "./components/FAQ";
import Footer from "./components/Footer";
import Portfolio from "./components/Portfolio";
import Lightbox from "./components/Lightbox";
import StickyBar from "./components/StickyBar";
import WhatsAppFAB from "./components/WhatsAppFAB";
import AdminPanel from "./components/Admin/AdminPanel";

export default function App() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.lang = i18n.language === 'en' ? 'en-CH' : i18n.language;
  }, [i18n.language]);

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
  const [portfolioView, setPortfolioView] = useState("categories");
  const [loading, setLoading] = useState(!!supabase);

  // ── Data ──
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [items, setItems] = useState(DEFAULT_WORK);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [subcats, setSubcats] = useState(DEFAULT_SUBCATS);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [returningCustomers, setReturningCustomers] = useState([]);
  const [fbReviews, setFbReviews] = useState(DEFAULT_FB_REVIEWS);
  const [siteConfig, setSiteConfig] = useState({});
  const [googleReviews, setGoogleReviews] = useState([]);

  // ── Effects ──
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
      const [dbCats, dbItems, dbFaqs, dbSubcats, dbHighlights, dbReturning, dbFbReviews, dbConfig, dbGoogleReviews] = await Promise.all([
        safe(fetchCategories), safe(fetchWorkItems), safe(fetchFaqs),
        safe(fetchSubcategories), safe(fetchHighlights), safe(fetchReturningCustomers), safe(fetchFbReviews),
        safe(fetchSiteConfig), safe(fetchGoogleReviews),
      ]);
      if (dbCats?.length > 0) setCats([{ id: "all", label: "All" }, ...dbCats.map(c => ({ id: c.id, label: c.label, header_image: c.header_image }))]);
      if (dbItems?.length > 0) setItems(dbItems.map(w => ({ id: w.id, type: w.type, cat: w.cat, src: w.src, thumb: w.thumb, title: w.title, desc: w.description, videoId: w.video_id })));
      if (dbFaqs?.length > 0) setFaqs(dbFaqs.map(f => ({
        id: f.id, q: f.question, a: f.answer,
        question_de: f.question_de, answer_de: f.answer_de,
        question_es: f.question_es, answer_es: f.answer_es,
        question_fr: f.question_fr, answer_fr: f.answer_fr,
        question_it: f.question_it, answer_it: f.answer_it,
      })));
      if (dbSubcats?.length > 0) setSubcats(dbSubcats);
      if (dbHighlights?.length > 0) setHighlights(dbHighlights);
      if (dbReturning?.length > 0) setReturningCustomers(dbReturning);
      if (dbFbReviews?.length > 0) setFbReviews(dbFbReviews);
      if (dbConfig) setSiteConfig(dbConfig);
      if (dbGoogleReviews?.length > 0) setGoogleReviews(dbGoogleReviews);
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
          <Hero nav={nav} siteConfig={siteConfig}/>
          <StatsBar/>
          <About nav={nav} navToCategory={navToCategory} siteConfig={siteConfig}/>
          <ServiceAreas/>
          <RecentWork items={items} setLb={setLb} nav={nav}/>
          <Highlights highlights={highlights} setLb={setLb} siteConfig={siteConfig}/>
          <ReturningCustomers returningCustomers={returningCustomers} setLb={setLb}/>
          <TailoringCTA nav={nav}/>
          <GoogleReviewsHome nav={nav} googleReviews={googleReviews} fbReviews={fbReviews}/>
          <FAQHome faqs={faqs} nav={nav}/>
          <BottomCTA/>
        </>
      )}
    </>
  );

  // ── Admin page content ──
  const AdminPage = () => (
    <AdminPanel
      onBack={() => navigate("/")}
      cats={cats} setCats={setCats}
      items={items} setItems={setItems}
      faqs={faqs} setFaqs={setFaqs}
      subcats={subcats} setSubcats={setSubcats}
      highlights={highlights} setHighlights={setHighlights}
      returningCustomers={returningCustomers} setReturningCustomers={setReturningCustomers}
      fbReviews={fbReviews} setFbReviews={setFbReviews}
      googleReviews={googleReviews} setGoogleReviews={setGoogleReviews}
    />
  );

  // ── Main site ──
  return (
    <div style={S.root}><style>{css}</style>
      <img src="/images/logo.jpeg" alt="" aria-hidden="true"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 300, height: 300, opacity: 0.03, pointerEvents: "none", objectFit: "contain", zIndex: 0 }}/>
      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>Skip to main content</a>
      {page !== "admin" && <Nav page={page} nav={nav} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} changeLang={changeLang}/>}
      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/portfolio" element={
            <Portfolio cats={cats} items={items} subcats={subcats} portfolioView={portfolioView} setPortfolioView={setPortfolioView} setLb={setLb}/>
          }/>
          <Route path="/reviews" element={<ReviewsPage googleReviews={googleReviews} fbReviews={fbReviews}/>}/>
          <Route path="/faq" element={<FAQPage faqs={faqs}/>}/>
          <Route path="/admin" element={<AdminPage/>}/>
          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<HomePage/>}/>
        </Routes>
      </main>
      {page !== "admin" && (
        <>
          <Footer/>
          <StickyBar nav={nav}/>
          <Lightbox item={lb} onClose={() => setLb(null)}/>
          <WhatsAppFAB/>
        </>
      )}
    </div>
  );
}
