import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  S, css,
  DEFAULT_CATS, DEFAULT_WORK, DEFAULT_FAQS, DEFAULT_SUBCATS,
  DEFAULT_HIGHLIGHTS, DEFAULT_FB_REVIEWS,
} from "./lib/constants";
import {
  supabase, fetchCategories, fetchWorkItems, fetchFaqs,
  fetchSubcategories, fetchHighlights, fetchFbReviews, fetchSiteConfig,
  fetchGoogleReviews,
} from "./lib/supabase";

// Components
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import ServiceAreas from "./components/ServiceAreas";
import { RecentWork, VideoShowcase } from "./components/RecentWork";
import Highlights from "./components/Highlights";
import { TailoringCTA, BottomCTA } from "./components/CTA";
import { GoogleReviewsHome, FacebookReviewsHome, ReviewsPage } from "./components/Reviews";
import { FAQHome, FAQPage } from "./components/FAQ";
import Footer from "./components/Footer";
import Portfolio from "./components/Portfolio";
import Lightbox from "./components/Lightbox";
import StickyBar from "./components/StickyBar";
import WhatsAppFAB from "./components/WhatsAppFAB";
import AdminPanel from "./components/Admin/AdminPanel";

export default function App() {
  const { i18n } = useTranslation();

  // ── Navigation ──
  const [page, setPageState] = useState(() => {
    const h = window.location.hash.slice(1);
    return ["portfolio","reviews","faq"].includes(h) ? h : "home";
  });
  const [mobileMenu, setMobileMenu] = useState(false);
  const [admin, setAdmin] = useState(() => window.location.hash === "#admin");
  const setPage = (p) => { setPageState(p); window.location.hash = p === "home" ? "" : p; };
  const nav = (p) => { setPage(p); setPortfolioView("categories"); setMobileMenu(false); window.scrollTo?.(0, 0); };

  // ── UI state ──
  const [lb, setLb] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [portfolioView, setPortfolioView] = useState("categories");

  // ── Data ──
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [items, setItems] = useState(DEFAULT_WORK);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [subcats, setSubcats] = useState(DEFAULT_SUBCATS);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [fbReviews, setFbReviews] = useState(DEFAULT_FB_REVIEWS);
  const [siteConfig, setSiteConfig] = useState({});
  const [googleReviews, setGoogleReviews] = useState([]);

  // ── Effects ──
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.ctrlKey && e.shiftKey && e.key === "A") setAdmin(true); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1);
      if (h === "admin") { setAdmin(true); return; }
      setAdmin(false);
      setPageState(["portfolio","reviews","faq"].includes(h) ? h : "home");
      window.scrollTo?.(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Load Supabase data on mount (each fetch is independent so one failure doesn't block others)
  useEffect(() => {
    if (!supabase) return;
    const safe = (fn) => fn().catch(() => null);
    (async () => {
      const [dbCats, dbItems, dbFaqs, dbSubcats, dbHighlights, dbFbReviews, dbConfig, dbGoogleReviews] = await Promise.all([
        safe(fetchCategories), safe(fetchWorkItems), safe(fetchFaqs),
        safe(fetchSubcategories), safe(fetchHighlights), safe(fetchFbReviews),
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
      if (dbFbReviews?.length > 0) setFbReviews(dbFbReviews);
      if (dbConfig) setSiteConfig(dbConfig);
      if (dbGoogleReviews?.length > 0) setGoogleReviews(dbGoogleReviews);
    })();
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  // ── Admin panel ──
  if (admin) return (
    <>
      <style>{css}</style>
      <AdminPanel
        onBack={() => { setAdmin(false); window.location.hash = ""; }}
        cats={cats} setCats={setCats}
        items={items} setItems={setItems}
        faqs={faqs} setFaqs={setFaqs}
        subcats={subcats} setSubcats={setSubcats}
        highlights={highlights} setHighlights={setHighlights}
        fbReviews={fbReviews} setFbReviews={setFbReviews}
        googleReviews={googleReviews} setGoogleReviews={setGoogleReviews}
      />
    </>
  );

  // ── Main site ──
  return (
    <div style={S.root}><style>{css}</style>
      <Nav page={page} nav={nav} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} changeLang={changeLang}/>

      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>Skip to main content</a>
      <main id="main-content">

      {page === "home" && (
        <>
          <Hero scrollY={scrollY} nav={nav} siteConfig={siteConfig}/>
          <StatsBar/>
          <About nav={nav} siteConfig={siteConfig}/>
          <ServiceAreas/>
          <RecentWork items={items} setLb={setLb} nav={nav}/>
          <VideoShowcase items={items} setLb={setLb} nav={nav}/>
          <Highlights highlights={highlights} setLb={setLb} siteConfig={siteConfig}/>
          <TailoringCTA nav={nav}/>
          <GoogleReviewsHome nav={nav} googleReviews={googleReviews}/>
          <FacebookReviewsHome fbReviews={fbReviews}/>
          <FAQHome faqs={faqs} nav={nav}/>
          <BottomCTA/>
        </>
      )}

      {page === "portfolio" && (
        <Portfolio cats={cats} items={items} subcats={subcats} portfolioView={portfolioView} setPortfolioView={setPortfolioView} setLb={setLb}/>
      )}

      {page === "reviews" && <ReviewsPage googleReviews={googleReviews}/>}

      {page === "faq" && <FAQPage faqs={faqs}/>}

      </main>
      <Footer/>
      <StickyBar scrollY={scrollY} nav={nav}/>
      <Lightbox item={lb} onClose={() => setLb(null)}/>
      <WhatsAppFAB/>
    </div>
  );
}
