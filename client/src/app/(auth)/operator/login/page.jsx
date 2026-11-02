import { Suspense } from "react";
import OperatorLoginForm from "@/components/auth/OperatorLoginForm";

// Lives with the other sign-in pages but belongs to the operator app: it carries the operator manifest.
export const metadata = {
  title: "Busina Operator",
  manifest: "/operator-manifest.json",
  appleWebApp: { title: "Operator" },
};

export const viewport = { themeColor: "#FFFFFF" };

// useSearchParams needs a Suspense boundary (the query is only known at request time).
export default function OperatorLoginPage() {
  return (
    <Suspense fallback={null}>
      <OperatorLoginForm />
    </Suspense>
  );
}
