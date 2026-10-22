import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  S, css,
  DEFAULT_CATS, DEFAULT_WORK, DEFAULT_FAQS, DEFAULT_SUBCATS,
  DEFAULT_HIGHLIGHTS,
} from "./lib/constants";
import {
  supabase, fetchCategories, fetchFaqs,
  fetchSubcategories, fetchHighlights, fetchFbReviews, fetchSiteConfig,
  fetchGoogleReviews, fetchCarouselItems, fetchFirstWorkItems, normalizeWorkItem,
} from "./lib/supabase";
import { FALLBACK_LIMIT } from "./lib/carouselItems";
import { withAllCategory } from "./lib/categories";
import { rutaPortfolio, leerRutaPortfolio } from "./lib/portfolioRutas";

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
import Seo from "./components/Seo";

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

// Los datos con que el prerender armó esta página (scripts/prerender.mjs los deja en
// el HTML). Con ellos la app arranca mostrando lo mismo que ya está en pantalla, en
// vez de cambiar el HTML prerenderizado por un spinner hasta que responda Supabase:
// eso hacía que la página apareciera, desapareciera y volviera en cada visita.
// Igual se piden frescos al montar: lo del HTML es del último deploy y Anibal edita
// desde el admin sin deployar.
const PRE = (() => {
  try {
    const el = typeof document !== "undefined" && document.getElementById("datos-prerender");
    return el ? JSON.parse(el.textContent) : null;
  } catch { return null; }
})();

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
    : pathname === "/portfolio" || pathname.startsWith("/portfolio/") ? "portfolio"
    : pathname === "/reviews" ? "reviews"
    : pathname === "/faq" ? "faq"
    : pathname === "/admin" ? "admin"
    : "home";

  const [mobileMenu, setMobileMenu] = useState(false);
  const nav = (p) => {
    navigate(p === "home" ? "/" : "/" + p);
    setMobileMenu(false);
    window.scrollTo?.(0, 0);
  };
  const navToCategory = (skill) => {
    const norm = (s) => s.toLowerCase().replace(/\s+/g, "");
    const match = cats.find(c => c.id !== "all" && (
      norm(c.label) === norm(skill) || c.id === skill
    ));
    navigate(rutaPortfolio(match ? { cat: match.id } : "categories", cats, subcats));
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
  const [loading, setLoading] = useState(!!supabase && !PRE);

  // ── Data ──
  const [cats, setCats] = useState(PRE?.cats ?? DEFAULT_CATS);
  // work_items enteros: sólo los usa el admin, que los carga al iniciar sesión.
  // Viven acá y no en AdminPanel para sobrevivir a que se desmonte.
  const [items, setItems] = useState(DEFAULT_WORK);
  // Fallback de Recent Work cuando el carrusel no está curado: los primeros 12.
  const [recentFallback, setRecentFallback] = useState(PRE?.recentFallback ?? []);
  const [faqs, setFaqs] = useState(PRE?.faqs ?? DEFAULT_FAQS);
  const [subcats, setSubcats] = useState(PRE?.subcats ?? DEFAULT_SUBCATS);
  const [highlights, setHighlights] = useState(PRE?.highlights ?? DEFAULT_HIGHLIGHTS);
  // Arranca vacío: mostrar reseñas que viven en el código mientras Supabase
  // responde es publicar contenido que no es del cliente, aunque sea un segundo.
  const [fbReviews, setFbReviews] = useState(PRE?.fbReviews ?? []);
  const [siteConfig, setSiteConfig] = useState(PRE?.siteConfig ?? {});
  const [googleReviews, setGoogleReviews] = useState(PRE?.googleReviews ?? []);
  const [adminTab, setAdminTab] = useState("categories");

  // ── Portfolio: el nivel y la foto abierta viven en la URL ──
  // Antes era un useState y la dirección era siempre /portfolio: no había link
  // para mandarle a un cliente, y el "atrás" del celu se iba del sitio (ver
  // src/lib/portfolioRutas.js). Ahora navegar es cambiar la URL.
  const rutaPf = useMemo(
    () => leerRutaPortfolio(location.pathname, location.search, cats, subcats),
    [location.pathname, location.search, cats, subcats],
  );
  const portfolioView = rutaPf.vista;
  const setPortfolioView = (vista) => navigate(rutaPortfolio(vista, cats, subcats));
  const enPortfolio = page === "portfolio";
  const fotoEnUrl = enPortfolio ? rutaPf.foto : null;
  // Abrir una foto del portfolio es ir a su URL; Portfolio la abre cuando están
  // sus fotos. El state marca que se abrió desde la grilla: al cerrar se vuelve
  // atrás. Si se llegó con el link de la foto, cerrar no puede irse del sitio.
  const abrirFoto = (item) =>
    navigate(rutaPortfolio(portfolioView, cats, subcats, item.id), { state: { fotoDesdeGrilla: true } });
  const cerrarLightbox = () => {
    setLb(null);
    setLbItems([]);
    if (!fotoEnUrl) return;
    if (location.state?.fotoDesdeGrilla) navigate(-1);
    else navigate(rutaPortfolio(portfolioView, cats, subcats), { replace: true });
  };
  const navegarLightbox = (item) => {
    setLb(item);
    if (fotoEnUrl && item) {
      navigate(rutaPortfolio(portfolioView, cats, subcats, item.id), { replace: true, state: location.state });
    }
  };
  // El "atrás" del celu con una foto abierta saca ?foto de la URL: el visor se cierra.
  useEffect(() => {
    if (enPortfolio && !fotoEnUrl) { setLb(null); setLbItems([]); }
  }, [enPortfolio, fotoEnUrl]);
  // returning_customers está retirado del sitio y del admin; la clave queda vacía
  // para que nada que la lea se rompa, pero ya no se pide (era un request muerto
  // en cada una de las 4 rutas).
  const [carouselData, setCarouselData] = useState(() => ({
    recent_works: [],
    highlights: [],
    returning_customers: [],
    tailor_jobs: [],
    happy_customers: [],
    ...PRE?.carouselData,
  }));

  // ── Effects ──
  // La sesión de admin la maneja AdminPanel, que es el único que la necesita.
  // App tenía su propio getSession/onAuthStateChange sólo para pintar el botón
  // "Adjust Image" sobre el hero del sitio público; sin ese botón, sobra.

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
      const [dbCats, dbFaqs, dbSubcats, dbFbReviews, dbConfig, dbGoogleReviews,
        dbCarRecentWorks, dbCarHighlights, dbCarTailorJobs] = await Promise.all([
        safe(fetchCategories), safe(fetchFaqs),
        safe(fetchSubcategories), safe(fetchFbReviews),
        safe(fetchSiteConfig), safe(fetchGoogleReviews),
        safe(() => fetchCarouselItems('recent_works')),
        safe(() => fetchCarouselItems('highlights')),
        safe(() => fetchCarouselItems('tailor_jobs')),
      ]);
      // Lo que queda en pantalla, para que el prerender lo guarde en el HTML. Cada
      // valor sólo se pisa si el fetch trajo algo, igual que antes.
      const datos = {};
      if (dbCats?.length > 0) datos.cats = withAllCategory(dbCats);
      if (dbFaqs?.length > 0) datos.faqs = dbFaqs.map(f => ({
        id: f.id, q: f.question, a: f.answer,
      }));
      if (dbSubcats?.length > 0) datos.subcats = dbSubcats;
      if (dbFbReviews?.length > 0) datos.fbReviews = dbFbReviews;
      if (dbConfig) datos.siteConfig = dbConfig;
      if (dbGoogleReviews?.length > 0) datos.googleReviews = dbGoogleReviews;
      // Carousel curated items
      // happy_customers NO se pide acá. Tiene tabla propia y todavía no está
      // colocado en ninguna página del sitio, así que pedirlo en las 4 rutas
      // sería un request muerto. Lo carga quien lo necesita: el panel de admin
      // al abrir su sub-tab, y ReviewsPage sólo cuando se mira el preview.
      datos.carouselData = {
        recent_works: dbCarRecentWorks?.length > 0 ? dbCarRecentWorks.map(normalizeCarouselItem) : [],
        highlights: dbCarHighlights?.length > 0 ? dbCarHighlights.map(normalizeCarouselItem) : [],
        tailor_jobs: dbCarTailorJobs?.length > 0 ? dbCarTailorJobs.map(normalizeCarouselItem) : [],
      };
      // Los dos respaldos van sólo si hacen falta. La tabla legacy de highlights se
      // pedía siempre en las 4 rutas aunque el carrusel estuviera curado; ahora,
      // igual que work_items para Recent Work, sólo si el carrusel está vacío.
      const [dbHighlights, dbFirst] = await Promise.all([
        datos.carouselData.highlights.length ? null : safe(fetchHighlights),
        datos.carouselData.recent_works.length ? null : safe(() => fetchFirstWorkItems(FALLBACK_LIMIT)),
      ]);
      if (dbHighlights?.length > 0) datos.highlights = dbHighlights;
      if (dbFirst?.length > 0) datos.recentFallback = dbFirst.map(normalizeWorkItem);

      if (datos.cats) setCats(datos.cats);
      if (datos.faqs) setFaqs(datos.faqs);
      if (datos.subcats) setSubcats(datos.subcats);
      if (datos.highlights) setHighlights(datos.highlights);
      if (datos.fbReviews) setFbReviews(datos.fbReviews);
      if (datos.siteConfig) setSiteConfig(datos.siteConfig);
      if (datos.googleReviews) setGoogleReviews(datos.googleReviews);
      if (datos.recentFallback) setRecentFallback(datos.recentFallback);
      setCarouselData(prev => ({ ...prev, ...datos.carouselData }));
      // Sólo bajo Puppeteer (el prerender): ahí se lee esto para guardarlo en el HTML.
      if (navigator.webdriver) window.__datosPrerender = datos;
      setLoading(false);
    })();
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  // ── Home page content ──
  // JSX y no un componente, por lo mismo que adminPageContent más abajo: definido
  // como `const HomePage = () => …` adentro de App, cada render de App creaba un
  // tipo de componente nuevo y React desmontaba y volvía a montar la home entera
  // —abrir una foto, el menú del celu, cualquier estado— con los carruseles
  // saltando a otra posición y las animaciones de entrada repitiéndose.
  const homeContent = (
    <>
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTop: "3px solid #D4781F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
        </div>
      )}
      {!loading && (
        <>
          <Hero siteConfig={siteConfig}/>
          <StatsBar siteConfig={siteConfig}/>
          <About nav={nav} navToCategory={navToCategory} cats={cats} siteConfig={siteConfig}/>
          {/* Carousel order per client feedback: Recent works → Custom projects →
              orange Customs CTA → Highlights. Returning Customers was retired.
              Service Areas va entre los dos primeros carruseles (pedido de Anibal,
              10/10/2026): así el primer trabajo aparece apenas después de About. */}
          <RecentWork items={recentFallback} curatedItems={carouselData.recent_works} setLb={openLightbox} siteConfig={siteConfig}/>
          <ServiceAreasCTA siteConfig={siteConfig}/>
          <TailorJobs items={carouselData.tailor_jobs} setLb={openLightbox} siteConfig={siteConfig}/>
          <TailoringCTA nav={nav} siteConfig={siteConfig}/>
          <Highlights highlights={highlights} curatedItems={carouselData.highlights} setLb={openLightbox} siteConfig={siteConfig}/>
          <GoogleReviewsHome nav={nav} googleReviews={googleReviews} fbReviews={fbReviews} happyItems={carouselData.happy_customers} setLb={openLightbox} siteConfig={siteConfig}/>
          <FAQHome faqs={faqs} nav={nav} siteConfig={siteConfig}/>
          <BottomCTA siteConfig={siteConfig}/>
          {/* Las marcas van al cierre, entre el CTA y el footer: es prueba social
              pasiva —no vende sola, blinda la decisión ya tomada— y en el medio
              del sitio partía al bloque de trabajos en dos. Pedido de Anibal. */}
          <BrandStrip/>
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
      <img src="/anibal/watermark.webp" alt="" aria-hidden="true"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", maxWidth: 940, width: "90%", opacity: 0.03, pointerEvents: "none", objectFit: "contain", zIndex: 9999 }}/>
      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>{i18n.t("a11y.skip")}</a>
      {page !== "admin" && <Nav page={page} nav={nav} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} changeLang={changeLang} siteConfig={siteConfig}/>}
      <main id="main-content">
        <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTop: "3px solid #D4781F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/></div>}>
          <Seo/>
          <Routes>
            <Route path="/" element={homeContent}/>
            <Route path="/portfolio/*" element={
              <Portfolio cats={cats} subcats={subcats} portfolioView={portfolioView} setPortfolioView={setPortfolioView}
                setLb={openLightbox} abrirFoto={abrirFoto} fotoId={fotoEnUrl} siteConfig={siteConfig}/>
            }/>
            <Route path="/reviews" element={<ReviewsPage googleReviews={googleReviews} fbReviews={fbReviews} happyItems={carouselData.happy_customers} setLb={openLightbox} siteConfig={siteConfig}/>}/>
            <Route path="/faq" element={<FAQPage faqs={faqs} siteConfig={siteConfig}/>}/>
            <Route path="/admin" element={adminPageContent}/>
            <Route path="*" element={homeContent}/>
          </Routes>
        </Suspense>
      </main>
      {page !== "admin" && (
        <>
          <Footer nav={nav} siteConfig={siteConfig}/>
          {/* Sin FAB flotante de WhatsApp ni barra sticky: el cliente pidió las dos
              fuera. El acceso a WhatsApp queda en el hero y en el CTA de cierre. */}
          <Lightbox item={lb} items={lbItems} onClose={cerrarLightbox} onNavigate={navegarLightbox}/>
        </>
      )}
    </div>
  );
}
