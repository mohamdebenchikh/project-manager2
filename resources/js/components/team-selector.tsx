import { PageProps, Team } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Settings2 } from "lucide-react";
import { Link, router, usePage } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

interface TeamSelectorProps {
    teams: Team[] | null;
    currentTeam: Team | null;
}

export default function TeamSelector({ teams = [], currentTeam }: TeamSelectorProps) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.current_team_role === 'admin' || auth.current_team_role === 'owner';
    const {toast} = useToast();

    const switchTeam = (teamId: number) => {
        router.post(route("teams.switch"), {
            team_id: teamId,
        },{
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast({
                    title: 'Team Switched',
                    description: 'You have switched to another team.',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'There was an error switching teams.',
                    variant: 'destructive',
                });
            }
        });
    };

    if (!teams?.length) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{currentTeam?.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teams.map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        className="cursor-pointer"
                        onClick={() => switchTeam(team.id)}
                    >
                        <div className="flex items-center justify-between w-full">
                            <span>{team.name}</span>
                            {team.id === currentTeam?.id && (
                                <span className="text-xs text-muted-foreground">Current</span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {currentTeam && isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link
                            href={route("current-team-settings")}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Settings2 className="h-4 w-4" />
                            <span>Team Settings</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        href={route("teams.create")}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Create New Team</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
