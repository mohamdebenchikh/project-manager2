import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Team } from "@/types";
import TeamInformation from "./partials/team-information";
import TeamMembers from "./partials/team-members";
import TeamInvitations from "./partials/team-invitations";
import TeamDangerZone from "./partials/team-danger-zone";

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
    userRole: string;
}

export default function Settings({ team, members, availableRoles, invitations, userRole }: Props) {
    return (
        <AuthenticatedLayout header="Team Settings">
            <Head title="Team Settings" />
            <div className="container mx-auto p-4 space-y-6">
                <TeamInformation team={team} />
                
                {!team.personal_team && (
                    <>
                        <TeamMembers 
                            team={team} 
                            members={members} 
                            availableRoles={availableRoles} 
                        />
                        <TeamInvitations 
                            team={team} 
                            invitations={invitations} 
                        />
                    </>
                )}

                <TeamDangerZone 
                    team={team}
                    userRole={userRole}
                />
            </div>
        </AuthenticatedLayout>
    );
}
