import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand-hover disabled:bg-brand/50",
  secondary: "border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-50",
  ghost: "text-muted hover:bg-canvas hover:text-ink disabled:opacity-50",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50",
} as const;

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
