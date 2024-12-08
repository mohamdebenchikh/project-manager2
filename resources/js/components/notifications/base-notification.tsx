import React from "react";
import { router } from "@inertiajs/react";
import { Notification } from "@/types";

interface BaseNotificationProps {
    notification: Notification;
    title: string;
    message: string;
    onNotificationClick: () => void;
}

export function BaseNotification({ 
    notification, 
    title, 
    message,
    onNotificationClick 
}: BaseNotificationProps) {
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
                <span className="font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">
                    {notification.created_at}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
