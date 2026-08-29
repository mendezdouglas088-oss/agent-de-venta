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
          />
        ))}
        <RailIcon icon={Package} label="Products" onClick={onOpenProducts} />
        {/* <RailIcon icon={Users} label="Contacts" />
        <RailIcon icon={Heart} label="Favorites" />
        <RailIcon icon={Star} label="Starred" />
        <RailIcon icon={Repeat} label="History" />
        <RailIcon icon={Clock} label="Recent" />
        <RailIcon icon={ThumbsUp} label="Approved" />
        <RailIcon icon={Trash2} label="Trash" /> */}
      </div>

      <div className="flex flex-col items-center gap-3">
        <RailIcon icon={LogOut} label="Logout" />
      </div>
    </div>
  );
}
