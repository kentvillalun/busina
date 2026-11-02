import { redirect } from "next/navigation";

// A visitor typing the bare address meets the landing page first. Installed apps never come through here: the manifest
// start_url is /home.
export default function Root() {
  redirect("/get");
}
