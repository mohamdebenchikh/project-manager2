"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { User } from "@/types";
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

interface AssigneeSelectProps {
    teamMembers: User[];
    value: User["id"][];
    onChange: (value: User["id"][]) => void;
}

export function AssigneeSelect({ teamMembers, value, onChange }: AssigneeSelectProps) {
    return (
        <div className="space-y-2">
            <Label>Assignees</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            value.length === 0 && "text-muted-foreground"
                        )}
                    >
                        {value.length > 0
                            ? `${value.length} member(s) assigned`
                            : "Assign members"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search members..." />
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                                {teamMembers.map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={member.id.toString()}
                                        onSelect={() => {
                                            const newValue = value.includes(member.id)
                                                ? value.filter((id) => id !== member.id)
                                                : [...value, member.id];
                                            onChange(newValue);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.includes(member.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {member.name}
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
