import { describe, expect, it } from "vitest";
import { isInAppBrowser, isInstagramBrowser } from "../utils/detectBrowser";

describe("detectBrowser helpers", () => {
  it("detects Instagram user agent", () => {
    expect(isInstagramBrowser("Mozilla/5.0 Instagram 321.0")).toBe(true);
    expect(isInstagramBrowser("Mozilla/5.0 Safari/537.36")).toBe(false);
  });

  it("detects common in-app browser signatures", () => {
    expect(isInAppBrowser("FBAN/FBIOS")).toBe(true);
    expect(isInAppBrowser("Line/13.1.0")).toBe(true);
    expect(isInAppBrowser("Twitter for iPhone")).toBe(true);
    expect(isInAppBrowser("Mozilla/5.0 Chrome/123.0")).toBe(false);
  });

  it("handles empty user agents safely", () => {
    expect(isInstagramBrowser("")).toBe(false);
    expect(isInAppBrowser("")).toBe(false);
    expect(isInstagramBrowser(null)).toBe(false);
    expect(isInAppBrowser(undefined)).toBe(false);
  });
});
