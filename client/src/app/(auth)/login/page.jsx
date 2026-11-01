import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

// useSearchParams needs a Suspense boundary (the query is only known at request time).
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
