import { router } from "@inertiajs/react";
import { Team } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
    team: Team;
    userRole: string;
}

export default function TeamDangerZone({ team, userRole }: Props) {
    const deleteTeam = () => {
        router.delete(route("teams.destroy", team.id));
    };

    const toggleTeamStatus = (active: boolean) => {
        router.patch(route("teams.update-status", team.id), {
            active: active
        });
    };

    // Don't show danger zone for personal teams
    if (team.personal_team) {
        return null;
    }

    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                    Actions that can have serious consequences for your team
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {userRole === 'admin' && (
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Team Status</Label>
                            <div className="text-sm text-muted-foreground">
                                {team.active ? 
                                    "Team is currently active. Deactivating will prevent members from accessing team resources." :
                                    "Team is currently inactive. Activating will restore member access to team resources."
                                }
                            </div>
                        </div>
                        <Switch
                            checked={team.active}
                            onCheckedChange={toggleTeamStatus}
                        />
                    </div>
                )}

                {userRole === 'owner' && (
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-destructive">Delete Team</Label>
                            <div className="text-sm text-muted-foreground">
                                Permanently delete this team and all of its data. This action cannot be undone.
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Team</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the team
                                        "{team.name}" and remove all associated data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={deleteTeam}
                                        className="bg-destructive hover:bg-destructive/90"
                                    >
                                        Delete Team
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
