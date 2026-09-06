"use client";

import { Menu, Search } from "lucide-react";
import { Avatar } from "@/components/inbox/Avatar";
import { ChannelBadge } from "@/components/inbox/ChannelBadge";

export function ChatList({ chats, effectiveChatId, onSelectChat }) {
  return (
    <div className="flex h-full w-80 flex-col border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-3 px-4 pt-5">
        <Menu className="h-4 w-4 text-neutral-400" />
        <h2 className="text-sm font-semibold text-neutral-700">All</h2>
      </div>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-neutral-400" />
          <input
            placeholder="Search by chats and people"
            className="w-full bg-transparent text-xs text-neutral-600 placeholder-neutral-400 outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {chats.map((chat) => {
          const isActive = chat.id === effectiveChatId;
          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => onSelectChat(chat.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                isActive
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-transparent hover:bg-neutral-50"
              }`}
            >
              <div className="relative shrink-0">
                <Avatar name={chat.name} />
                <ChannelBadge channel={chat.channel} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-neutral-800">
                    {chat.name}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs text-neutral-400">
                    {chat.snippet}
                  </span>
                  {chat.unread > 0 && (
                    <span className="ml-2 flex h-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-semibold text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
