import { Check, ChevronsUpDown } from "lucide-react";
import { Project } from "@/types";
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

interface ProjectSelectProps {
    projects: Project[];
    value: Project["id"] | null;
    onChange: (value: Project["id"] | null) => void;
}

export function ProjectSelect({ projects, value, onChange }: ProjectSelectProps) {
    return (
        <div className="space-y-2">
            <Label>Project</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            value === null && "text-muted-foreground"
                        )}
                    >
                        {value !== null
                            ? projects.find((project) => project.id === value)?.name
                            : "Select project"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search projects..." />
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup>
                                {projects.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={project.id.toString()}
                                        onSelect={() => onChange(project.id)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === project.id
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {project.name}
                                    </CommandItem>
                                ))}
                                <CommandItem
                                    value="none"
                                    onSelect={() => onChange(null)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === null ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    No Project
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
