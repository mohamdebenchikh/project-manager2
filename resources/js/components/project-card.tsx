import { Link } from "@inertiajs/react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, CheckSquare } from "lucide-react";

interface Project {
    id: number;
    name: string;
    description: string | null;
    status: string;
    created_at_formatted: string;
    task_count: number;
}

export default function ProjectCard({ project }: { project: Project }) {
    const statusColors = {
        active: "bg-green-500",
        inactive: "bg-gray-500",
        archived: "bg-red-500",
    };

    return (
        <Card className="hover:border-primary/50 transition-colors">
            <Link href={route("projects.show", project.id)}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <FolderKanban className="h-5 w-5" />
                            <h3 className="font-semibold">{project.name}</h3>
                        </div>
                        <Badge
                            variant="secondary"
                            className={
                                statusColors[
                                    project.status as keyof typeof statusColors
                                ]
                            }
                        >
                            {project.status}
                        </Badge>
                    </div>
                    {project.description && (
                        <p className="text-sm text-muted-foreground">
                            {project.description}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4" />
                        <span>{project.task_count} tasks</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        Created {project.created_at_formatted}
                    </p>
                </CardFooter>
            </Link>
        </Card>
    );
}
