import { Suspense } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";

// The nav reads the current path, which is only known at request time, so it streams in behind a Suspense.
export default function CommutersLayout({ children }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </>
  );
}
