import { twMerge } from "tailwind-merge";

// The soft blue fade at the top of a screen (home header, settings, ...). It fills the closest
// positioned parent from the top; pass `className` to change the height or the colors.
// It sits at z-auto: in a page, put it before the content so the content paints over it. Inside a
// block that has its own content (the home header), give that block `relative isolate` and pass
// `-z-10` so the gradient goes behind the text.
const TopGradient = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={twMerge(
      "pointer-events-none absolute inset-x-0 top-0 h-full bg-linear-to-b from-accent via-accent/65 to-transparent",
      className,
    )}
  />
);

export default TopGradient;
