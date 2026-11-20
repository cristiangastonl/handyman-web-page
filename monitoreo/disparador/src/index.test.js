import { describe, it, expect, vi } from "vitest";
import worker, { dispararSalud, REPO, WORKFLOW } from "./index.js";

const responde = (status, texto = "") => vi.fn(async () => ({ status, text: async () => texto }));

describe("disparador de salud.yml", () => {
  it("pide a GitHub que corra salud.yml sobre main, con token y User-Agent", async () => {
    const f = responde(204);
    await dispararSalud({ GITHUB_TOKEN: "tok" }, f);
    const [url, opts] = f.mock.calls[0];
    expect(url).toBe(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`);
    expect(opts.method).toBe("POST");
    expect(opts.headers.Authorization).toBe("Bearer tok");
    expect(opts.headers["User-Agent"]).toBeTruthy();
    expect(JSON.parse(opts.body)).toEqual({ ref: "main" });
  });

  it("falla si GitHub no lo acepta (token vencido, sin permiso)", async () => {
    await expect(dispararSalud({ GITHUB_TOKEN: "tok" }, responde(403, "Resource not accessible")))
      .rejects.toThrow(/403/);
  });

  it("falla sin token en vez de pegarle a GitHub sin autenticar", async () => {
    const f = responde(204);
    await expect(dispararSalud({}, f)).rejects.toThrow(/GITHUB_TOKEN/);
    expect(f).not.toHaveBeenCalled();
  });

  it("el cron del Worker usa el mismo workflow que existe en el repo", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync(new URL(`../../../.github/workflows/${WORKFLOW}`, import.meta.url))).toBe(true);
    expect(typeof worker.scheduled).toBe("function");
  });
});
