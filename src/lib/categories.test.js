import { describe, it, expect } from "vitest";
import { withAllCategory, ALL_CATEGORY } from "./categories";

describe("withAllCategory", () => {
  const fila = {
    id: "assembly",
    label: "Assembly",
    header_image: "https://x/y.jpg",
    playlist_id: "https://www.youtube.com/playlist?list=PLO8avQ6ndCk-p5AXCHOHtKr7ZgKeJ6tL8",
    sort_order: 3,
  };

  it("no pierde playlist_id en el camino de la base a los componentes", () => {
    // El bug: App.jsx armaba el estado con .map(c => ({ id, label, header_image }))
    // y la playlist se perdía acá. Se guardaba bien en la base y el sitio no la
    // mostraba nunca — ni el badge de la tarjeta ni el link de adentro.
    const [, assembly] = withAllCategory([fila]);
    expect(assembly.playlist_id).toBe(fila.playlist_id);
  });

  it("pasa la fila entera, no una lista de campos elegidos a mano", () => {
    // Lo que se cuida es la forma, no una columna: la próxima que se agregue a
    // `categories` tiene que llegar sola, sin editar nada acá.
    const [, assembly] = withAllCategory([fila]);
    expect(assembly).toEqual(fila);
  });

  it('pone "All" primero, que no vive en la base', () => {
    const cats = withAllCategory([fila]);
    expect(cats[0]).toEqual(ALL_CATEGORY);
    expect(cats).toHaveLength(2);
  });

  it("sin categorías devuelve sólo All, y no explota sin argumentos", () => {
    expect(withAllCategory([])).toEqual([ALL_CATEGORY]);
    expect(withAllCategory()).toEqual([ALL_CATEGORY]);
  });
});
