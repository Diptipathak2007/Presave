export function getSpotifyAuthUrl(state, redirectUri) {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const resolvedRedirectUri = (redirectUri || process.env.REDIRECT_URI)?.trim();

  if (!clientId) {
    throw new Error("SPOTIFY_CLIENT_ID is not configured");
  }

  if (!resolvedRedirectUri) {
    throw new Error("redirect_uri is required");
  }

  const scope = "user-library-modify";
  const authState = state || Math.random().toString(36).substring(7);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: resolvedRedirectUri,
    state: authState,
    show_dialog: "true",
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
