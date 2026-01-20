import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNotifications } from "../context/NotificationContext.tsx";
import { CheckIcon, TrashIcon, BellIcon } from "@heroicons/react/24/outline";

interface NotificationsDropdownProps {
  variant?: "desktop" | "mobile";
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  variant = "desktop",
}) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        bellRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  const handleMarkAsRead = useCallback((id: string) => markAsRead(id), [markAsRead]);
  const handleDelete = useCallback((id: string) => deleteNotification(id), [
    deleteNotification,
  ]);

  return (
    <div className="relative w-full">
      {/* Bell Icon */}
      <button
        ref={bellRef}
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
      >
        <BellIcon className="w-6 h-6 text-text-light dark:text-text-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          role="menu"
          className={`bg-white border rounded-2xl shadow-2xl max-h-[32rem] overflow-y-auto z-50 ${
            variant === "desktop"
              ? "fixed w-80 sm:w-96 right-4 top-16"
              : "relative mt-2 w-full"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-2xl">
            <h4 className="font-semibold text-gray-800 text-base">Notifications</h4>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckIcon className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification Items */}
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">
              No notifications
            </p>
          ) : (
            <div className="p-2 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start p-3 rounded-xl shadow hover:shadow-md transition bg-white border ${
                    !n.read ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  {!n.read && (
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-1 mr-3 flex-shrink-0" />
                  )}

                  <span
                    onClick={() => handleMarkAsRead(n._id)}
                    className={`flex-1 text-gray-700 text-sm cursor-pointer ${
                      n.read ? "opacity-80" : "font-medium"
                    }`}
                  >
                    {n.message}
                  </span>

                  <button
                    aria-label="Delete notification"
                    onClick={() => handleDelete(n._id)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition rounded-full p-1 flex-shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Clear All */}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="w-full text-center text-sm text-red-500 p-3 hover:bg-gray-100 rounded-b-2xl font-medium transition"
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
