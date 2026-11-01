"use client";

import { useEffect, useState } from "react";

// Who is using the app: { status: "loading" | "guest" | "user", user }. The session cookie is httpOnly, so JavaScript cannot
// look at it; the server is asked instead. Only a 401 means guest: a server that is down or offline stays "loading",
// so a signed-in person is never told to sign in.
// Unlike useFetch this does not redirect on 401: being a guest is normal on Home.
const useSession = () => {
  const [session, setSession] = useState({ status: "loading", user: null });

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (ignore) return;
        if (response.ok) setSession({ status: "user", user: (await response.json()).commuter });
        else if (response.status === 401) setSession({ status: "guest", user: null });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  return session;
};

export default useSession;
