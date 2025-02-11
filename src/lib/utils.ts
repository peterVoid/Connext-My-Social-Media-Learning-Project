import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNowStrict } from "date-fns";
import { UserDataServerType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  const now = new Date();
  const postDate = new Date(date);

  if (now.getTime() - postDate.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } else {
    if (now.getFullYear() === postDate.getFullYear()) {
      return format(date, "MMM d");
    } else {
      return format(date, "MMM d, yyyy");
    }
  }
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en", { notation: "standard" }).format(number);
}

export function shufftleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}
