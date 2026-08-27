"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Kanban,
  CalendarDays,
  MessageSquare,
  Cable,
  Check,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const TYPE_META = {
  automation: { icon: Zap, color: "emerald", route: "/automation" },
  pipeline: { icon: Kanban, color: "sky", route: "/pipeline" },
  appointment: { icon: CalendarDays, color: "violet", route: "/calendar" },
  message: { icon: MessageSquare, color: "amber", route: "/inbox" },
  connection: { icon: Cable, color: "rose", route: "/inbox" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "automation", label: "Automations" },
  { key: "pipeline", label: "Pipeline" },
  { key: "appointment", label: "Appointments" },
  { key: "message", label: "Messages" },
  { key: "connection", label: "Connections" },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "automation",
    title: "Automation triggered",
    description:
      '"Product drops - Flash Offers" replied automatically to Leonard Kayle',
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "pipeline",
    title: "Lead moved to Negotiation",
    description: "Pharah House advanced to the Negotiation stage",
    time: "32 min ago",
    read: false,
  },
  {
    id: 3,
    type: "appointment",
    title: "Appointment booked",
    description: "Leslie Winkle scheduled a call for Aug 28, 9:00 AM",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    type: "message",
    title: "New message",
    description: "Richard Hammon sent a message on Telegram",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "connection",
    title: "WhatsApp session expiring soon",
    description: "Reconnect your WhatsApp account to avoid interruptions",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 6,
    type: "automation",
    title: "Automation triggered",
    description:
      '"Appointment booking - VIP Sales" replied automatically to Pharah House',
    time: "Yesterday",
    read: true,
  },
];

function NotificationRow({ notification, onClick }) {
  const meta = TYPE_META[notification.type];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${
        notification.read
          ? "border-neutral-200 bg-white"
          : "border-emerald-200 bg-emerald-50/40"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-${meta.color}-50 text-${meta.color}-600`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-sm ${notification.read ? "font-medium text-neutral-700" : "font-semibold text-neutral-900"}`}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-neutral-400">
            {notification.time}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">
          {notification.description}
        </p>
      </div>
      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");

  const visible = notifications.filter(
    (n) => activeFilter === "all" || n.type === activeFilter,
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleRowClick(notification) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );
    router.push(TYPE_META[notification.type].route);
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">
                  Notifications
                </h1>
                <p className="mt-1 text-sm text-neutral-400">
                  {unreadCount} unread
                </p>
              </div>
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    activeFilter === f.key
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="max-w-2xl space-y-2">
              {visible.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => handleRowClick(n)}
                />
              ))}
              {visible.length === 0 && (
                <p className="text-sm text-neutral-400">Nothing here yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
