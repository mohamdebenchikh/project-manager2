import React from "react";
import { Notification } from "@/types";

interface DefaultNotificationProps {
    notification: Notification;
    onNotificationClick: () => void;
}

export default function DefaultNotification({
    notification,
    onNotificationClick,
}: DefaultNotificationProps) {
    const handleClick = () => {
        if (notification.data.action_url) {
            onNotificationClick();
        }
    };

    return (
        <div className="flex flex-col space-y-1 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{notification.data.title || "Notification"}</span>
                <span className="text-xs text-muted-foreground">{notification.created_at}</span>
            </div>
            <p className="text-sm text-muted-foreground">{notification.data.message || "You have a new notification."}</p>
        </div>
    );
}
