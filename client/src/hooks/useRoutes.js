"use client";

import { useFetch } from "./useFetch";

// GET /api/routes once: the roads change rarely. [] until it arrives.
export const useRoutes = () => useFetch({ url: "/api/routes" }).data?.routes ?? [];
