import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client (nullable if not configured) ───
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Supabase helpers ───
async function uploadImage(file, folder) {
  if (!supabase) return null;
  const ext = file.name.split(".").pop();
  const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("images").upload(name, file);
  if (error) throw error;
  const { data } = supabase.storage.from("images").getPublicUrl(name);
  return data.publicUrl;
}

async function fetchCategories() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
async function addCategory(id, label, headerImage) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").insert({ id, label, header_image: headerImage });
  if (error) throw error;
}
async function deleteCategory(id) {
  if (!supabase) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

async function fetchWorkItems() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("work_items").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
async function addWorkItem(item) {
  if (!supabase) return;
  const { data, error } = await supabase.from("work_items").insert(item).select().single();
  if (error) throw error;
  return data;
}
async function deleteWorkItem(id) {
  if (!supabase) return;
  const { error } = await supabase.from("work_items").delete().eq("id", id);
  if (error) throw error;
}

async function fetchFaqs() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
async function addFaqRow(question, answer) {
  if (!supabase) return;
  const { data, error } = await supabase.from("faqs").insert({ question, answer }).select().single();
  if (error) throw error;
  return data;
}
async function updateFaqRow(id, question, answer) {
  if (!supabase) return;
  const { error } = await supabase.from("faqs").update({ question, answer }).eq("id", id);
  if (error) throw error;
}
async function deleteFaqRow(id) {
  if (!supabase) return;
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw error;
}

// ─── Animation hooks ───
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedCounter({ target, duration = 1200, decimals = 1 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const animate = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
          setVal(ease * target);
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toFixed(decimals)}</span>;
}

function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const [ref, visible] = useFadeIn(0.1);
  const offsets = { up: "translateY(24px)", down: "translateY(-24px)", left: "translateX(24px)", right: "translateX(-24px)", none: "none" };
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : offsets[direction],
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>{children}</div>
  );
}

const R = "#C62828";
const PHONE = "+41 76 594 95 81";
const WA_LINK = "https://wa.me/41765949581?text=Hi%2C%20I%20need%20a%20handyman%20in%20Zurich";
const HERO_IMG = "/images/hero_img.jpg";
const PROFILE_IMG = "/images/profile_img.jpg";

const DEFAULT_CATS = [
  { id: "all", label: "All" },
  { id: "electricity", label: "Electricity" },
  { id: "plumbing", label: "Plumbing" },
  { id: "assembly", label: "Furniture Assembly" },
  { id: "mounting", label: "Wall Mounting" },
  { id: "fixings", label: "Fixings" },
  { id: "gardening", label: "Gardening" },
];

const REAL_0 = "/images/real_0.jpg";
const REAL_1 = "/images/real_1.jpg";
const REAL_2 = "/images/real_2.jpg";
const REAL_3 = "/images/real_3.jpg";
const REAL_4 = "/images/real_4.jpg";

const DEFAULT_WORK = [
  { id: 1, type: "image", cat: "electricity", src: REAL_0, title: "LED Ceiling Light", desc: "Bedroom LED installation with ambient blue backlight" },
  { id: 2, type: "image", cat: "electricity", src: REAL_1, title: "Dining Pendant", desc: "Modern ring pendant light over dining table" },
  { id: 3, type: "image", cat: "electricity", src: REAL_2, title: "Living Room Light", desc: "Decorative pendant installation in cozy living room" },
  { id: 4, type: "image", cat: "electricity", src: REAL_3, title: "Kitchen Ceiling", desc: "Flush mount LED light in modern kitchen" },
  { id: 5, type: "image", cat: "electricity", src: REAL_4, title: "Dining Setup", desc: "Warm pendant lighting for open dining area" },
  { id: 6, type: "image", cat: "fixings", src: "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=500&fit=crop", title: "Parquet flooring", desc: "Hardwood installation" },
  { id: 7, type: "image", cat: "plumbing", src: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=500&fit=crop", title: "Faucet upgrade", desc: "Grohe fixtures installation" },
  { id: 8, type: "image", cat: "mounting", src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=500&fit=crop", title: "Floating shelves", desc: "Wall-mounted shelving" },
  { id: 9, type: "image", cat: "plumbing", src: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&h=500&fit=crop", title: "Walk-in shower", desc: "Glass enclosure install" },
  { id: 10, type: "image", cat: "mounting", src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=500&fit=crop", title: "TV wall mount", desc: "Samsung 65\" with cable management" },
  { id: 11, type: "image", cat: "gardening", src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&h=500&fit=crop", title: "Garden maintenance", desc: "Seasonal care and planting" },
  { id: 12, type: "image", cat: "electricity", src: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&h=500&fit=crop", title: "Panel upgrade", desc: "Full electrical rewiring" },
  { id: 13, type: "video", cat: "electricity", videoId: "Xbm5PzihEYw", title: "IKEA Stylish Light Unboxing", desc: "First impressions of a stylish IKEA light fixture" },
  { id: 14, type: "video", cat: "electricity", videoId: "iwQxh1fkeCc", title: "RANARP IKEA Pendant Lamp", desc: "Choosing the right fixture for your dinner room" },
  { id: 15, type: "video", cat: "electricity", videoId: "rs6nN7732y4", title: "IKEA SINNERLIG Light Installation", desc: "Professional light installation for living rooms" },
];

const DEFAULT_FAQS = [
  { q: "What areas do you cover?", a: "I serve the entire Zurich region including Winterthur, Baden, Uster, and surrounding areas." },
  { q: "How quickly can you schedule?", a: "Typically within 24–48 hours. Same-day emergency service available." },
  { q: "Do you provide free estimates?", a: "Yes, all estimates are free and non-binding. Send photos of your project via WhatsApp for a quick quote." },
  { q: "Are you insured?", a: "Fully insured with all necessary permits for professional work in Switzerland." },
  { q: "What payment methods?", a: "Bank transfer, TWINT, credit cards, and cash. Payment after completion." },
  { q: "Guarantee on work?", a: "Every job comes with a 2-year workmanship guarantee." },
];

const REVIEWS = [
  { name: "Anna M.", r: 5, text: "Outstanding service! Our bathroom looks brand new. Very professional and punctual. Will definitely call again for future projects.", time: "2 weeks ago" },
  { name: "Thomas K.", r: 5, text: "Assembled our entire IKEA kitchen in one day. Perfect work. Highly recommended!", time: "1 month ago" },
  { name: "Sarah L.", r: 4, text: "Quick response and great electrical work. Fair prices for the Zurich area. Very clean and tidy.", time: "1 month ago" },
  { name: "Marco R.", r: 5, text: "Third time hiring — always top quality. Best handyman in Zurich! Friendly, on time, and does excellent work.", time: "2 months ago" },
  { name: "Lisa W.", r: 5, text: "Our new parquet floor is beautiful. Impressive attention to detail and very reasonable pricing.", time: "3 months ago" },
  { name: "Peter H.", r: 5, text: "Reliable and honest. Fixed multiple things in one visit. Great value for money.", time: "3 months ago" },
  { name: "Julia B.", r: 5, text: "Mounted our TV and installed floating shelves perfectly. Very careful with the walls. Cleaned everything after. Top!", time: "4 months ago" },
  { name: "Daniel F.", r: 5, text: "Emergency plumbing fix on a Saturday. Arrived within 2 hours. Lifesaver! Fair price even for weekend work.", time: "4 months ago" },
  { name: "Nina S.", r: 4, text: "Painted our entire apartment in 3 days. Neat work, protected all furniture. Good communication throughout.", time: "5 months ago" },
  { name: "Robert M.", r: 5, text: "Built custom shelving in our office. Measured everything perfectly, looks like it was always there. Highly professional.", time: "5 months ago" },
  { name: "Elena K.", r: 5, text: "Garden maintenance and new lighting installation. Transformed our outdoor space completely. So happy with the result!", time: "6 months ago" },
  { name: "Stefan W.", r: 5, text: "Fixed a leaking faucet and installed a new bathroom mirror. Quick, efficient, and very friendly. Recommended to all my neighbors.", time: "6 months ago" },
];

const Stars = ({ n, sz = 12 }) => (
  <span style={{ fontSize: sz, letterSpacing: 1 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? "#F59E0B" : "#ddd" }}>★</span>)}
  </span>
);

const svgP = {
  fb: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  yt: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  ig: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  wa: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
};
const socialUrls = {
  fb: "https://www.facebook.com/HandymanServicesinZurich",
  yt: "https://www.youtube.com/@HandymanServicesinZurich",
  ig: "#", wa: WA_LINK,
};

const Socials = ({ sz = 14, color = "#999" }) => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
    {Object.entries(svgP).map(([k, path]) => (
      <a key={k} href={socialUrls[k]} target="_blank" rel="noopener noreferrer"
        style={{ color, opacity: 0.5, transition: "opacity .2s", display: "flex" }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
        <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor"><path d={path}/></svg>
      </a>
    ))}
  </div>
);

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <svg width="36" height="36" viewBox="0 0 120 120" fill="none">
      <path d="M5 55L60 12L115 55" stroke="#222" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 50V95H98V50" stroke="#222" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="85" y="22" width="8" height="22" fill="#222" rx="1"/>
      <path d="M32 82C32 82 46 72 60 72C74 72 88 82 88 82" stroke="#222" strokeWidth="3" fill="none"/>
      <path d="M60 80C60 80 38 58 38 45C38 32.85 47.85 23 60 23C72.15 23 82 32.85 82 45C82 58 60 80 60 80Z" fill={R}/>
      <path d="M60 78C60 78 39.5 57 39.5 45C39.5 33.7 48.7 24.5 60 24.5C71.3 24.5 80.5 33.7 80.5 45C80.5 57 60 78 60 78Z" fill="url(#pg)"/>
      <rect x="55" y="33" width="10" height="24" rx="2" fill="#fff"/>
      <rect x="48" y="40" width="24" height="10" rx="2" fill="#fff"/>
      <ellipse cx="52" cy="37" rx="5" ry="6" fill="rgba(255,255,255,0.3)"/>
      <defs><radialGradient id="pg" cx="45%" cy="35%" r="60%"><stop offset="0%" stopColor="#EF5350"/><stop offset="100%" stopColor="#B71C1C"/></radialGradient></defs>
    </svg>
    <div style={{ lineHeight: 1.1 }}>
      <span style={{ fontWeight: 800, fontSize: 14, color: R }}>HANDY</span>
      <span style={{ fontWeight: 800, fontSize: 14, color: "#555" }}>MAN</span>
      <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 11, fontWeight: 500, color: "#666", marginTop: 1 }}>Services in Zürich</div>
    </div>
  </div>
);

function Carousel({ items, onClickItem }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div style={{ position: "relative" }}>
      <div ref={ref} className="hs" style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
        {items.map(item => (
          <div key={item.id} onClick={() => onClickItem(item)}
            style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, borderRadius: 10, overflow: "hidden", cursor: "pointer", scrollSnapAlign: "start", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(198,40,40,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ position: "relative", paddingTop: "62%" }}>
              <img src={item.type === "video" ? ytThumb(item) : item.src} alt={item.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>
              {item.type === "video" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill={R}><path d="M6 4l10 6-10 6V4z"/></svg>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "9px 12px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
              {item.desc && <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{item.desc}</div>}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} style={ab("left")}>‹</button>
      <button onClick={() => scroll(1)} style={ab("right")}>›</button>
    </div>
  );
}
const ab = (s) => ({
  position: "absolute", top: "33%", [s]: -4, width: 38, height: 38, borderRadius: "50%",
  background: "#fff", border: "1px solid #e5e5e5", cursor: "pointer", fontSize: 16, color: "#555",
  display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", zIndex: 2,
});

const ytThumb = (item) => item.thumb || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg` : "");

// Google logo SVG for reviews
const GoogleG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function App() {
  const [page, setPageState] = useState(() => { const h = window.location.hash.slice(1); return ["portfolio","reviews","faq"].includes(h) ? h : "home"; });
  const [lb, setLb] = useState(null);
  const [cat, setCat] = useState("all");
  const [mt, setMt] = useState("all");
  const [fq, setFq] = useState(null);
  const [admin, setAdmin] = useState(() => window.location.hash === "#admin");
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [items, setItems] = useState(DEFAULT_WORK);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Admin state
  const [session, setSession] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [adminTab, setAdminTab] = useState("categories");
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

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

  const avg = (REVIEWS.reduce((a, r) => a + r.r, 0) / REVIEWS.length).toFixed(1);
  const filtered = items.filter(w => (cat === "all" || w.cat === cat) && (mt === "all" || w.type === mt));
  const setPage = (p) => { setPageState(p); window.location.hash = p === "home" ? "" : p; };
  const nav = (p) => { setPage(p); setCat("all"); setMt("all"); setMobileMenu(false); window.scrollTo?.(0, 0); };
  const revRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
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

  // Load Supabase data on mount
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        const [dbCats, dbItems, dbFaqs] = await Promise.all([fetchCategories(), fetchWorkItems(), fetchFaqs()]);
        if (dbCats && dbCats.length > 0) {
          setCats([{ id: "all", label: "All" }, ...dbCats.map(c => ({ id: c.id, label: c.label, header_image: c.header_image }))]);
        }
        if (dbItems && dbItems.length > 0) {
          setItems(dbItems.map(w => ({
            id: w.id, type: w.type, cat: w.cat, src: w.src, thumb: w.thumb,
            title: w.title, desc: w.description, videoId: w.video_id,
          })));
        }
        if (dbFaqs && dbFaqs.length > 0) {
          setFaqs(dbFaqs.map(f => ({ id: f.id, q: f.question, a: f.answer })));
        }
      } catch (err) {
        console.warn("Supabase load failed, using defaults:", err.message);
      }
    })();
  }, []);

  // Check existing session on mount
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) setSession(s);
    });
  }, []);

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

  const flash = (msg) => { setAdminMsg(msg); setTimeout(() => setAdminMsg(""), 2500); };

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
      setNcLabel("");
      setNcFile(null);
      flash("Category added");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setAdminLoading(true);
    try {
      await deleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
      setItems(prev => prev.filter(w => w.cat !== id));
      flash("Category deleted");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ── Work item CRUD ──
  const handleAddWorkItem = async () => {
    if (!wiTitle.trim() || !wiCat) return;
    setAdminLoading(true);
    try {
      let src = null, thumb = null;
      if (wiType === "image" && wiFile) {
        src = await uploadImage(wiFile, "work");
      }
      if (wiType === "video" && wiThumbFile) {
        thumb = await uploadImage(wiThumbFile, "work");
      }
      const row = {
        type: wiType, cat: wiCat, title: wiTitle.trim(),
        description: wiDesc.trim() || null,
        src, thumb,
        video_id: wiType === "video" ? wiVideoId.trim() || null : null,
      };
      const saved = await addWorkItem(row);
      setItems(prev => [...prev, {
        id: saved.id, type: saved.type, cat: saved.cat, src: saved.src,
        thumb: saved.thumb, title: saved.title, desc: saved.description, videoId: saved.video_id,
      }]);
      setWiTitle(""); setWiDesc(""); setWiFile(null); setWiVideoId(""); setWiThumbFile(null);
      flash("Work item added");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteWorkItem = async (id) => {
    setAdminLoading(true);
    try {
      await deleteWorkItem(id);
      setItems(prev => prev.filter(w => w.id !== id));
      flash("Item deleted");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ── FAQ CRUD ──
  const handleAddFaq = async () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setAdminLoading(true);
    try {
      const saved = await addFaqRow(faqQ.trim(), faqA.trim());
      setFaqs(prev => [...prev, { id: saved.id, q: saved.question, a: saved.answer }]);
      setFaqQ(""); setFaqA("");
      flash("FAQ added");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpdateFaq = async (id) => {
    if (!editFaqQ.trim() || !editFaqA.trim()) return;
    setAdminLoading(true);
    try {
      await updateFaqRow(id, editFaqQ.trim(), editFaqA.trim());
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, q: editFaqQ.trim(), a: editFaqA.trim() } : f));
      setEditingFaq(null);
      flash("FAQ updated");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    setAdminLoading(true);
    try {
      await deleteFaqRow(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      flash("FAQ deleted");
    } catch (err) {
      flash("Error: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ── Admin panel ──
  if (admin) return (
    <div style={S.root}><style>{css}</style>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Admin Panel</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {session && <button onClick={handleLogout} style={{ ...S.ghost, color: R, borderColor: "#fdd" }}>Logout</button>}
            <button onClick={() => { setAdmin(false); window.location.hash = ""; }} style={S.ghost}>← Back</button>
          </div>
        </div>

        {/* Not configured warning */}
        {!supabase && (
          <div style={{ padding: "14px 16px", background: "#FFF3E0", borderRadius: 8, marginBottom: 20, fontSize: 12, color: "#E65100", lineHeight: 1.5 }}>
            Supabase not configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> to enable persistence.
          </div>
        )}

        {/* Login gate */}
        {supabase && !session ? (
          <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: "60px auto" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Admin Login</h3>
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" required
              style={S.input}/>
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" required
              style={{ ...S.input, marginTop: 8 }}/>
            {loginErr && <div style={{ color: R, fontSize: 11, marginTop: 6 }}>{loginErr}</div>}
            <button type="submit" disabled={loginLoading}
              style={{ ...S.btnPrimary, marginTop: 12, width: "100%", opacity: loginLoading ? 0.6 : 1 }}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <>
            {/* Status flash */}
            {adminMsg && (
              <div style={{ padding: "8px 14px", background: adminMsg.startsWith("Error") ? "#FFEBEE" : "#E8F5E9", borderRadius: 6, marginBottom: 14, fontSize: 12, color: adminMsg.startsWith("Error") ? R : "#2E7D32" }}>
                {adminMsg}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #f0f0f0" }}>
              {[["categories","Categories"],["work","Work"],["faqs","FAQs"]].map(([k, l]) => (
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
                  <input value={ncLabel} onChange={e => setNcLabel(e.target.value)} placeholder="Category name"
                    style={S.input}/>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 11, color: "#888" }}>Header image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => setNcFile(e.target.files[0] || null)}
                      style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
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

                {/* Add form */}
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
                  <select value={wiCat} onChange={e => setWiCat(e.target.value)}
                    style={{ ...S.input, marginBottom: 8, color: wiCat ? "#222" : "#aaa" }}>
                    <option value="" disabled>Select category...</option>
                    {cats.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input value={wiTitle} onChange={e => setWiTitle(e.target.value)} placeholder="Title"
                    style={{ ...S.input, marginBottom: 8 }}/>
                  <input value={wiDesc} onChange={e => setWiDesc(e.target.value)} placeholder="Description (optional)"
                    style={{ ...S.input, marginBottom: 8 }}/>
                  {wiType === "image" && (
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: "#888" }}>Image file</label>
                      <input type="file" accept="image/*" onChange={e => setWiFile(e.target.files[0] || null)}
                        style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                    </div>
                  )}
                  {wiType === "video" && (
                    <>
                      <input value={wiVideoId} onChange={e => setWiVideoId(e.target.value)} placeholder="YouTube video ID"
                        style={{ ...S.input, marginBottom: 8 }}/>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: "#888" }}>Thumbnail image <span style={{ color: "#bbb" }}>(optional — uses YouTube thumbnail if empty)</span></label>
                        <input type="file" accept="image/*" onChange={e => setWiThumbFile(e.target.files[0] || null)}
                          style={{ display: "block", marginTop: 4, fontSize: 11 }}/>
                      </div>
                    </>
                  )}
                  <button onClick={handleAddWorkItem} disabled={adminLoading || !wiTitle.trim() || !wiCat}
                    style={{ ...S.btnPrimary, opacity: (adminLoading || !wiTitle.trim() || !wiCat) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add Item"}
                  </button>
                </div>

                {/* Items list */}
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

                {/* Add form */}
                <div style={{ padding: "16px", background: "#fafafa", borderRadius: 10, border: "1px solid #f0f0f0", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Add FAQ</p>
                  <input value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="Question"
                    style={{ ...S.input, marginBottom: 8 }}/>
                  <textarea value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="Answer" rows={3}
                    style={{ ...S.input, resize: "vertical", fontFamily: "inherit" }}/>
                  <button onClick={handleAddFaq} disabled={adminLoading || !faqQ.trim() || !faqA.trim()}
                    style={{ ...S.btnPrimary, marginTop: 10, opacity: (adminLoading || !faqQ.trim() || !faqA.trim()) ? 0.5 : 1 }}>
                    {adminLoading ? "Adding..." : "Add FAQ"}
                  </button>
                </div>

                {/* FAQ list */}
                {faqs.map(f => (
                  <div key={f.id || f.q} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                    {editingFaq === (f.id || f.q) ? (
                      <div>
                        <input value={editFaqQ} onChange={e => setEditFaqQ(e.target.value)}
                          style={{ ...S.input, marginBottom: 6, fontWeight: 600 }}/>
                        <textarea value={editFaqA} onChange={e => setEditFaqA(e.target.value)} rows={3}
                          style={{ ...S.input, resize: "vertical", fontFamily: "inherit" }}/>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button onClick={() => handleUpdateFaq(f.id)} disabled={adminLoading}
                            style={{ ...S.btnPrimary, padding: "5px 14px", fontSize: 11 }}>Save</button>
                          <button onClick={() => setEditingFaq(null)} style={S.ghost}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{f.q}</div>
                        <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 6 }}>{f.a}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {f.id && (
                            <button onClick={() => { setEditingFaq(f.id); setEditFaqQ(f.q); setEditFaqA(f.a); }}
                              style={{ ...S.ghost, fontSize: 10, padding: "2px 8px" }}>Edit</button>
                          )}
                          {f.id && (
                            <button onClick={() => handleDeleteFaq(f.id)} disabled={adminLoading}
                              style={{ ...S.ghost, color: R, borderColor: "#fdd", fontSize: 10, padding: "2px 8px" }}>Delete</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={S.root}><style>{css}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navIn}>
          <button onClick={() => nav("home")} style={{ background: "none", border: "none", cursor: "pointer" }}><Logo/></button>
          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {["home","portfolio","reviews","faq"].map(p => (
              <button key={p} onClick={() => nav(p)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "5px 10px", fontSize: 13, fontWeight: page === p ? 600 : 400, color: page === p ? R : "#aaa" }}>
                {p === "home" ? "Home" : p === "portfolio" ? "Portfolio" : p === "reviews" ? "Reviews" : "FAQ"}
              </button>
            ))}
            <div style={{ width: 1, height: 14, background: "#e5e5e5", margin: "0 6px" }}/>
            <Socials sz={13}/>
          </div>
          {/* Mobile hamburger */}
          <button className="mobile-hamburger" onClick={() => setMobileMenu(!mobileMenu)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, fontSize: 22, lineHeight: 1, display: "none" }}
            aria-label="Toggle menu">
            {mobileMenu ? "×" : "☰"}
          </button>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="mobile-menu" style={{ padding: "8px 24px 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 4 }}>
            {["home","portfolio","reviews","faq"].map(p => (
              <button key={p} onClick={() => nav(p)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 0", fontSize: 15, fontWeight: page === p ? 600 : 400, color: page === p ? R : "#666", textAlign: "left" }}>
                {p === "home" ? "Home" : p === "portfolio" ? "Portfolio" : p === "reviews" ? "Reviews" : "FAQ"}
              </button>
            ))}
            <div style={{ paddingTop: 8 }}><Socials sz={16}/></div>
          </div>
        )}
      </nav>
      <a href="#main-content" style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>Skip to main content</a>
      <main id="main-content">

      {/* ===== HOME ===== */}
      {page === "home" && (
        <>
          {/* Hero */}
          <section style={{ position: "relative", height: "70vh", minHeight: 400, maxHeight: 600, overflow: "hidden" }}>
            <img src={HERO_IMG} alt="Professional handyman services in Zurich - home repair and maintenance" style={{ width: "100%", height: "120%", objectFit: "cover", transform: `translateY(${scrollY * -0.15}px)`, willChange: "transform" }}/>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.6) 100%)" }}/>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 44px" }}>
              <div className="heroContent" style={{ maxWidth: 900, margin: "0 auto" }}>
                <h1 style={{ fontSize: "clamp(26px, 4.5vw, 42px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.5)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Professional Handyman<br/>Services in Zurich
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>
                  Your satisfaction, my commitment · Zurich region
                </p>
                <div style={{ marginBottom: 20 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
                    WhatsApp me
                  </a>
                  <button onClick={() => nav("portfolio")} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                    See my work
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <FadeIn>
          <section style={{ padding: "32px 24px 0", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
              {[
                { val: 5, label: "Years Experience", suffix: "+" },
                { val: 200, label: "Projects Completed", suffix: "+", decimals: 0 },
                { val: 4.8, label: "Google Rating", suffix: "/5" },
                { val: 2, label: "Hour Response", suffix: "h", prefix: "<" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: R }}>
                    {s.prefix || ""}<AnimatedCounter target={s.val} decimals={s.decimals ?? 1}/>{s.suffix}
                  </div>
                  <div style={{ fontSize: 11, color: "#777", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
          </FadeIn>

          {/* About / Meet section */}
          <FadeIn>
          <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
              <img src={PROFILE_IMG} alt="Professional handyman in Zurich - specialist for home repairs" style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Meet your handyman</h2>
                <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>
                  Specialist technician with years of experience in domestic matters across the Zurich region.
                  From furniture assembly to electrical work, plumbing to wall mounting — I treat every home like my own.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Electricity","Plumbing","Assembly","Fixings","Gardening","Wall Mounting"].map(s => (
                    <span key={s} style={{ padding: "5px 12px", borderRadius: 16, border: "1px solid #eee", fontSize: 12, color: "#777", fontWeight: 500 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
          </FadeIn>

          {/* Recent work */}
          <FadeIn delay={0.1}>
          <section style={{ padding: "8px 24px 40px", maxWidth: 940, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent work</h2>
              <button onClick={() => nav("portfolio")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>View all →</button>
            </div>
            <Carousel items={items.slice(0, 6)} onClickItem={setLb}/>
          </section>
          </FadeIn>

          {/* Video showcase */}
          {items.filter(w => w.type === "video").length > 0 && (
          <FadeIn delay={0.15}>
          <section style={{ padding: "0 24px 40px", maxWidth: 940, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill={R} style={{ verticalAlign: "-3px", marginRight: 6 }}><path d="M6 4l10 6-10 6V4z"/></svg>
                Videos
              </h2>
              <button onClick={() => { nav("portfolio"); setMt("video"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>View all →</button>
            </div>
            <Carousel items={items.filter(w => w.type === "video")} onClickItem={setLb}/>
          </section>
          </FadeIn>
          )}

          {/* Reviews — Visual Google Section */}
          <FadeIn>
          <section style={{ padding: "40px 24px 48px", background: "#fafafa" }}>
            <div style={{ maxWidth: 940, margin: "0 auto" }}>
              {/* Google rating header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <GoogleG/>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>Google Reviews</span>
                  </div>
                  <div style={{ width: 1, height: 24, background: "#e0e0e0" }}/>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1400}/></span>
                    <div>
                      <Stars n={Math.round(parseFloat(avg))} sz={15}/>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{REVIEWS.length} reviews</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => nav("reviews")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: R, fontWeight: 600 }}>See all reviews →</button>
              </div>

              {/* Reviews carousel */}
              <div style={{ position: "relative" }}>
                <div ref={revRef} className="hs" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 4 }}>
                  {REVIEWS.slice(0, 8).map((rev, i) => (
                    <div key={i} style={{ minWidth: 300, maxWidth: 320, flexShrink: 0, scrollSnapAlign: "start", padding: "20px", borderRadius: 12, background: "#fff", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff" }}>{rev.name[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                          <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
                        </div>
                        <GoogleG/>
                      </div>
                      <Stars n={rev.r} sz={14}/>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.55, margin: "8px 0 0", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{rev.text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => revRef.current?.scrollBy({ left: -340, behavior: "smooth" })} style={ab("left")}>&#8249;</button>
                <button onClick={() => revRef.current?.scrollBy({ left: 340, behavior: "smooth" })} style={ab("right")}>&#8250;</button>
              </div>
            </div>
          </section>
          </FadeIn>

          {/* Quick FAQs */}
          <FadeIn>
          <section style={{ padding: "16px 24px 32px", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#777", marginBottom: 12, textAlign: "center" }}>Common questions</div>
            {faqs.slice(0, 3).map((f, i) => (
              <div key={f.id || i} style={{ borderBottom: "1px solid #f0f0f0", padding: "12px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.q}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{f.a}</div>
              </div>
            ))}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={() => nav("faq")} style={{ background: "none", border: "none", color: R, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>View all FAQs</button>
            </div>
          </section>
          </FadeIn>

          {/* CTA */}
          <FadeIn delay={0.1}>
          <section style={{ padding: "8px 24px 48px", textAlign: "center" }}>
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 32px", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", borderRadius: 16, color: "#fff" }}>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Ready to get started?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Same-day estimates · Reply within 2 hours · Quality guaranteed</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Send me photos of your project and get a free quote instantly</p>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "#fff", padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
                WhatsApp me now
              </a>
            </div>
          </section>
          </FadeIn>
        </>
      )}

      {/* ===== PORTFOLIO ===== */}
      {page === "portfolio" && (
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Portfolio</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {cats.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  style={{ padding: "5px 13px", borderRadius: 16, border: "none", fontSize: 12, cursor: "pointer", fontWeight: cat === c.id ? 600 : 400, background: cat === c.id ? "#222" : "#f5f5f5", color: cat === c.id ? "#fff" : "#888" }}>
                  {c.label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {[["all","All"],["image","Photos"],["video","Videos"]].map(([k,l]) => (
                <button key={k} onClick={() => setMt(k)}
                  style={{ padding: "4px 10px", border: "none", borderRadius: 5, fontSize: 11, cursor: "pointer", fontWeight: mt === k ? 600 : 400, background: mt === k ? "#eee" : "transparent", color: mt === k ? "#222" : "#ccc" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
            {filtered.map(item => (
              <div key={item.id} onClick={() => setLb(item)}
                style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid #eee", background: "#fff", transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(198,40,40,0.1), 0 4px 12px rgba(0,0,0,0.06)"; }}
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
                  <div style={{ fontSize: 11, color: "#777", marginTop: 1 }}>{cats.find(c => c.id === item.cat)?.label}</div>
                </div>
              </div>
            ))}
          </div>
          {!filtered.length && <p style={{ textAlign: "center", padding: 60, color: "#ccc", fontSize: 13 }}>No items found.</p>}
        </div>
      )}

      {/* ===== REVIEWS ===== */}
      {page === "reviews" && (
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 80px" }}>
          {/* Big Google header */}
          <div style={{ textAlign: "center", padding: "24px 0 36px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Google Reviews</span>
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}><AnimatedCounter target={parseFloat(avg)} duration={1600}/></div>
            <div style={{ margin: "8px 0 6px" }}><Stars n={Math.round(parseFloat(avg))} sz={22}/></div>
            <div style={{ fontSize: 14, color: "#aaa" }}>Based on {REVIEWS.length} reviews</div>

            {/* Rating distribution bars */}
            <div style={{ maxWidth: 280, margin: "20px auto 0" }}>
              {[5,4,3,2,1].map(star => {
                const count = REVIEWS.filter(r => r.r === star).length;
                const pct = REVIEWS.length ? (count / REVIEWS.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#666", width: 12, textAlign: "right" }}>{star}</span>
                    <span style={{ fontSize: 11, color: "#F59E0B" }}>★</span>
                    <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }}/>
                    </div>
                    <span style={{ fontSize: 11, color: "#ccc", width: 20 }}>{count}</span>
                  </div>
                );
              })}
            </div>

            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 20, padding: "8px 20px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#555", textDecoration: "none" }}>
              Leave a review on Google
            </a>
          </div>

          {/* All reviews grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {REVIEWS.map((rev, i) => (
              <div key={i} style={{ padding: "20px", borderRadius: 12, border: "1px solid #eee", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `hsl(${i * 47}, 45%, 65%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff" }}>{rev.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{rev.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>{rev.time}</div>
                  </div>
                  <GoogleG/>
                </div>
                <Stars n={rev.r} sz={14}/>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: "8px 0 0" }}>{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== FAQ ===== */}
      {page === "faq" && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 80px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>FAQ</h2>
          {faqs.map((f, i) => (
            <div key={f.id || i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <button onClick={() => setFq(fq === i ? null : i)}
                style={{ width: "100%", textAlign: "left", padding: "14px 0", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 500, color: "#222" }}>
                {f.q}
                <span style={{ color: "#ccc", fontSize: 16, transform: fq === i ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
              </button>
              {fq === i && <p style={{ padding: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6, margin: 0 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      </main>
      <footer style={{ borderTop: "1px solid #f0f0f0", padding: "28px 24px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 16, color: "#ccc", marginBottom: 10 }}>Why not follow, subscribe or message me?</div>
          <div style={{ display: "flex", justifyContent: "center" }}><Socials sz={15} color="#bbb"/></div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "#ccc" }}>© {new Date().getFullYear()} Handyman Services in Zurich</span>
          </div>
          <div style={{ fontSize: 10, color: "#ddd", marginTop: 6 }}>Designed & developed by <span style={{ fontWeight: 600, color: "#bbb" }}>Zipper</span></div>
        </div>
      </footer>

      {/* Sticky contact bar — appears after scrolling past hero */}
      <div style={{
        position: "fixed", top: 52, left: 0, right: 0, zIndex: 99,
        background: "rgba(26,26,26,0.95)", backdropFilter: "blur(10px)",
        transform: scrollY > 500 ? "translateY(0)" : "translateY(-100%)",
        opacity: scrollY > 500 ? 1 : 0,
        transition: "transform 0.35s ease, opacity 0.35s ease",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ maxWidth: 940, margin: "0 auto", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Your satisfaction, my commitment</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
              WhatsApp me
            </a>
            <button onClick={() => nav("portfolio")}
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              See my work
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lb && (
        <div onClick={() => setLb(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", maxWidth: 660, width: "100%", maxHeight: "90vh" }}>
            {lb.type === "video" ? (
              <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                <iframe src={`https://www.youtube.com/embed/${lb.videoId}?autoplay=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen/>
              </div>
            ) : (
              <img src={lb.src} alt={lb.title || "Handyman project in Zurich"} style={{ width: "100%", display: "block" }}/>
            )}
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{lb.title}</div>
              {lb.desc && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{lb.desc}</div>}
            </div>
          </div>
          <button onClick={() => setLb(null)} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Floating WhatsApp FAB */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 900,
          width: 56, height: 56, borderRadius: "50%",
          background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(37,211,102,0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,0.4)"; }}
        aria-label="Contact via WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d={svgP.wa}/></svg>
      </a>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Dancing+Script:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .hs::-webkit-scrollbar { display: none; }
  .hs { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes heroFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
  .heroContent { animation: heroFadeUp 0.8s ease 0.2s both; }
  .heroContent h1 { animation: heroFadeUp 0.8s ease 0.3s both; }
  .heroContent p { animation: heroFadeUp 0.8s ease 0.45s both; }
  .heroContent > div:last-child { animation: heroFadeUp 0.8s ease 0.6s both; }
  @media (max-width: 640px) {
    .desktop-nav { display: none !important; }
    .mobile-hamburger { display: block !important; }
  }
  @media (min-width: 641px) {
    .mobile-menu { display: none !important; }
  }
`;

const S = {
  root: { fontFamily: "'DM Sans', -apple-system, sans-serif", background: "#fff", minHeight: "100vh", color: "#1a1a1a" },
  nav: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 100 },
  navIn: { maxWidth: 940, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", justifyContent: "space-between", alignItems: "center" },
  ghost: { background: "none", border: "1px solid #e5e5e5", padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "#666" },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#777", marginBottom: 10 },
  input: { width: "100%", padding: "8px 11px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 13, outline: "none", display: "block" },
  btnPrimary: { background: "#222", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 },
};
