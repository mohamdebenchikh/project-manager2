import { useForm } from "@inertiajs/react";
import { PageProps } from "@/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Pencil, Trash2, FolderKanban, CheckSquare, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "@inertiajs/react";
import { useState } from "react";

interface Task {
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date_formatted: string | null;
}

interface Project {
    id: number;
    name: string;
    description: string | null;
    status: string;
    created_at_formatted: string;
    task_count: number;
    tasks: Task[];
    team: {
        name: string;
    };
    user: {
        name: string;
        email: string;
    };
}

interface ProjectForm {
    name: string;
    description: string;
}

export default function Show({ project }: PageProps<{ project: Project }>) {
    const [editing, setEditing] = useState(false);
    const form = useForm<ProjectForm>({
        name: project.name,
        description: project.description || "",
    });

    const deleteForm = useForm({});

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(route("projects.update", project.id), {
            onSuccess: () => setEditing(false),
        });
    }

    function onDelete() {
        deleteForm.delete(route("projects.destroy", project.id));
    }

    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {project.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {project.description || "No description provided"}
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
                                        Delete Project
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        project? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
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

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                    {project.description || "No description provided"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Team</h4>
                                <p className="text-sm text-muted-foreground">
                                    {project.team.name}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Created By</h4>
                                <p className="text-sm text-muted-foreground">
                                    {project.user.name}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">Created At</h4>
                                <p className="text-sm text-muted-foreground">
                                    {project.created_at_formatted}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Tasks</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                >
                                    <Link href={route("tasks.create", { project: project.id })}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Task
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {project.tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No tasks yet
                                    </p>
                                ) : (
                                    project.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between"
                                        >
                                            <Link
                                                href={route("tasks.show", task.id)}
                                                className="flex items-center space-x-2 hover:underline"
                                            >
                                                <CheckSquare className="h-4 w-4" />
                                                <span>{task.title}</span>
                                            </Link>
                                            <div className="flex items-center space-x-2">
                                                {task.due_date_formatted && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Due {task.due_date_formatted}
                                                    </span>
                                                )}
                                                <Badge variant="secondary">
                                                    {task.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {editing ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Project</CardTitle>
                            <CardDescription>
                                Update your project details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData("name", e.target.value)
                                        }
                                        className="mt-2 block w-full"
                                    />
                                    {form.errors.name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="mt-2 block w-full"
                                    />
                                    {form.errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {form.errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>
                                View and manage your project information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium">Created By</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {project.user.name} (
                                        {project.user.email})
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium">Team</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {project.team.name}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
