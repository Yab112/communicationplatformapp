import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

export type Notification = {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  relatedId?: string;
};

type NotificationListProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead?: () => void;
  showMarkAll?: boolean;
  emptyText?: string;
  title?: string;
};

const getIcon = (type: string) => {
  switch (type) {
    case "alert":
      return <AlertTriangle className="text-yellow-600 w-5 h-5 mt-1" />;
    case "info":
    default:
      return <Info className="text-blue-600 w-5 h-5 mt-1" />;
  }
};

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  showMarkAll = false,
  emptyText = "No notifications",
  title = "Notifications",
}: NotificationListProps) {
  return (
    <div>
      <div className="flex justify-between items-center px-4 pt-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showMarkAll && onMarkAllAsRead && notifications.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkAllAsRead}
            className="cursor-pointer"
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <ul
          className="max-h-96 overflow-y-auto divide-y"
          aria-label="Notification list"
        >
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.isRead ? "bg-primary/10 font-semibold" : "bg-background"
              }`}
              onClick={() => onMarkAsRead(notification.id)}
              aria-label={`Notification: ${notification.content}`}
            >
              {getIcon(notification.type)}

              <div className="flex-1">
                <p className="text-sm">{notification.content}</p>
                <p
                  className="text-xs text-muted-foreground"
                  title={format(new Date(notification.createdAt), "PPpp")}
                >
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {!notification.isRead && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Mark notification as read"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
