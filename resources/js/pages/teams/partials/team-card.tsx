import { Link } from '@inertiajs/react';
import { Team } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
    team: Team;
    isOwner: boolean;
    isPersonalTeam: boolean;
}

export default function TeamCard({ team, isOwner, isPersonalTeam }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                {isOwner && (
                    <Badge variant="secondary">Owner</Badge>
                )}
                {isPersonalTeam && (
                    <Badge variant="outline">Personal Team</Badge>
                )}
            </div>
            
            <div className="flex -space-x-2">
                {team.members.slice(0, 4).map((member: any, index: number) => (
                    <Avatar 
                        key={member.id || `member-${index}`} 
                        className="border-2 border-background"
                    >
                        <AvatarImage src={member.avatar || ''} alt={member.name || `Member ${index}`} />
                        <AvatarFallback>{member.name?.charAt(0) }</AvatarFallback>
                    </Avatar>
                ))}
                {team.members.length > 4 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                        +{team.members.length - 4}
                    </div>
                )}
            </div>

            <Button asChild className="w-full">
                <Link href={`/teams/${team.id}`}>
                    View Team
                </Link>
            </Button>
        </div>
    );
}
