import { Head, Link } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Task, Project, User } from "@/types";
import TaskForm from "./partials/task-form";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props extends PageProps {
    task: Task;
    projects: Project[];
    team_members: User[];
    statuses: string[];
    priorities: string[];
}

export default function Edit({
    task,
    projects,
    team_members,
    statuses,
    priorities,
}: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl">
                        Edit Task
                    </h2>
                </div>
            }
        >
            <Head title="Edit Task" />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            task={task}
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
