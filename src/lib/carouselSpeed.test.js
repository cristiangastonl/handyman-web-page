import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BASE_SPEED, MIN_MULTIPLIER, MAX_MULTIPLIER, DEFAULT_MULTIPLIER,
  getMultiplier, setMultiplier, resetMultiplier, subscribe,
  toPixelsPerSecond, isTunerEnabled, disableTuner,
} from "./carouselSpeed";

// Los tests corren en Node (no hay jsdom en el proyecto), así que el Storage
// del browser se emula acá. Es un mapa, que es todo lo que el módulo usa.
function fakeStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", fakeStorage());
  vi.stubGlobal("sessionStorage", fakeStorage());
  resetMultiplier();
});

describe("multiplicador de velocidad", () => {
  it("arranca en el valor original", () => {
    expect(getMultiplier()).toBe(DEFAULT_MULTIPLIER);
  });

  it("acepta un valor dentro del rango", () => {
    setMultiplier(3);
    expect(getMultiplier()).toBe(3);
  });

  it("recorta por debajo del mínimo", () => {
    setMultiplier(0.01);
    expect(getMultiplier()).toBe(MIN_MULTIPLIER);
  });

  it("recorta por encima del máximo", () => {
    setMultiplier(999);
    expect(getMultiplier()).toBe(MAX_MULTIPLIER);
  });

  it("cae al default si le pasan basura", () => {
    setMultiplier("no es un número");
    expect(getMultiplier()).toBe(DEFAULT_MULTIPLIER);
  });

  it("acepta el string del input range", () => {
    setMultiplier("2.5");
    expect(getMultiplier()).toBe(2.5);
  });

  it("persiste en localStorage", () => {
    setMultiplier(2);
    expect(localStorage.getItem("carouselSpeedMultiplier")).toBe("2");
  });

  it("reset limpia el storage y vuelve al original", () => {
    setMultiplier(4);
    resetMultiplier();
    expect(getMultiplier()).toBe(DEFAULT_MULTIPLIER);
    expect(localStorage.getItem("carouselSpeedMultiplier")).toBeNull();
  });

  it("avisa a los suscriptores cuando cambia", () => {
    // useSyncExternalStore depende de esto: sin emit, el slider no repinta.
    let llamadas = 0;
    const unsub = subscribe(() => llamadas++);
    setMultiplier(2);
    expect(llamadas).toBe(1);
    unsub();
    setMultiplier(3);
    expect(llamadas).toBe(1); // ya no escucha
  });

  it("no avisa si el valor no cambió", () => {
    setMultiplier(2);
    let llamadas = 0;
    const unsub = subscribe(() => llamadas++);
    setMultiplier(2);
    expect(llamadas).toBe(0);
    unsub();
  });
});

describe("px por segundo", () => {
  it("el original son ~30 px/s", () => {
    expect(toPixelsPerSecond(1)).toBe(Math.round(BASE_SPEED * 60));
  });

  it("el triple que pidió el cliente son ~90 px/s", () => {
    expect(toPixelsPerSecond(3)).toBe(90);
  });
});

describe("activación del panel", () => {
  it("está apagado sin query param", () => {
    expect(isTunerEnabled("")).toBe(false);
  });

  it("se prende con ?tune=1", () => {
    expect(isTunerEnabled("?tune=1")).toBe(true);
  });

  it("queda prendido al navegar sin el param", () => {
    isTunerEnabled("?tune=1");
    expect(isTunerEnabled("")).toBe(true);
  });

  it("se apaga con ?tune=0", () => {
    isTunerEnabled("?tune=1");
    expect(isTunerEnabled("?tune=0")).toBe(false);
    expect(isTunerEnabled("")).toBe(false);
  });

  it("disableTuner lo apaga para el resto de la sesión", () => {
    isTunerEnabled("?tune=1");
    disableTuner();
    expect(isTunerEnabled("")).toBe(false);
  });

  it("no se prende con otros query params", () => {
    expect(isTunerEnabled("?lang=de&utm_source=wa")).toBe(false);
  });
});
