import { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { Team } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import debounce from "lodash.debounce";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface Props {
    team: Team;
    invitations: Array<{
        id: number;
        email: string;
        role: string;
        status: string;
        created_at: string;
        expires_at: string;
        invitee: {
            name: string;
            email: string;
        };
    }>;
}

export default function TeamInvitations({ team, invitations }: Props) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        role: "member",
    });


    const handleSearch = debounce(async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await axios.get(route('users.search'), {
                params: { query }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }, 300);

    const handleUserSelect = (user: any) => {
        setSelectedUser(user);
        setData('email', user.email);
        setSearchResults([]);
    };

    const sendInvitation = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('team-invitations.send', team.id), {
            onSuccess: () => {
                reset();
                setSelectedUser(null);
                setIsInviteOpen(false);
            },
        });
    };

    const cancelInvitation = async (invitation: any) => {
        try {
            setIsLoading(true);
            await router.delete(route('team-invitations.destroy', [team.id, invitation.id]), {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Invitation cancelled successfully",
                    });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to cancel the invitation",
                        variant: "destructive",
                    });
                },
                onFinish: () => setIsLoading(false),
            });
        } catch (error) {
            console.error('Failed to cancel invitation:', error);
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Invitations</CardTitle>
                    <CardDescription>Manage pending team invitations.</CardDescription>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                            <DialogDescription>
                                Search for a user by name or email to invite them to your team.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={sendInvitation} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Search User</Label>
                                <Input
                                    type="text"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search by name or email"
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-background border rounded-md">
                                        {searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                className="p-2 hover:bg-muted cursor-pointer"
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <p className="font-medium">{user.name} </p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedUser && (
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing || !selectedUser}
                                className="w-full"
                            >
                                Send Invitation
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {invitations.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium">Pending Invitations</h3>
                        <div className="mt-4 space-y-3">
                            {invitations.map((invitation) => (
                                <div 
                                    key={invitation.id} 
                                    className="flex items-center justify-between p-4 bg-background border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{invitation.invitee?.name || invitation.email}</p>
                                        {invitation.invitee?.email && invitation.invitee.email !== invitation.email && (
                                            <p className="text-sm text-muted-foreground">{invitation.email}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Invited as {invitation.role}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => cancelInvitation(invitation)}
                                        className="text-destructive hover:text-destructive/90"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
