import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Props = {
    columnIndex: number;
    selectedColumns: Record<string, string| null>; 
    onChange: (columnIndex: number, value: string | null) => void;
}

const options = [
    "amount",
    "payee",
    "date"
];

export const TableHeadSelect = ({
    columnIndex,
    selectedColumns,
    onChange 
}: Props) => {

    const currSelection = selectedColumns[`column_${columnIndex}`];

    return(
        <Select
            value={currSelection || ""}
            onValueChange={(val) => onChange(columnIndex, val)}
        >
            <SelectTrigger className={cn("focus:ring-offset-0 focus:ring-transparent outline-none border-none bg-transparent capitalize", currSelection && "text-blue-500")}>
                <SelectValue placeholder="Skip" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value='skip'>
                    Skip
                </SelectItem>
                {options.map((op, i) => {
                    const disabled = Object.values(selectedColumns)
                        .includes(op) && selectedColumns[`column_${columnIndex}`] !== op;

                    return(
                        <SelectItem
                            key={i}
                            value={op}
                            disabled={disabled}
                            className='capitalize'
                        >
                            {op}
                        </SelectItem>
                )})}
            </SelectContent>
        </Select>
    )
}