import { describe, it, expect } from "vitest";
import { itemThumb, ytId, fbEmbedUrl, getWALink } from "./constants";

describe("itemThumb", () => {
  // Regression: this is the bug that white-screened /portfolio in production.
  // Categories with subcategories but no direct items had catItems[0] === undefined,
  // and itemThumb(undefined) crashed reading .thumb on undefined.
  it("returns empty string when item is undefined", () => {
    expect(itemThumb(undefined)).toBe("");
  });

  it("returns empty string when item is null", () => {
    expect(itemThumb(null)).toBe("");
  });

  it("returns thumb when present", () => {
    expect(itemThumb({ thumb: "https://example.com/x.jpg", type: "image", src: "ignored" })).toBe("https://example.com/x.jpg");
  });

  it("derives YouTube thumbnail from videoId for video items", () => {
    expect(itemThumb({ type: "video", videoId: "dQw4w9WgXcQ" })).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("derives YouTube thumbnail from full URL videoId", () => {
    expect(itemThumb({ type: "video", videoId: "https://youtu.be/dQw4w9WgXcQ" })).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns empty string for video item without videoId", () => {
    expect(itemThumb({ type: "video" })).toBe("");
  });

  it("falls back to facebook icon for facebook items without thumb", () => {
    expect(itemThumb({ type: "facebook" })).toBe("/anibal/facebook_icon.jpeg");
  });

  it("returns src for image items without thumb", () => {
    expect(itemThumb({ type: "image", src: "https://example.com/photo.jpg" })).toBe("https://example.com/photo.jpg");
  });
});

describe("ytId", () => {
  it("extracts ID from youtu.be short URL", () => {
    expect(ytId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtube.com/watch URL", () => {
    expect(ytId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts ID from youtube.com/shorts URL", () => {
    expect(ytId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns input as-is when already a bare ID", () => {
    expect(ytId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns falsy input unchanged", () => {
    expect(ytId("")).toBe("");
    expect(ytId(null)).toBe(null);
    expect(ytId(undefined)).toBe(undefined);
  });
});

describe("fbEmbedUrl", () => {
  it("URL-encodes the input video URL", () => {
    expect(fbEmbedUrl("https://www.facebook.com/video/123")).toBe(
      "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fvideo%2F123&show_text=false"
    );
  });
});

describe("getWALink", () => {
  it("uses English message by default", () => {
    expect(getWALink()).toContain("Hi%2C%20I%20need");
  });

  it("uses Spanish message when lang=es", () => {
    expect(getWALink("es")).toContain("Hola");
  });

  it("falls back to English for unknown language", () => {
    expect(getWALink("zz")).toContain("Hi%2C%20I%20need");
  });
});
