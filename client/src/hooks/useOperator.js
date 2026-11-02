"use client";

import { useEffect, useState } from "react";

// Who is signed in, from GET /api/operator/me (null until it arrives). A 401 means the session ended: back to the sign-in page.
export const useOperator = () => {
  const [operator, setOperator] = useState(null);

  useEffect(() => {
    fetch("/api/operator/me")
      .then((response) => {
        if (response.status === 401) return window.location.replace("/operator/login?expired=1");
        return response.ok ? response.json() : null;
      })
      .then((data) => data && setOperator(data.operator))
      .catch(() => {});
  }, []);

  return operator;
};
