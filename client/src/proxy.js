import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const COOKIE = "commuter_token";
const STAFF_COOKIE = "staff_token";
const SEEN_COOKIE = "hasSeenOnboarding"; // set by the onboarding page (lib/session.js)

// Who may see what:
//   first visit (no onboarding cookie)  -> /home sends them to /onboarding
//   seen onboarding, no session (guest) -> everything except Settings > Alerts and > Boarding spot, which send them to /login
//   seen onboarding, signed in          -> every page
// The lock is on what needs an account, not on whole screens: a guest can browse the map, bus details and Settings, and is
// asked to sign in only when they try to get alerts (the "Alert me" button on bus details, the Alerts page, and the
// boarding spot, which exists only to time the alert).
// The session check only verifies the signature and the expiry. It cannot see the logout blacklist (that is in the
// database), so a logged-out token is stopped by the first API call instead; /api/auth/me then clears the cookie.
// The role claim must match the portal: a driver token is not a commuter session and the other way round.
const isValid = async (token, role) => {
  if (!token || !process.env.JWT_SECRET) return { valid: false, expired: false };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
    return { valid: payload.role === role, expired: false };
  } catch (error) {
    return { valid: false, expired: error.code === "ERR_JWT_EXPIRED" };
  }
};

// The driver app, its own cookie and its own login: /driver/login while signed in goes to /driver, and every other
// /driver page without a session goes to /driver/login. Same rules (signature, expiry, role) as the commuter side.
const guardDriver = async (request) => {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(STAFF_COOKIE)?.value;
  const { valid, expired } = await isValid(token, "DRIVER");

  if (pathname === "/driver/login") {
    if (valid) return NextResponse.redirect(new URL("/driver", request.url));
    const response = NextResponse.next();
    if (token) response.cookies.delete(STAFF_COOKIE);
    return response;
  }

  if (valid) return NextResponse.next();

  const login = new URL("/driver/login", request.url);
  login.searchParams.set("next", pathname + search);
  if (expired) login.searchParams.set("expired", "1");
  const response = NextResponse.redirect(login);
  if (token) response.cookies.delete(STAFF_COOKIE);
  return response;
};

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/driver" || pathname.startsWith("/driver/")) return guardDriver(request);

  // The app opens on /home (manifest start_url), so this is where a first-time visitor is caught.
  if (pathname === "/home") {
    return request.cookies.has(SEEN_COOKIE) ? NextResponse.next() : NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const token = request.cookies.get(COOKIE)?.value;
  const { valid, expired } = await isValid(token, "COMMUTER");

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
  matcher: ["/home", "/settings/alerts", "/settings/boarding-spot", "/login", "/driver", "/driver/:path*"],
};
