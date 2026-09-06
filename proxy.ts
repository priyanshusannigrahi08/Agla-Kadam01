import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/ai-mentor/arjun-mehta") {
    return NextResponse.next();
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      const refererPath = new URL(referer).pathname;
      if (refererPath === "/") {
        return NextResponse.redirect(new URL("/ai-mentor", request.url));
      }
    } catch {
      // Ignore malformed referrers and keep the normal mentor chat route.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ai-mentor/arjun-mehta"],
};
