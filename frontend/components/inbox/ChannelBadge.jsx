"use client";

import { Send, Phone } from "lucide-react";

export function ChannelBadge({ channel }) {
  const isTelegram = channel === "telegram";
  const Icon = isTelegram ? Send : Phone;
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white dark:border-neutral-900 ${
        isTelegram ? "bg-sky-500" : "bg-emerald-500"
      }`}
    >
      <Icon className="h-2 w-2 text-white" />
    </span>
  );
}
