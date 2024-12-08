import { Link } from '@inertiajs/react';
import { Team } from '@/types';
import { PageProps } from '@/types';
import TeamCard from './partials/team-card';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';

export default function Index({ auth, teams }: PageProps) {
    const currentUser = auth.user;

    return (
        <AuthenticatedLayout header="Teams">
            <Head title="Teams" />
            
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
                        <p className="text-muted-foreground">
                            Manage your teams and collaborate with others
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href="/teams/create">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Team
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <Card key={team.id}>
                            <CardHeader>
                                <CardTitle>{team.name}</CardTitle>
                                <CardDescription>
                                    {team.members.length} members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TeamCard
                                    team={team}
                                    isOwner={team.owner_id === currentUser.id}
                                    isPersonalTeam={team.personal_team}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
