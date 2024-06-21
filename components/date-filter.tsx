"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from 'query-string';
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { DateRange } from "react-day-picker";
import {
    Popover,
    PopoverTrigger,
    PopoverClose,
    PopoverContent
} from '@/components/ui/popover';
import { Button } from "./ui/button";
import { format, subDays } from "date-fns";
import { formatDateRange } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Calendar } from "./ui/calendar";


export const DateFilter = () => {

    const params = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const accountId = params.get("accountId");
    const from = params.get("from") || "";
    const to = params.get("to") || "";

    const {isLoading: isLoadingSummary} = useGetSummary();

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const paramState = {
        from: from ? new Date(from) : defaultFrom,
        to: to ? new Date(to) : defaultTo
    };

    const [date, setDate] = useState<DateRange | undefined>(paramState);

    const pushToUrl = (dateRange: DateRange | undefined) => {
        const query = {
            from : format(dateRange?.from || defaultFrom, "yyyy-MM-dd"),
            to : format(dateRange?.to || defaultTo , "yyyy-MM-dd"),
            accountId
        }

        const url = qs.stringifyUrl({
            url: pathname,
            query
        }, {skipEmptyString: true, skipNull: true});

        router.push(url);
    }

    const onReset = () => {
        setDate(undefined);
        pushToUrl(undefined);
    }

    return(
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={false}
                    size="sm"
                    variant="outline"
                    className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
                >
                    <span className="">{formatDateRange(paramState)}</span>
                    <ChevronDown className="ml-2 size-4 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="lg:w-auto w-full p-0"
                align="start"
            >
                <Calendar 
                    disabled={false}
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
                <div className="p-4 w-full flex items-center gap-x-2">
                    <PopoverClose asChild>
                        <Button
                            onClick={onReset}
                            disabled={!date?.from || !date?.to}
                            className="w-full"
                            variant="outline"
                        >
                            Reset
                        </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                        <Button
                            onClick={() => pushToUrl(date)}
                            disabled={!date?.from || !date?.to}
                            className="w-full"
                        >
                            Apply
                        </Button>
                    </PopoverClose>
                </div>
            </PopoverContent>
        </Popover>
    )
}