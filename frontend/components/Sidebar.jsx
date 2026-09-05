"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BotMessageSquare,
  Home,
  Zap,
  MessageSquare,
  Kanban,
  Cable,
  Package,
  CalendarDays,
  Users,
  Heart,
  Star,
  Repeat,
  Clock,
  ThumbsUp,
  Trash2,
  LogOut,
} from "lucide-react";
import { RailIcon } from "./ui-primitives";

import { useSocket } from "@/contexts/SocketContext";
import { apiFetch } from "@/lib/api";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Zap, label: "Automations", path: "/automation" },
  { icon: MessageSquare, label: "Inbox", path: "/inbox" },
  { icon: Kanban, label: "Pipeline", path: "/pipeline" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
];

export default function Sidebar({ onOpenProducts }) {
  const router = useRouter();
  const pathname = usePathname();

  const { pendingAttention } = useSocket();

  function handleLogout() {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    router.replace("/login");
  }

  return (
    <div className="flex h-full w-16 flex-col items-center justify-between border-r border-neutral-200 bg-white py-4">
      <div className="flex flex-col items-center gap-3">
        <RailIcon icon={BotMessageSquare} tone="brand" label="Hola !!!" />
        {NAV_ITEMS.map((item) => (
          <RailIcon
            key={item.path}
            icon={item.icon}
            active={pathname === item.path}
            label={item.label}
            onClick={() => router.push(item.path)}
            pulse={item.path === "/inbox" && pendingAttention}
          />
        ))}
        <RailIcon icon={Package} label="Products" onClick={onOpenProducts} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <RailIcon icon={LogOut} label="Log out" onClick={handleLogout} />
      </div>
    </div>
  );
}
