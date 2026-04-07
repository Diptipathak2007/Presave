import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSignedState, validateSignedState } from "../utils/oauthState";

const ORIGINAL_ENV = {
  SPOTIFY_STATE_SECRET: process.env.SPOTIFY_STATE_SECRET,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
};

describe("oauth state signing", () => {
  beforeEach(() => {
    process.env.SPOTIFY_STATE_SECRET = "test-state-secret";
    process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";
  });

  afterEach(() => {
    process.env.SPOTIFY_STATE_SECRET = ORIGINAL_ENV.SPOTIFY_STATE_SECRET;
    process.env.SPOTIFY_CLIENT_SECRET = ORIGINAL_ENV.SPOTIFY_CLIENT_SECRET;
  });

  it("creates a state token that validates", () => {
    const state = createSignedState();
    expect(validateSignedState(state)).toBe(true);
  });

  it("rejects tampered state token", () => {
    const state = createSignedState();
    const tampered = `${state}x`;
    expect(validateSignedState(tampered)).toBe(false);
  });

  it("rejects missing state token", () => {
    expect(validateSignedState("")).toBe(false);
    expect(validateSignedState(null)).toBe(false);
  });
});
