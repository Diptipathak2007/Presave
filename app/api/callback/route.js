import { NextResponse } from "next/server";
import { validateSignedState } from "@/utils/oauthState";

function getPublicOrigin(request) {
  const cookieOrigin = request.cookies.get("spotify_return_origin")?.value;
  if (cookieOrigin) {
    try {
      return new URL(cookieOrigin).origin;
    } catch {
      // Fall through to other origin strategies.
    }
  }

  const requestUrl = new URL(request.url);
  const configuredRedirectUri = process.env.REDIRECT_URI?.trim();

  if (configuredRedirectUri) {
    try {
      return new URL(configuredRedirectUri).origin;
    } catch {
      // Fall through to forwarded/request URL origin.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const forwardedProtoHeader = request.headers.get("x-forwarded-proto");
    const forwardedProto =
      forwardedProtoHeader?.split(",")[0]?.trim() || requestUrl.protocol.replace(":", "");
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestUrl.origin;
}

function getReturnPath(request) {
  const cookiePath = request.cookies.get("spotify_return_to")?.value;
  if (!cookiePath || typeof cookiePath !== "string") return "/presave";
  if (!cookiePath.startsWith("/") || cookiePath.startsWith("//")) return "/presave";
  return cookiePath;
}

function buildReturnUrl(publicOrigin, returnPath, queryKey, queryValue) {
  const url = new URL(returnPath, publicOrigin);
  url.searchParams.delete("success");
  url.searchParams.delete("status");
  url.searchParams.delete("error");
  url.searchParams.set(queryKey, queryValue);
  return url;
}

function buildErrorRedirect(request, errorCode, publicOrigin, returnPath) {
  const targetUrl = buildReturnUrl(publicOrigin, returnPath, "status", "error");
  targetUrl.searchParams.set("error", errorCode);
  const response = NextResponse.redirect(targetUrl);
  response.cookies.set("spotify_auth_state", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("spotify_return_origin", "", {
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("spotify_return_to", "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}

function classifySaveError(status, errorBody) {
  const body = (errorBody || "").toLowerCase();

  if (status === 403 && body.includes("premium") && body.includes("subscription")) {
    return "save_premium";
  }

  if (status === 403 && body.includes("insufficient") && body.includes("scope")) {
    return "save_scope";
  }

  if (status === 400 && body.includes("invalid id")) {
    return "save_track";
  }

  return "save_fail";
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const publicOrigin = getPublicOrigin(request);
  const returnPath = getReturnPath(request);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Spotify Auth Error", error || "missing_code");
    return buildErrorRedirect(request, "token_fail", publicOrigin, returnPath);
  }

  const state = searchParams.get("state");
  if (!validateSignedState(state)) {
    console.error("Spotify OAuth state validation failed");
    return buildErrorRedirect(request, "invalid_state", publicOrigin, returnPath);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI?.trim() || `${publicOrigin}/api/callback`;

  if (!clientId || !clientSecret) {
    console.error("Missing Spotify environment variables");
    return buildErrorRedirect(request, "config", publicOrigin, returnPath);
  }

  // Track to save
  const trackId = process.env.SPOTIFY_TRACK_ID || "4PTG3Z6ehGkBFwjybzWkR8"; // Rick Astley - Never Gonna Give You Up

  const tokenController = new AbortController();
  const tokenTimeout = setTimeout(() => tokenController.abort(), 10000);

  try {
    // 1. Exchange code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      signal: tokenController.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });
    clearTimeout(tokenTimeout);

    if (!tokenResponse.ok) {
      throw new Error("token_fail");
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
      const saveErrorCode = classifySaveError(saveResponse.status, errorBody);
      throw new Error(saveErrorCode);
    }

    // 3. Redirect to success page
    const response = NextResponse.redirect(buildReturnUrl(publicOrigin, returnPath, "status", "success"));
    response.cookies.set("spotify_auth_state", "", {
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("spotify_return_origin", "", {
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("spotify_return_to", "", {
      maxAge: 0,
      path: "/",
    });
    return response;
  } catch (err) {
    clearTimeout(tokenTimeout);

    if (err?.name === "AbortError") {
      console.error("Spotify token exchange timeout");
      return buildErrorRedirect(request, "timeout", publicOrigin, returnPath);
    }

    console.error("Callback error:", err);
    const saveErrorCodes = new Set(["save_fail", "save_scope", "save_track", "save_premium"]);
    const errorCode = saveErrorCodes.has(err?.message) ? err.message : "token_fail";
    return buildErrorRedirect(request, errorCode, publicOrigin, returnPath);
  }
}
