import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

/** Labels a control and wires its error text up for screen readers. */
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Shared look for every control, so they line up and highlight identically. */
export const controlClasses =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink " +
  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 " +
  "disabled:cursor-not-allowed disabled:bg-canvas aria-[invalid=true]:border-danger";
