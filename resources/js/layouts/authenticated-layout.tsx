import { PropsWithChildren, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import AppearanceDropdown from "@/components/appearance-dropdown";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import TeamSelector from "@/components/team-selector";
import NotificationsDropdown from "@/components/notifications-dropdown";
import { Toaster } from "@/components/ui/toaster";

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{
    header?: ReactNode;
}>) {
    const { auth } = usePage<PageProps>().props;

    return (
        <SidebarProvider>
            <AppSidebar  />

            <SidebarInset>
                <header className="sticky top-0 bg-background flex h-16 shrink-0 items-center gap-2 justify-between p-4 border-b md:border-none md:rounded-xl">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{header}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-4">
                        <TeamSelector
                            teams={auth.teams}
                            currentTeam={auth.current_team}
                        />
                        <NotificationsDropdown />
                        <AppearanceDropdown />
                    </div>
                </header>

                <main className="p-4 md:pt-0 h-full">{children}
                </main>
                <Toaster />

            </SidebarInset>
        </SidebarProvider>
    );
}
