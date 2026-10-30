"use client";

import { useEffect, useState } from "react";
import { useFetch } from "./useFetch";

const POLL_MS = 4000;
const MAX_FAILURES = 2; // after this many failed requests in a row, stop polling

// GET /api/buses every few seconds, shared by the home screen and the bus details screen.
// useFetch asks again whenever refetchCount changes. After repeated failures we stop, so a server
// that is down is not hit again and again; `retry` asks once more and polling restarts if it works.
export const useBuses = () => {
  const [refetchCount, setRefetchCount] = useState(0);
  const { data, errorCount, isLoading } = useFetch({ url: "/api/buses", refetchCount });
  const gaveUp = errorCount >= MAX_FAILURES;

  useEffect(() => {
    if (gaveUp) return;
    const timer = setInterval(() => setRefetchCount((count) => count + 1), POLL_MS);
    return () => clearInterval(timer);
  }, [gaveUp]);

  const retry = () => setRefetchCount((count) => count + 1);

  return { data, isLoading, gaveUp, retry };
};
