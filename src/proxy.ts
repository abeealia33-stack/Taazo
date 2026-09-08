import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-level gate for the admin panel.
 *
 * Next 16 renamed the `middleware` convention to `proxy`; same API, same
 * runtime, different filename.
 *
 * This only checks that a session cookie is *present* — the signature and the
 * user lookup happen in `requireAdmin()` on the server, because the Edge
 * runtime has no database access. So this is a cheap redirect for the signed-out
 * case, never the security boundary. Every admin page still calls
 * `requireAdmin()` and every mutation re-checks the role.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const hasCookie = request.cookies.has("taazo_admin");
    if (!hasCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
