import { NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/utils/spotifyAuth";
import { createSignedState } from "@/utils/oauthState";

function getPublicOrigin(request) {
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

function normalizeOrigin(value) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function normalizeReturnPath(value) {
  if (!value || typeof value !== "string") return "/presave";
  if (!value.startsWith("/")) return "/presave";
  if (value.startsWith("//")) return "/presave";
  return value;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const publicOrigin = getPublicOrigin(request);
  const returnPath = normalizeReturnPath(searchParams.get("return_to") || "/presave");

  if (searchParams.has("test")) {
    return NextResponse.redirect(new URL("/success?success=true", publicOrigin));
  }

  try {
    const authState = createSignedState();
    const redirectUri = process.env.REDIRECT_URI?.trim() || `${publicOrigin}/api/callback`;
    const url = getSpotifyAuthUrl(authState, redirectUri);
    const response = NextResponse.redirect(url);
    const returnOrigin = normalizeOrigin(publicOrigin);

    response.cookies.set("spotify_auth_state", authState, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });

    if (returnOrigin) {
      response.cookies.set("spotify_return_origin", returnOrigin, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60,
        path: "/",
      });
    }

    response.cookies.set("spotify_return_to", returnPath, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth route configuration error", error);
    return NextResponse.redirect(new URL("/?error=config", publicOrigin));
  }
}
