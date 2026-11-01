import { Suspense } from "react";
import GuestGate from "@/components/auth/GuestGate";
import { BottomNav } from "@/components/navigation/BottomNav";
import PushSync from "@/components/pwa/PushSync";

// The nav reads the current path, which is only known at request time, so it streams in behind a Suspense.
export default function CommutersLayout({ children }) {
  return (
    <>
      {children}
      <PushSync />
      <GuestGate />
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </>
  );
}
