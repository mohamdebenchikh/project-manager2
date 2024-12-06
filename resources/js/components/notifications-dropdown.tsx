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
import { useToast } from "@/hooks/use-toast";

export default function NotificationsDropdown() {
    const { notifications } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

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

        // Handle special case for team invitations
        if (notification.type === "TeamInvitation") {
            return;
        }

        // Navigate to action URL if present
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
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
        const commonContent = (title: string, message: string) => (
            <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-medium">{title}</span>
                    <span className="text-xs text-muted-foreground">
                        {notification.created_at}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        );

        switch (notification.type) {
            case "TeamInvitation":
                return (
                    <>
                        {commonContent("Team Invitation", 
                            `You have been invited to join ${notification.data.team_name} as a ${notification.data.role}`
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleInvitation(notification, true)}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleInvitation(notification, false)}
                            >
                                Decline
                            </Button>
                        </div>
                    </>
                );
            case "TeamMemberAdded":
                return commonContent("Team Member Added", 
                    `You have been added to ${notification.data.team_name}`
                );
            case "TeamMemberRemoved":
                return commonContent("Team Member Removed", 
                    `You have been removed from ${notification.data.team_name}`
                );
            default:
                console.log('Unknown notification type:', notification);
                return commonContent("Notification", "You have a new notification");
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
                <div className="max-h-96 overflow-y-auto">
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
                                onClick={() => handleNotificationClick(notification)}
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
