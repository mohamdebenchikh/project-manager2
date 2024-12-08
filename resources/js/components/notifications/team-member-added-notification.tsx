import React from "react";
import { router } from "@inertiajs/react";
import { Notification } from "@/types";

interface TeamMemberAddedNotificationProps {
    notification: Notification;
    onNotificationClick: () => void;
}

export function TeamMemberAddedNotification({ 
    notification,
    onNotificationClick 
}: TeamMemberAddedNotificationProps) {
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
                <span className="font-medium">Team Member Added</span>
                <span className="text-xs text-muted-foreground">
                    {notification.created_at}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                You have been added to {notification.data.team_name}
            </p>
        </div>
    );
}
