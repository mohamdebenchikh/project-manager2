import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface TeamInvitationNotificationProps {
    notification: Notification;
}

export function TeamInvitationNotification({
    notification,
}: TeamInvitationNotificationProps) {
    const { toast } = useToast();

    const handleSuccess = (page: any) => {
        const description = page.props.flash.success ?? "Invitation accepted";
        toast({
            title: "Success",
            description: description,
        });
    };

    const handleError = (errors: any) => {
        toast({
            title: "Error",
            description: errors.error ?? "Something went wrong",
            variant: "destructive",
        });
    };

    const handleAccept = () => {
        router.post(
            notification.data.accept_url,
            {},
            {
                onSuccess: (page: any) => handleSuccess(page),
                onError: handleError,
            }
        );
    };

    const handleDecline = () => {
        router.post(
            notification.data.decline_url,
            {},
            {
                onSuccess: (page: any) => handleSuccess(page),
                onError: (errors: any) => handleError(errors),
            }
        );
    };

    return (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
                <span className="font-medium">Team Invitation</span>
                <span className="text-xs text-muted-foreground">
                    {notification.created_at}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">
                You have been invited to join {notification.data.team_name} as a{" "}
                {notification.data.role}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <Button
                    variant="default"
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleAccept}
                >
                    Accept
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleDecline}
                >
                    Decline
                </Button>
            </div>
        </div>
    );
}
