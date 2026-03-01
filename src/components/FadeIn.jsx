import { useState, useRef, useEffect } from "react";
import { useFadeIn } from "../hooks/useFadeIn";

export function AnimatedCounter({ target, duration = 1200, decimals = 1 }) {
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
          const ease = 1 - Math.pow(1 - p, 3);
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

export function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
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
