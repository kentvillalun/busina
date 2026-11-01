"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const MESSAGES = {
  expired: "Your session expired. Please sign in again.",
  state: "Sign-in did not finish. Please try again.",
  google: "Google did not accept the sign-in. Please try again.",
};

// Placeholder look until the Figma design is final. The behavior is the real one.
// "Continue with Google" is a plain link: the whole page has to go to Google and come back, so the router cannot do it.
const LoginForm = () => {
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";
  const message = params.get("expired") ? MESSAGES.expired : MESSAGES[params.get("error")];

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-107.5 flex-col justify-center px-6">
      <h1 className="font-display text-4xl leading-10.5 text-ink">Welcome to Busina</h1>
      <p className="mt-2.5 text-[15px] leading-5.5 text-muted">
        Sign in to see bus details and get an alert when your bus is near. Without an account you can still watch the map.
      </p>

      {message && (
        <p role="alert" className="mt-4 text-sm font-medium text-fault">
          {message}
        </p>
      )}

      <a
        href={`/api/auth/google?next=${encodeURIComponent(next)}`}
        className="gradient-button flex items-center justify-center"
      >
        Continue with Google
      </a>
      <Link href="/home" className="mt-1 w-full py-3 text-center text-[15px] font-bold text-muted">
        Continue as guest
      </Link>
    </main>
  );
};

export default LoginForm;
