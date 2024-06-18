import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertAmountToMiliUnits(amount : number) {
  return Math.round(amount*100);
}

export function convertAmountFromMiliUnits(amount : number) {
  return amount/1000;
}