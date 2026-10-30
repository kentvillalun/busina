"use client";

import { useEffect } from "react";

// Production only: in development an active worker would serve old code and hide your changes.
const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
};

export default ServiceWorkerRegister;
