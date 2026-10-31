"use client";

import { useEffect, useState } from "react";

// A value kept in localStorage: [value, save]. It starts as `fallback` and is read after mount, so the server and the
// first browser render match (there is no localStorage on the server). Storage can be blocked (private window): then the
// value just lives until the page closes.
const useSavedSetting = (key, fallback) => {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {}
  }, [key]);

  const save = (next) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  return [value, save];
};

export default useSavedSetting;
