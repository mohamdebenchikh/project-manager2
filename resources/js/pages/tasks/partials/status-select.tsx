import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface StatusSelectProps {
    statuses: string[];
    value: string;
    onChange: (value: string) => void;
}

export function StatusSelect({ statuses, value, onChange }: StatusSelectProps) {
    return (
        <div className="space-y-2">
            <Label>Status</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value || "Select status"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command>
                        <CommandList>
                        <CommandInput placeholder="Search status..." />
                        <CommandEmpty>No status found.</CommandEmpty>
                        <CommandGroup>
                            {statuses.map((status) => (
                                <CommandItem
                                    key={status}
                                    value={status}
                                    onSelect={() => onChange(status)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            status === value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {status.toUpperCase()}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
