"use client";

import { useEffect, useState } from "react";
import SignInSheet from "@/components/auth/SignInSheet";
import useSession from "@/hooks/useSession";

// The same paths proxy.js protects. The proxy is the real lock (it also catches typed URLs and notification taps);
// this only swaps the redirect for a sheet when a guest taps a link inside the app.
const PROTECTED = ["/bus", "/settings"];

const GuestGate = () => {
  const { status } = useSession();
  const [target, setTarget] = useState(null); // the page the guest wanted, e.g. "/bus/abc"

  useEffect(() => {
    if (status !== "guest") return;

    // Capture phase, so it runs before the link's own handler (Next's <Link> navigates in onClick).
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank") return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!PROTECTED.some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`))) return;

      event.preventDefault();
      event.stopPropagation();
      setTarget(url.pathname + url.search);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [status]);

  return <SignInSheet open={target !== null} next={target ?? "/home"} onDismiss={() => setTarget(null)} />;
};

export default GuestGate;
