import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext.tsx";

interface NotificationsDropdownProps {
  variant?: "desktop" | "mobile";
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ variant = "desktop" }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside); 
    document.addEventListener("touchstart", handleClickOutside); 

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Bell Icon */}
      <button
        ref={bellRef}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className={`bg-white border rounded-xl shadow-xl max-h-[32rem] overflow-y-auto transition-all z-50 ${variant === "desktop"
            ? "fixed w-80 sm:w-96 right-4 top-16"
            : "mt-2 w-full"
            }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-xl">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Notifications</h4>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm text-blue-600 hover:underline transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification Items */}
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start p-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition`}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  )}

                  {/* Message */}
                  <span
                    onClick={() => markAsRead(n._id)}
                    className={`flex-1 text-gray-700 text-sm sm:text-base ${n.read ? "opacity-70" : ""}`}
                  >
                    {n.message}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="text-red-500 text-xs sm:text-sm hover:text-red-600 transition ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Clear All */}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="w-full text-center text-sm sm:text-base text-red-500 p-3 hover:bg-gray-100 transition rounded-b-xl font-medium"
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
