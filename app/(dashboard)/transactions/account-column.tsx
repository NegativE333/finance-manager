import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";


type Props = {
    account: string;
    accoutId: string;
}

export const AccountColumn = ({
    account,
    accoutId
}: Props) => {

    const {onOpen: onOpenAccount} = useOpenAccount();

    const onClick = () => {
        onOpenAccount(accoutId);
    }

    return(
        <div
            onClick={onClick} 
            className="flex items-center cursor-pointer hover:underline"
        >
            {account}
        </div>
    )
}