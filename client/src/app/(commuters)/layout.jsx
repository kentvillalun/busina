"use client"

import { Suspense } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { usePathname } from "next/navigation";

// The nav reads the current path, which is only known at request time, so it streams in behind a Suspense.
export default function CommutersLayout({ children }) {

  const pathname = usePathname()

  const paths = [
    "/settings/alerts",
    "/settings/location",
    "/settings/direction",
    "/settings/estimates",
  ]

  const hideNav = paths.some((path) => pathname.startsWith(path))

  return (
    <>
      {children}
      <Suspense fallback={null}>
        {!hideNav && <BottomNav />}
      </Suspense>
    </>
  );
}
