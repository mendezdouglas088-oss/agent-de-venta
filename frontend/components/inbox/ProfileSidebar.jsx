"use client";

import {
  Copy,
  Edit3,
  Flag,
  Clock,
  Calendar,
  Bell,
  MessageCircle,
  UserPlus,
  Ban,
  ExternalLink,
} from "lucide-react";
import { Avatar } from "@/components/inbox/Avatar";

export function ProfileSidebar({ activeChat }) {
  return (
    <div className="flex h-full w-72 flex-col overflow-y-auto border-l border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-5">
      <div className="flex flex-col items-center text-center">
        <Avatar name={activeChat.name} size="h-16 w-16" />
        <h3 className="mt-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {activeChat.name}
        </h3>

        <a
          href="#"
          className="mt-0.5 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
        >
          https://desig.com/sta
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="rounded-full bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
        >
          Unsubscribe
        </button>
      </div>

      <div className="mt-5 space-y-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Status
          </span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Active</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <Flag className="h-3.5 w-3.5" />
            Appeals
          </span>
          <span className="font-medium text-neutral-600 dark:text-neutral-300">2</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            Last Contact
          </span>
          <span className="font-medium text-neutral-600 dark:text-neutral-300">1hr ago</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            Subscribed
          </span>
          <span className="font-medium text-neutral-600 dark:text-neutral-300">9 Days ago</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
          Notifications
        </p>
        <div className="mt-2 space-y-3">
          {[
            { icon: Bell, event: "5 Deals Pending", time: "Just now" },
            {
              icon: MessageCircle,
              event: "New Message",
              time: "12 hours ago",
            },
            {
              icon: UserPlus,
              event: "New user registered",
              time: "59 minutes ago",
            },
          ].map((n) => (
            <div key={n.event} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                <n.icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                  {n.event}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-2 mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
          User Settings
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between rounded-lg px-1 py-2">
            <span className="flex items-center gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <Bell className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
              Notifications
            </span>
            <span className="flex h-5 w-9 items-center rounded-full bg-emerald-500 p-0.5">
              <span className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
            </span>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Flag className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            Report
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Ban className="h-3.5 w-3.5" />
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
