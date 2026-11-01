import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const COOKIE = "commuter_token";

// Guests (no valid cookie) only get Home. Bus details and Settings, where alerts are set up, need a Google sign-in.
// This only checks the signature and the expiry. It cannot see the logout blacklist (that is in the database),
// so a logged-out token is stopped by the first API call instead; /api/auth/me then clears the cookie.
const isValid = async (token) => {
  if (!token || !process.env.JWT_SECRET) return { valid: false, expired: false };
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
    return { valid: true, expired: false };
  } catch (error) {
    return { valid: false, expired: error.code === "ERR_JWT_EXPIRED" };
  }
};

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const { valid, expired } = await isValid(token);

  if (pathname === "/login") {
    if (valid) return NextResponse.redirect(new URL("/home", request.url));
    const response = NextResponse.next();
    if (token) response.cookies.delete(COOKIE); // a dead cookie must not linger
    return response;
  }

  if (valid) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  if (expired) login.searchParams.set("expired", "1");
  const response = NextResponse.redirect(login);
  if (token) response.cookies.delete(COOKIE);
  return response;
}

export const config = {
  matcher: ["/bus/:path*", "/settings/:path*", "/login"],
};
