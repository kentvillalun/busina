"use client";

import { useRouter } from "next/navigation";
import IconChevron from "@/components/icons/IconChevron";

// Goes back to wherever the person came from (Settings, the login screen...). With no history to go back to
// (a page opened from a link), it falls back to Settings so the button never does nothing.
const BackButton = () => {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/settings");
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back"
      className="-ml-1 flex size-9 items-center justify-center rounded-full text-ink active:bg-white/60"
    >
      <IconChevron className="size-6 rotate-180" />
    </button>
  );
};

export default BackButton;
