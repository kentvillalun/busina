import { redirect } from "next/navigation";

// Google creates the account on first sign-in, so there is no separate sign-up.
export default function SignupPage() {
  redirect("/login");
}
