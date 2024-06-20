import { type ClassValue, clsx } from "clsx"
import { eachDayOfInterval, isSameDay } from "date-fns";
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

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date,
){
  if(activeDays.length === 0){
    return [];
  }

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));

    if(found) return found;
    else{
      return{
        date: day,
        income: 0,
        expenses: 0
      }
    }
  });

  return transactionsByDay;
}