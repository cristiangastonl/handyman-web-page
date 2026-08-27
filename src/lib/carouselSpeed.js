// Velocidad de los carruseles de la home, ajustable en vivo.
//
// Anibal pidió "más velocidad, tipo el triple", pero después aclaró que no
// sabe qué número quiere hasta verlo. Así que en vez de fijar un valor a
// ciegas, la velocidad sale de acá y se puede mover con un slider abriendo
// el sitio con ?tune=1. Cuando elija, se cambia BASE_SPEED (o el default del
// multiplicador) y esto se borra.

import { useSyncExternalStore } from "react";

// px por frame a 60fps. 0.5 ≈ 30 px/s — la velocidad original.
export const BASE_SPEED = 0.5;

export const MIN_MULTIPLIER = 0.5;
export const MAX_MULTIPLIER = 6;
export const DEFAULT_MULTIPLIER = 1;

const MULT_KEY = "carouselSpeedMultiplier";
// Guarda el apagado, no el prendido: el panel viene visible por defecto.
const TUNER_OFF_KEY = "carouselSpeedTunerOff";

const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

const clamp = (n) => Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, n));

// El valor vive en memoria; localStorage es sólo para que sobreviva al reload.
let multiplier = DEFAULT_MULTIPLIER;

function readStored() {
  try {
    const raw = localStorage.getItem(MULT_KEY);
    if (raw === null) return DEFAULT_MULTIPLIER;
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? clamp(n) : DEFAULT_MULTIPLIER;
  } catch {
    return DEFAULT_MULTIPLIER; // Safari en privado tira al tocar storage.
  }
}

multiplier = readStored();

export const getMultiplier = () => multiplier;

export function setMultiplier(value) {
  const next = clamp(Number(value) || DEFAULT_MULTIPLIER);
  if (next === multiplier) return;
  multiplier = next;
  try {
    localStorage.setItem(MULT_KEY, String(next));
  } catch {
    // Sin persistencia, pero la sesión actual igual responde.
  }
  emit();
}

export function resetMultiplier() {
  multiplier = DEFAULT_MULTIPLIER;
  try {
    localStorage.removeItem(MULT_KEY);
  } catch {
    // idem
  }
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hook para los componentes: devuelve px/frame ya multiplicados.
export function useCarouselSpeed() {
  const m = useSyncExternalStore(subscribe, getMultiplier, () => DEFAULT_MULTIPLIER);
  return BASE_SPEED * m;
}

export function useMultiplier() {
  return useSyncExternalStore(subscribe, getMultiplier, () => DEFAULT_MULTIPLIER);
}

// Para lo que se mueve con animation de CSS (los rieles de /reviews, el strip
// de marcas) en vez de rAF: más rápido = menos duración.
// Se devuelve listo para pisar animationDuration inline.
export function useAnimationDuration(baseSeconds) {
  const m = useSyncExternalStore(subscribe, getMultiplier, () => DEFAULT_MULTIPLIER);
  return `${(baseSeconds / m).toFixed(2)}s`;
}

// px/s aproximados, que es como lo va a leer una persona.
export const toPixelsPerSecond = (m) => Math.round(BASE_SPEED * m * 60);

// El panel se muestra por defecto: la web todavía no está lanzada y trabajamos
// siempre sobre la URL normal, así que pedir ?tune=1 era fricción al pedo.
// ?tune=0 (o la X del panel) lo apaga por el resto de la pestaña, para cuando
// haga falta ver el sitio limpio; ?tune=1 lo vuelve a prender.
//
// Al lanzar la web esto se invierte o se borra junto con el resto del andamiaje.
export function isTunerEnabled(search = typeof window !== "undefined" ? window.location.search : "") {
  let param = null;
  try {
    param = new URLSearchParams(search).get("tune");
  } catch {
    param = null;
  }

  const apagar = param === "0" || param === "off";

  try {
    if (apagar) {
      sessionStorage.setItem(TUNER_OFF_KEY, "1");
      return false;
    }
    if (param !== null) {
      sessionStorage.removeItem(TUNER_OFF_KEY);
      return true;
    }
    return sessionStorage.getItem(TUNER_OFF_KEY) !== "1";
  } catch {
    // Sin sessionStorage sólo vale el query param de esta URL.
    return !apagar;
  }
}

export function disableTuner() {
  try {
    sessionStorage.setItem(TUNER_OFF_KEY, "1");
  } catch {
    // Sin persistencia el panel vuelve al recargar, que es aceptable.
  }
}
