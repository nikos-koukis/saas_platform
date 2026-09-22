import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges class names and lets a caller's utility override a component default. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
