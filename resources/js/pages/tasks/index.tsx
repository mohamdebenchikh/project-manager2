import { PageProps } from "@/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickTaskDialog } from "@/components/tasks/quick-task-dialog";

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
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "review" | "completed" | "closed";
    due_date_formatted: string;
    project: Project | null;
    assignees: User[];
    created_at_formatted: string;
}

interface Props extends PageProps {
    tasks: Task[];
    filters: {
        status: string | null;
        priority: string | null;
        search: string | null;
    };
    statuses: string[];
    priorities: string[];
}

export default function Index({
    tasks,
    filters,
    statuses,
    priorities,
}: Props) {
    const columns: ColumnDef<Task>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <Link
                    href={route("tasks.show", row.original.id)}
                    className="text-blue-600 hover:underline"
                >
                    {row.getValue("title")}
                </Link>
            ),
        },
        {
            accessorKey: "project",
            header: "Project",
            cell: ({ row }) => row.original.project?.name || "No Project",
        },
        {
            accessorKey: "assignees",
            header: "Assignees",
            cell: ({ row }) => (
                <div className="flex -space-x-2">
                    {row.original.assignees.map((assignee) => (
                        <div
                            key={assignee.id}
                            className="h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center"
                            title={assignee.name}
                        >
                            {assignee.name.charAt(0)}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as Task["priority"];
                return (
                    <Badge
                        variant="secondary"
                        className={`${
                            priority === "urgent"
                                ? "bg-red-100 text-red-800"
                                : priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : priority === "medium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {priority.toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as Task["status"];
                return (
                    <Badge
                        variant="secondary"
                        className={`${
                            status === "completed"
                                ? "bg-green-100 text-green-800"
                                : status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : status === "review"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {status.replace("_", " ").toUpperCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "due_date_formatted",
            header: "Due Date",
        },
        {
            accessorKey: "created_at_formatted",
            header: "Created",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const task = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={route("tasks.edit", task.id)}
                                    className="flex items-center"
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center text-red-600 focus:text-red-600"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this task?")) {
                                        router.delete(route("tasks.destroy", task.id));
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const filterableColumns = [
        {
            id: "status",
            title: "Status",
            options: statuses.map((status) => ({
                label: status.replace("_", " ").toUpperCase(),
                value: status,
            })),
        },
        {
            id: "priority",
            title: "Priority",
            options: priorities.map((priority) => ({
                label: priority.toUpperCase(),
                value: priority,
            })),
        },
    ];

    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-x-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <QuickTaskDialog />
                </div>

                <DataTable
                    columns={columns}
                    data={tasks}
                    searchKey="title"
                    filterableColumns={filterableColumns}
                />
            </div>
        </AuthenticatedLayout>
    );
}