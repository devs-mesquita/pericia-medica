import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function errorFromApi<T>(
  error: any, // eslint-disable-line
  key: string,
): error is T {
  return key in error;
}