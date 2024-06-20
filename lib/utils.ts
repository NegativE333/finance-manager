import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertAmountToMiliUnits(amount : number) {
  return Math.round(amount*100);
}

export function convertAmountFromMiliUnits(amount : number) {
  return amount/100;
}

export function formatCurrency(value: number){
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function calculatePercentageChange(curr: number, prev: number) {
  if(prev === 0) return prev === curr ? 0 : 100;

  return((curr-prev)/prev)*100;
}