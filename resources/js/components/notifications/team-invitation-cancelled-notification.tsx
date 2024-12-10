import React from "react";
import { router } from "@inertiajs/react";
import { Notification } from "@/types";

interface TeamInvitationCancelledNotificationProps {
    notification: Notification;
    onNotificationClick: () => void;
}

export function TeamInvitationCancelledNotification({ 
    notification,
    onNotificationClick 
}: TeamInvitationCancelledNotificationProps) {
    const handleClick = () => {
        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
        onNotificationClick();
    };

    return (
        <div 
            className="flex  flex-col space-y-1 cursor-pointer" 
            onClick={handleClick}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-medium">Team Invitation Cancelled</span>
                <span className="text-xs text-muted-foreground">
                    {notification.created_at}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                Your invitation to {notification.data.team_name} has been cancelled
            </p>
        </div>
    );
}
