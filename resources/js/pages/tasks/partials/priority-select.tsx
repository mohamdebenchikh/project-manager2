"use client";

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

interface PrioritySelectProps {
    priorities: string[];
    value: string;
    onChange: (value: string) => void;
}

export function PrioritySelect({ priorities, value, onChange }: PrioritySelectProps) {
    return (
        <div className="space-y-2">
            <Label>Priority</Label>
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
                        {value || "Select priority"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search priority..." />
                            <CommandEmpty>No priority found.</CommandEmpty>
                            <CommandGroup>
                                {priorities.map((priority) => (
                                    <CommandItem
                                        key={priority}
                                        value={priority}
                                        onSelect={() => onChange(priority)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                priority === value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {priority.toUpperCase()}
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
