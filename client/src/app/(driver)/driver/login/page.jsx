import { Suspense } from "react";
import DriverLoginForm from "@/components/driver/DriverLoginForm";

// useSearchParams needs a Suspense boundary (the query is only known at request time).
export default function DriverLoginPage() {
  return (
    <Suspense fallback={null}>
      <DriverLoginForm />
    </Suspense>
  );
}
