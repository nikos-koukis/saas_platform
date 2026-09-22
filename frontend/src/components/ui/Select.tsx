import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";
import { controlClasses } from "./Field";

/**
 * Wraps the native control rather than replacing it: keyboard behaviour and
 * the platform picker on mobile come for free.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={cn(controlClasses, "appearance-none pr-9", className)}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}
