import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";

export default function Invitations() {
    return (
        <AuthenticatedLayout header=" Invitations">
            <Head title=" Invitations" />
            <div className="flex items-center justify-between space-x-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    Invitations
                </h2>
            </div>
        </AuthenticatedLayout>
    );
}
