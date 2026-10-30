import { twMerge } from "tailwind-merge";

// The scrolling area of a page. `className` is merged last, so it can override any default
// (for example `h-dvh` or `md:pl-0` for a page without a top bar or a sidebar).
export const PageContent = ({
  children,
  className = "",
  top = "top-18",
  withBottomNav = true,
}) => {
  return (
    // h-[calc(100dvh-72px)]
    <div
      className={twMerge(
        "absolute left-0 right-0 md:top-0  flex flex-col gap-6 px-3 py-6 overflow-y-auto md:pl-80 md:h-screen",
        top,
        withBottomNav
          ? "pb-[calc(18rem+env(safe-area-inset-bottom))]"
          : "pb-[calc(13rem+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      {children}
    </div>
  );
};
