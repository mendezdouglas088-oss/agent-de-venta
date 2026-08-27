"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { Avatar } from "./ui-primitives";

const CURRENT_USER = { name: "Adib Hussain" };
const UNREAD_NOTIFICATIONS = 3;

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-neutral-200 bg-white px-6">
      <button
        type="button"
        onClick={() => router.push("/notifications")}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${
          pathname === "/notifications"
            ? "bg-neutral-900 text-white"
            : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        }`}
      >
        <Bell className="h-4 w-4" />
        {UNREAD_NOTIFICATIONS > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
            {UNREAD_NOTIFICATIONS}
          </span>
        )}
      </button>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
      >
        <Settings className="h-4 w-4" />
      </button>
      <Avatar name={CURRENT_USER.name} size="h-8 w-8" />
    </div>
  );
}
