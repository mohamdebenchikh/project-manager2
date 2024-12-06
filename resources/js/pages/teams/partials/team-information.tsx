import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Team } from "@/types";

interface Props {
    team: Team;
}

export default function TeamInformation({ team }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: team.name,
        description: team.description || "",
        is_public: team.is_public || false,
    });

    const updateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route("teams.update", team.id));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                    {team.personal_team 
                        ? "Manage your personal team's information and visibility."
                        : "Update your team's basic information."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={updateTeam} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="min-h-[100px]"
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    {team.personal_team && (
                        <div className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                                <Label>Public Team</Label>
                                <div className="text-sm text-muted-foreground">
                                    Make your personal team visible to other users. They can request to join your team.
                                </div>
                            </div>
                            <Switch
                                checked={data.is_public}
                                onCheckedChange={(checked) => setData("is_public", checked)}
                            />
                        </div>
                    )}

                    <Button type="submit" disabled={processing}>
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
