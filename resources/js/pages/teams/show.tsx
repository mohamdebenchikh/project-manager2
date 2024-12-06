import { Team } from '@/types';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';
import { UsersIcon, Settings } from 'lucide-react';
import TeamDangerZone from './partials/team-danger-zone';


export default function Show({ auth, team }: PageProps) {
    const currentUser = auth.user;
    const isOwner = team.owner_id === currentUser.id;
    const userRole = team.members.find((member: any) => member.user.id === currentUser.id)?.role || '';

    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
                        <p className="text-muted-foreground">{team.description}</p>
                    </div>
                    {isOwner && (
                        <Button asChild variant="outline">
                            <Link href={`/teams/${team.id}/settings`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {isOwner && (
                        <Badge variant="secondary">Owner</Badge>
                    )}
                    {team.personal_team && (
                        <Badge variant="outline">Personal Team</Badge>
                    )}
                </div>

                <Tabs defaultValue="members" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="members" className="flex items-center">
                            <UsersIcon className="mr-2 h-4 w-4" />
                            Members
                        </TabsTrigger>
                        {isOwner && (
                            <TabsTrigger value="settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </TabsTrigger>
                        )}
                    </TabsList>
                    
                    <TabsContent value="members" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    People with access to this team
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {team.members.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={member.user.profile_photo_url} />
                                                    <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <Badge>{member.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isOwner && (
                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Team Settings</CardTitle>
                                    <CardDescription>
                                        Manage your team settings and preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TeamDangerZone team={team} userRole={userRole} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
