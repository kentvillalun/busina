"use client";

import { useSyncExternalStore } from "react";

// true while the screen matches the query, e.g. useMediaQuery("(min-width: 1024px)"). false on the server and before hydration.
const useMediaQuery = (query) =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

export default useMediaQuery;
