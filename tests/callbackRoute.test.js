import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/callback/route";

describe("GET /api/callback", () => {
  it("redirects with token_fail when code is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/callback");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/presave?status=error&error=token_fail");
  });

  it("redirects with invalid_state when code exists but OAuth state is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/callback?code=test-code");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/presave?status=error&error=invalid_state");
  });
});
