"use client";

import { useRef, useState } from "react";
import useSavedSetting from "@/hooks/useSavedSetting";
import useSession from "@/hooks/useSession";
import { isSharing, shareWaiting } from "@/lib/waiting";

// The "Let drivers see you're waiting?" question. `ask(point, onClose, { force })` opens it for a { lat, lng } point and calls
// `onClose` when it is answered either way (the boarding spot page goes back to Settings there). Nothing opens for a guest
// (only a signed-in commuter can share), without a point, or while an earlier "yes" is still running, unless `force`
// (a moved spot should be shared again). Pass `open`, `busy`, `share` and `dismiss` to <ShareSheet>.
const useShareSheet = () => {
  const session = useSession();
  const [direction] = useSavedSetting("busina:direction", "NORTHBOUND");
  const [point, setPoint] = useState(null);
  const [busy, setBusy] = useState(false);
  const afterRef = useRef(null);

  const ask = (position, onClose, { force = false } = {}) => {
    if (session.status !== "user" || !position || (!force && isSharing())) {
      onClose?.();
      return;
    }
    afterRef.current = onClose ?? null;
    setPoint({ lat: position.lat, lng: position.lng });
  };

  const close = () => {
    setPoint(null);
    const after = afterRef.current;
    afterRef.current = null;
    after?.();
  };

  const share = async () => {
    setBusy(true);
    await shareWaiting({ ...point, direction });
    setBusy(false);
    close();
  };

  return { open: point !== null, busy, ask, share, dismiss: close };
};

export default useShareSheet;
