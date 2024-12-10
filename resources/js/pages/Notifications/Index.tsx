import { Head, router } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TeamInvitationNotification } from "@/components/notifications/team-invitation-notification";
import { TeamMemberAddedNotification } from "@/components/notifications/team-member-added-notification";
import { TeamMemberRemovedNotification } from "@/components/notifications/team-member-removed-notification";
import { TeamInvitationCancelledNotification } from "@/components/notifications/team-invitation-cancelled-notification";
import { BaseNotification } from "@/components/notifications/base-notification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Notification, PageProps } from "@/types";
import AuthenticatedLayout from "@/layouts/authenticated-layout";

export default function Index({ 
    auth,
    notifications 
}: PageProps) {
    const allNotifications = notifications.items;
    const unreadNotifications = allNotifications.filter(n => !n.read_at);
    const readNotifications = allNotifications.filter(n => n.read_at);

    const renderNotificationContent = (notification: Notification) => {
        switch (notification.type) {
            case "TeamInvitation":
                return (
                    <TeamInvitationNotification
                        notification={notification}
                    />
                );
            case "TeamMemberAdded":
                return (
                    <TeamMemberAddedNotification 
                        notification={notification}
                        onNotificationClick={() => {}}
                    />
                );
            case "TeamMemberRemoved":
                return (
                    <TeamMemberRemovedNotification 
                        notification={notification}
                        onNotificationClick={() => {}}
                    />
                );
            case "TeamInvitationCancelled":
                return (
                    <TeamInvitationCancelledNotification 
                        notification={notification}
                        onNotificationClick={() => {}}
                    />
                );
            default:
                return (
                    <BaseNotification
                        notification={notification}
                        title="Notification"
                        message="You have a new notification"
                        onNotificationClick={() => {}}
                    />
                );
        }
    };

    const handleDelete = (id: string) => {
        router.delete(route('notifications.destroy', { id }), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const NotificationList = ({ notifications }: { notifications: Notification[] }) => (
        <div className="space-y-4">
            {notifications.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    No notifications
                </div>
            ) : (
                notifications.map((notification) => (
                    <Card key={notification.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between gap-4 md:gap-8">
                                <div className="flex-1">
                                    {renderNotificationContent(notification)}
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    return (
        <AuthenticatedLayout header="Notifications">
            <Head title="Notifications" />

            <div className="container py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Notifications</h1>
                    {unreadNotifications.length > 0 && (
                        <Badge variant="destructive">
                            {unreadNotifications.length} unread
                        </Badge>
                    )}
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="all">
                            All
                            <Badge variant="secondary" className="ml-2">
                                {allNotifications.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread
                            <Badge variant="secondary" className="ml-2">
                                {unreadNotifications.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="read">
                            Read
                            <Badge variant="secondary" className="ml-2">
                                {readNotifications.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                        <NotificationList notifications={allNotifications} />
                    </TabsContent>
                    <TabsContent value="unread">
                        <NotificationList notifications={unreadNotifications} />
                    </TabsContent>
                    <TabsContent value="read">
                        <NotificationList notifications={readNotifications} />
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
