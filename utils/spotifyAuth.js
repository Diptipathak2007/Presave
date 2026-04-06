export function getSpotifyAuthUrl() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    console.error("Missing Spotify Client ID or Redirect URI in Env");
  }

  const scope = "user-library-modify";
  // Create a random string for CSRF protection
  const state = Math.random().toString(36).substring(7);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId || "",
    scope: scope,
    redirect_uri: redirectUri || "",
    state: state,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
