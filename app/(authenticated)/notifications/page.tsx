"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { NotificationList } from "@/components/notification-list";

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="bg-card rounded-lg shadow divide-y">
        <NotificationList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          showMarkAll={true}
          emptyText={
            isLoading ? "Loading notifications..." : "No notifications"
          }
        />
      </div>
    </div>
  );
}
