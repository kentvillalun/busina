"use client";

import { useEffect, useState } from "react";

// Who is using the app: { status: "loading" | "guest" | "user", user }. The session cookie is httpOnly, so JavaScript cannot
// look at it; the server is asked instead. Only a 401 means guest: a server that is down or offline stays "loading",
// so a signed-in person is never told to sign in. Unlike useFetch this does not redirect on 401: guests are normal here.
//
// One request per page load, shared by every component that asks (Settings, bus details and the push sync all do).
// Signing in and out are full page loads, so the answer cannot go stale in between.
let pending = null;
const loadSession = () => {
  pending ??= fetch("/api/auth/me")
    .then(async (response) => {
      if (response.ok) return { status: "user", user: (await response.json()).commuter };
      return response.status === 401 ? { status: "guest", user: null } : null;
    })
    .catch(() => null)
    .then((session) => {
      if (!session) pending = null; // try again next time
      return session;
    });
  return pending;
};

const useSession = () => {
  const [session, setSession] = useState({ status: "loading", user: null });

  useEffect(() => {
    let ignore = false;
    loadSession().then((result) => {
      if (result && !ignore) setSession(result);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return session;
};

export default useSession;
