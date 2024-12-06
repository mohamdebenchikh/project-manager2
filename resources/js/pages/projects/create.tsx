import { useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Create({ auth }: PageProps) {
    const form = useForm({
        name: '',
        description: '',
    });

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(route('projects.store'));
    }

    return (
        <AuthenticatedLayout>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Create Project</h2>
                    <p className="text-muted-foreground">
                        Create a new project for your team
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Enter the details for your new project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="Enter project name"
                                    className='mt-2 block w-full'
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={e => form.setData('description', e.target.value)}
                                    placeholder="Enter project description"
                                    className='mt-2 block w-full'
                                />
                                {form.errors.description && <p className="mt-1 text-sm text-red-600">{form.errors.description}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    Create Project
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
