import { Suspense } from "react";
import DriverLoginForm from "@/components/auth/DriverLoginForm";

// The page lives with the other sign-in pages, but it is still the driver app's: it carries the driver manifest, like the
// pages in the (driver) group, so installing from here installs "Busina Driver".
export const metadata = {
  title: "Busina Driver",
  manifest: "/driver-manifest.json",
  appleWebApp: { title: "Driver" },
};

export const viewport = { themeColor: "#FFFFFF" };

// useSearchParams needs a Suspense boundary (the query is only known at request time).
export default function DriverLoginPage() {
  return (
    <Suspense fallback={null}>
      <DriverLoginForm />
    </Suspense>
  );
}
