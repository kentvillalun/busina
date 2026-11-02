"use client";

import { useEffect, useState } from "react";

// Who is signed in to the driver app: { status: "loading" | "guest" | "driver", bus }. Same idea as useSession for
// commuters: the cookie is httpOnly, so the server is asked, and only a 401 means signed out (a server that is down stays
// "loading"). One request per page load, shared by every component that asks.
let pending = null;
const loadStaffSession = () => {
  pending ??= fetch("/api/staff/me")
    .then(async (response) => {
      if (response.ok) return { status: "driver", bus: (await response.json()).bus };
      return response.status === 401 ? { status: "guest", bus: null } : null;
    })
    .catch(() => null)
    .then((session) => {
      if (!session) pending = null; // try again next time
      return session;
    });
  return pending;
};

const useStaffSession = () => {
  const [session, setSession] = useState({ status: "loading", bus: null });

  useEffect(() => {
    let ignore = false;
    loadStaffSession().then((result) => {
      if (result && !ignore) setSession(result);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return session;
};

export default useStaffSession;
