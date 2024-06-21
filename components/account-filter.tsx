"use client";

import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from 'query-string';
import { useGetSummary } from "@/features/summary/api/use-get-summary";

export const AccountFilter = () => {

    const params = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const accountId = params.get("accountId") || "all";
    const from = params.get("from") || "";
    const to = params.get("to") || "";

    const {isLoading: isLoadingSummary} = useGetSummary();

    const {
        data : accounts,
        isLoading: isLoadingAccount
    } = useGetAccounts();

    const onChange = (newValue: string) => {
        const query = {
            accountId: newValue,
            from,
            to,
        }

        if(newValue === "all") query.accountId = "";

        const url = qs.stringifyUrl({
            url: pathname,
            query,
        }, {skipNull : true, skipEmptyString: true});

        router.push(url);
    }


    return(
        <Select 
            value={accountId}
            onValueChange={onChange}
            disabled={isLoadingAccount || isLoadingSummary}
        >
            <SelectTrigger
                className="lg:w-auto w-full h-9 rounded-md px-3 font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus:ring-offset-0 focus:ring-transparent outline-none text-white focus:bg-white/30 transition"
            >
                <SelectValue placeholder="Select account"/>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">
                    All account
                </SelectItem>
                {accounts?.map((acc) => (
                    <SelectItem
                        key={acc.id} 
                        value={acc.id}
                    >
                        {acc.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}