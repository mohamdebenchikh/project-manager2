import { router } from "@inertiajs/react";
import { Team, User } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Props {
    team: Team;
    members: User[];
    availableRoles: string[];
}

export default function TeamMembers({ team, members, availableRoles }: Props) {
    const { toast } = useToast();

    const updateRole = (memberId: number, role: string) => {
        router.patch(
            route("teams.update-member-role", {
                team: team.id,
                member: memberId,
            }),
            {
                role: role,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const successMessage = page.props.flash.success;
                    toast({
                        title: "Success",
                        description: successMessage,
                    });
                },
                onError: (errors: any) => {
                    const error = errors.error;
                    toast({
                        title: "Error",
                        description: error,
                    });
                },
            }
        );
    };

    const removeMember = (memberId: number) => {
        if (confirm("Are you sure you want to remove this member?")) {
            router.delete(
                route("teams.remove-member", {
                    team: team.id,
                    member: memberId,
                })
            );
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                    {team.personal_team
                        ? "Manage your team members. Personal teams have unlimited member capacity."
                        : "Manage your team members. Standard teams are limited to 10 members."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member, index) => (
                        <div
                            key={`${member.id || index}`}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage
                                        src={member.avatar || ""}
                                        alt={member.name || "Team Member"}
                                    />
                                    <AvatarFallback>
                                        {member.name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">
                                        {member.name || "Unknown Member"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {member.email || "No email available"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Select
                                    value={member.role}
                                    onValueChange={(value) =>
                                        updateRole(member.id, value)
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => (
                                            <SelectItem
                                                key={`role-${role}`}
                                                value={role}
                                            >
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeMember(member.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {!team.personal_team && members.length >= 10 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            This team has reached its member limit. Upgrade to a
                            personal team for unlimited members.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
