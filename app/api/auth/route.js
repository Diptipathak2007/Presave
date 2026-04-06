import { NextResponse } from "next/server";
import { getSpotifyAuthUrl } from "@/utils/spotifyAuth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has("test")) {
    return NextResponse.redirect(new URL("/success?success=true", request.url));
  }

  const url = getSpotifyAuthUrl();
  return NextResponse.redirect(url);
}
