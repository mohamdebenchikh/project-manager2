import { useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { Bell, CheckCheck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageProps, Notification } from "@/types";
import DefaultNotification from "./notifications/default-notification";

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
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
        setOpen(false);
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
            <DropdownMenuContent align="end" className="w-96">
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
                <div className="max-h-96 w-full space-y-1 overflow-y-auto overflow-x-hidden">
                    {notifications.items.length === 0 ? (
                        <div className=" text-sm text-muted-foreground">
                            No unread notifications
                        </div>
                    ) : (
                        notifications.items.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col justify-start items-start p-4 cursor-default bg-accent"
                            >
                                <DefaultNotification
                                    notification={notification}
                                    onNotificationClick={() => handleNotificationClick(notification)}
                                />
                                <button
                                    className="text-xs text-muted-foreground hover:text-primary-foreground underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                    }}
                                >
                                    Mark as read
                                </button>
                            </DropdownMenuItem>
                        ))
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link
                            href={route("notifications.index")}
                            className="flex justify-center items-center py-2"
                        >
                            View all notifications
                        </Link>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
