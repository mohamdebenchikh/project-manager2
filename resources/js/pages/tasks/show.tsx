import { useState } from "react";
import { PageProps } from "@/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { TaskForm } from "./partials/task-form";
import { useForm } from "@inertiajs/react";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    project: Project | null;
    priority: string;
    status: string;
    due_date: string;
    start_date: string;
    estimated_hours: number;
    actual_hours: number;
    labels: string[];
    assignee_ids: number[];
    is_milestone: boolean;
    completion_percentage: number;
    creator?: User;
    assignees: User[];
    created_at_formatted: string;
    due_date_formatted: string;
    start_date_formatted: string;
}

interface Props extends PageProps {
    task: Task;
    team_members: User[];
    statuses: string[];
    priorities: string[];
}

export default function Show({
    task,
    team_members,
    statuses,
    priorities,
}: Props) {
    const [editing, setEditing] = useState(false);
    const deleteForm = useForm({});

    function onDelete() {
        deleteForm.delete(route("tasks.destroy", task.id));
    }

    const priorityColors = {
        low: "bg-gray-500",
        medium: "bg-blue-500",
        high: "bg-orange-500",
        urgent: "bg-red-500",
    };

    const statusColors = {
        open: "bg-gray-500",
        in_progress: "bg-blue-500",
        review: "bg-purple-500",
        completed: "bg-green-500",
        closed: "bg-gray-700",
    };

    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {task.title}
                        </h2>
                        <p className="text-muted-foreground">
                            {task.description || "No description provided"}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditing(!editing)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete Task
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this task?
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Status
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className={
                                    statusColors[
                                        task.status as keyof typeof statusColors
                                    ]
                                }
                            >
                                {task.status.replace("_", " ").toUpperCase()}
                            </Badge>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Priority
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className={
                                    priorityColors[
                                        task.priority as keyof typeof priorityColors
                                    ]
                                }
                            >
                                {task.priority.toUpperCase()}
                            </Badge>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Due Date
                            </CardTitle>
                            <div className="text-sm">
                                {task.due_date_formatted || "No due date"}
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completion
                            </CardTitle>
                            <div className="text-sm">
                                {task.completion_percentage}%
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-2 w-full bg-secondary">
                                <div
                                    className="h-2 bg-primary"
                                    style={{
                                        width: `${task.completion_percentage}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {editing ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Task</CardTitle>
                            <CardDescription>
                                Update task details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TaskForm
                                projects={[task.project].filter(Boolean)}
                                teamMembers={team_members}
                                statuses={statuses}
                                priorities={priorities}
                                task={task}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Project
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {task.project?.name || "No project"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Created By
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {task.creator?.name || "Unknown"}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Created At
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {task.created_at_formatted}
                                    </p>
                                </div>
                                {task.start_date && (
                                    <div>
                                        <h4 className="text-sm font-medium">
                                            Start Date
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {task.start_date_formatted}
                                        </p>
                                    </div>
                                )}
                                {task.estimated_hours && (
                                    <div>
                                        <h4 className="text-sm font-medium">
                                            Estimated Hours
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {task.estimated_hours}
                                        </p>
                                    </div>
                                )}
                                {task.actual_hours && (
                                    <div>
                                        <h4 className="text-sm font-medium">
                                            Actual Hours
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {task.actual_hours}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Assignees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {task.assignees.map((assignee) => (
                                        <div
                                            key={assignee.id}
                                            className="flex items-center space-x-4"
                                        >
                                            <div className="relative h-10 w-10 rounded-full bg-gray-100">
                                                <span className="absolute inset-0 flex items-center justify-center font-medium">
                                                    {assignee.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {assignee.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignee.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
