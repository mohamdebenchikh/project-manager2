import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        personal_team: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("teams.store"));
    };

    return (
        <AuthenticatedLayout header="Create Team">
            <Head title="Create Team" />

            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between space-y-0">
                        <div className="space-y-0.5">
                            <Label>Personal Team</Label>
                            <div className="text-sm text-muted-foreground">
                                Personal teams have unlimited member capacity and can't be deactivated
                            </div>
                        </div>
                        <Switch
                            checked={data.personal_team}
                            onCheckedChange={(checked) => setData("personal_team", checked)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Create Team
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
