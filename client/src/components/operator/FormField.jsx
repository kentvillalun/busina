// The input look of Ecoaid: a label above a box with a 1px outline that turns primary on focus; a dropdown is a plain select with no
// border of its own inside that box. `error` is the red message under the box, `hint` a small grey line for what the field means.
const box = "flex min-h-11 w-full items-center rounded-lg px-3.5 py-2.5 text-base text-ink outline-1 outline-line transition-colors focus-within:outline-primary";

// The class of the input or select inside the box.
export const bare = "w-full bg-transparent outline-none placeholder:text-muted/60";

export const Field = ({ label, htmlFor, error, hint, children }) => (
  <div className="flex w-full flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-start text-sm font-medium text-ink">
      {label}
    </label>
    <div className={box}>{children}</div>
    {hint && <p className="text-xs leading-4 text-muted">{hint}</p>}
    {error && (
      <p role="alert" className="text-xs text-fault">
        {error}
      </p>
    )}
  </div>
);
