import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getSpotifyAuthUrl } from "../utils/spotifyAuth";

const ORIGINAL_ENV = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI,
};

describe("getSpotifyAuthUrl", () => {
  beforeEach(() => {
    process.env.SPOTIFY_CLIENT_ID = "test-client";
    process.env.REDIRECT_URI = "http://localhost:3000/api/callback";
  });

  afterEach(() => {
    process.env.SPOTIFY_CLIENT_ID = ORIGINAL_ENV.SPOTIFY_CLIENT_ID;
    process.env.REDIRECT_URI = ORIGINAL_ENV.REDIRECT_URI;
  });

  it("throws when SPOTIFY_CLIENT_ID is missing", () => {
    delete process.env.SPOTIFY_CLIENT_ID;
    expect(() => getSpotifyAuthUrl("state-1")).toThrow("SPOTIFY_CLIENT_ID");
  });

  it("throws when redirect URI argument is missing", () => {
    delete process.env.REDIRECT_URI;
    expect(() => getSpotifyAuthUrl("state-2")).toThrow("redirect_uri");
  });

  it("builds Spotify auth URL with supplied state", () => {
    const url = getSpotifyAuthUrl("fixed-state", "http://localhost:3000/api/callback");
    expect(url).toContain("https://accounts.spotify.com/authorize?");
    expect(url).toContain("response_type=code");
    expect(url).toContain("client_id=test-client");
    expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fcallback");
    expect(url).toContain("scope=user-library-modify");
    expect(url).toContain("state=fixed-state");
  });
});
