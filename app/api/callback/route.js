import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  
  if (error || !code) {
    console.error("Spotify Auth Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;
  
  // Track to save
  const trackId = process.env.SPOTIFY_TRACK_ID || "4PTG3Z6ehGkBFwjybzWkR8"; // Rick Astley - Never Gonna Give You Up

  try {
    // 1. Exchange code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri || "",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 2. Save track to user's library
    const saveResponse = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${trackId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!saveResponse.ok) {
      const errorBody = await saveResponse.text();
      console.error("Spotify Save Error Body:", errorBody);
      throw new Error(`Failed to save track: ${saveResponse.statusText} - ${errorBody}`);
    }

    // 3. Redirect to success page
    return NextResponse.redirect(new URL("/success", request.url));
    
  } catch (err) {
    console.error("Callback error:", err);
    // Redirect to home with error parameter to show ErrorState
    return NextResponse.redirect(new URL("/?error=true", request.url));
  }
}
