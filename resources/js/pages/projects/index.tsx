import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import ProjectCard from "@/components/project-card";

interface Project {
    id: number;
    name: string;
    description: string;
    user: {
        name: string;
        email: string;
    };
    team: {
        name: string;
    };
    created_at_formatted: string;
}

export default function Index({ auth, projects }: PageProps<{ projects: Project[] }>) {
    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
                        <p className="text-muted-foreground">
                            Manage your projects and track their progress
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href={route('projects.create')}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Project
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
