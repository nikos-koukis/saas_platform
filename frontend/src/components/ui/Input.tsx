import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";
import { controlClasses } from "./Field";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn(controlClasses, className)} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(controlClasses, "h-auto py-2", className)} />;
}
