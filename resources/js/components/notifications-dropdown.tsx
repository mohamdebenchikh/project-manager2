import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageProps, Notification } from "@/types";
import { TeamInvitationNotification } from "./notifications/team-invitation-notification";
import { TeamMemberAddedNotification } from "./notifications/team-member-added-notification";
import { TeamMemberRemovedNotification } from "./notifications/team-member-removed-notification";
import { BaseNotification } from "./notifications/base-notification";

export default function NotificationsDropdown() {
    const { notifications } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    const markAsRead = (id: string) => {
        router.post(`/notifications/${id}/mark-as-read`, {}, {
            preserveScroll: true,
            preserveState: true,
            only: ["notifications"],
        });
    };

    const markAllAsRead = () => {
        router.post("/notifications/mark-all-as-read", {}, {
            preserveScroll: true,
            preserveState: true,
            only: ["notifications"],
        });
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        
        setOpen(false);
    };

    const handleInvitation = (notification: Notification, accept: boolean) => {
        const url = accept
            ? notification.data.accept_url
            : notification.data.decline_url;
        const method = accept ? 'get' : 'delete';

        router[method](url, {
            preserveScroll: true,
            preserveState: true,
            only: accept ? ['auth.teams', 'auth.current_team', 'notifications'] : ['notifications'],
        });
    };

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
                        onNotificationClick={() => handleNotificationClick(notification)}
                    />
                );
            case "TeamMemberRemoved":
                return (
                    <TeamMemberRemovedNotification 
                        notification={notification}
                        onNotificationClick={() => handleNotificationClick(notification)}
                    />
                );
            default:
                console.log('Unknown notification type:', notification);
                return (
                    <BaseNotification
                        notification={notification}
                        title="Notification"
                        message="You have a new notification"
                        onNotificationClick={() => handleNotificationClick(notification)}
                    />
                );
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.unread_count > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {notifications.unread_count}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <h4 className="font-medium">Notifications</h4>
                    {notifications.unread_count > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 flex items-center gap-1"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                    {notifications.items.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.items.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start gap-2 p-4 cursor-default ${
                                    !notification.read_at ? "bg-accent" : ""
                                }`}
                            >
                                <div className="flex-1">
                                    {renderNotificationContent(notification)}
                                </div>
                                {!notification.read_at && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
