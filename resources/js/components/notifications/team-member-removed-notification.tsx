import React from "react";
import { router } from "@inertiajs/react";
import { Notification } from "@/types";

interface TeamMemberRemovedNotificationProps {
    notification: Notification;
    onNotificationClick: () => void;
}

export function TeamMemberRemovedNotification({ 
    notification,
    onNotificationClick 
}: TeamMemberRemovedNotificationProps) {
    const handleClick = () => {
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
        onNotificationClick();
    };

    return (
        <div 
            className="flex flex-col space-y-1 cursor-pointer" 
            onClick={handleClick}
        >
            <div className="flex items-center justify-between">
                <span className="font-medium">Team Member Removed</span>
                <span className="text-xs text-muted-foreground">
                    {notification.created_at}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                You have been removed from {notification.data.team_name}
            </p>
        </div>
    );
}
