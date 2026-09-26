import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Compare German phone numbers across +49, 0049, and leading 0. */
export function numbersMatch(a: string, b: string): boolean {
  const norm = (raw: string) => {
    let d = digitsOnly(raw);
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("49")) d = d.slice(2);
    if (d.startsWith("0")) d = d.slice(1);
    return d;
  };
  const left = norm(a);
  const right = norm(b);
  return left.length >= 8 && left === right;
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function normalizeDe(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPhoneDisplay(e164: string): string {
  const d = digitsOnly(e164);
  if (d.startsWith("49") && d.length >= 12) {
    return `+49 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
  }
  return e164;
}
