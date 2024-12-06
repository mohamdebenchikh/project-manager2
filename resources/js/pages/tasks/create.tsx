import { PageProps } from "@/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import  TaskForm  from "./partials/task-form";
import {Project,User} from '@/types';


interface Props extends PageProps {
    projects: Project[];
    team_members: User[];
    statuses: string[];
    priorities: string[];
}

export default function Create({
    projects,
    team_members,
    statuses,
    priorities,
}: Props) {
    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>New Task</CardTitle>
                        <CardDescription>
                            Create a new task for your team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            projects={projects}
                            team_members={team_members}
                            statuses={statuses}
                            priorities={priorities}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
