import { router } from "@inertiajs/react";
import { Team } from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

interface Props {
    team: Team;
    members: {
        id: number;
        role: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }[];
    availableRoles: string[];
}

export default function TeamMembers({ team, members, availableRoles }: Props) {
    const updateRole = (memberId: number, role: string) => {
        router.patch(route("teams.members.update", { team: team.id, member: memberId }), {
            role: role
        });
    };

    const removeMember = (memberId: number) => {
        if (confirm('Are you sure you want to remove this member?')) {
            router.delete(route("teams.members.remove", { team: team.id, member: memberId }));
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.user.name}</TableCell>
                                <TableCell>{member.user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        value={member.role}
                                        onValueChange={(value) => updateRole(member.id, value)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeMember(member.id)}
                                    >
                                        Remove
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {!team.personal_team && members.length >= 10 && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            This team has reached its member limit. Upgrade to a personal team for unlimited members.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
