import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** @sinwan-pure */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
