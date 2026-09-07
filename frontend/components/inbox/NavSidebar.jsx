"use client";

import {
  Plus,
  ChevronDown,
  ChevronRight,
  Archive,
  Hash,
  AtSign,
  FolderOpen,
  FileText,
  MessageSquare,
  Star,
  UserPlus,
  Inbox,
  X,
} from "lucide-react";
import { Avatar } from "@/components/inbox/Avatar";

const MAIN_MENU = [
  { key: "channels", label: "Channels", icon: Hash },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "mentions", label: "Mentions", icon: AtSign },
  { key: "files", label: "Files & Media", icon: FolderOpen },
];

const NEGOTIATION_SUBCATEGORIES = ["All", "Urgent", "Completed"];

const CONTACTS = [
  "Nayla Barghese",
  "Sofia Ahmed",
  "Mark Buffalo",
  "Patrick Shwayne",
  "Liang li",
];

export function NavSidebar({
  effectiveAccountName,
  activeSection, // "chats" | "channels" | "mentions"
  onSectionChange,
  activeFilter,
  onFilterChange,
  unreadTotal = 0,
  newCount = 0,
  negotiationsOpen,
  onToggleNegotiations,
  onAddUser,
  onAccountClick,
  open = true,
  onClose,
}) {
  const conversationFilters = [
    { key: "all", label: "All", icon: MessageSquare, count: unreadTotal },
    { key: "new", label: "New", icon: Inbox, count: newCount },
    { key: "assigned", label: "Assigned", icon: UserPlus, count: null },
    { key: "favourites", label: "Favourites", icon: Star, count: null },
  ];

  return (
    // Ocupa espacio real en el layout (no es un overlay): al abrirse/cerrarse
    // empuja/libera espacio para ChatList y ChatView, que son sus hermanos
    // en el flex del Inbox.
    <div
      className={`h-full shrink-0 overflow-hidden border-r border-neutral-200 bg-white transition-[width] duration-300 ease-in-out dark:border-neutral-700 dark:bg-neutral-900 ${
        open ? "w-64" : "w-0 border-transparent"
      }`}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="flex items-center justify-between px-5 pt-5">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Inbox
          </h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
              onClick={onAddUser}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 flex items-center gap-2.5 px-5"
          onClick={onAccountClick}
        >
          <Avatar name={effectiveAccountName || "?"} size="h-8 w-8" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {effectiveAccountName}
          </span>
        </button>

        <div className="mt-6 flex-1 overflow-y-auto px-3">
          <div className="space-y-0.5">
            {MAIN_MENU.map((item) => {
              const clickable =
                item.key === "channels" || item.key === "mentions";
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onSectionChange(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : clickable
                        ? "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                        : "cursor-default text-neutral-300 dark:text-neutral-600"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <p className="mt-6 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
            Conversations
          </p>
          <div className="mt-1.5 space-y-0.5">
            {conversationFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterChange(f.key)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm ${
                  activeSection === "chats" && activeFilter === f.key
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </span>
                {f.count !== null && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {f.count}
                  </span>
                )}
              </button>
            ))}

            <div>
              <button
                type="button"
                onClick={onToggleNegotiations}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                <span className="flex items-center gap-3">
                  {negotiationsOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  Negotiations
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  20
                </span>
              </button>
              {negotiationsOpen && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l border-neutral-100 dark:border-neutral-800 pl-3">
                  {NEGOTIATION_SUBCATEGORIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              <span className="flex items-center gap-3">
                <ChevronRight className="h-3.5 w-3.5" />
                Closed
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                145
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              <span className="flex items-center gap-3">
                <Archive className="h-3.5 w-3.5" />
                Archives
              </span>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                32
              </span>
            </button>
          </div>

          <p className="mt-6 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-300 dark:text-neutral-600">
            Contacts
          </p>
          <div className="mb-4 mt-1.5 space-y-0.5">
            {CONTACTS.map((name) => (
              <button
                key={name}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                <Avatar name={name} size="h-6 w-6" />
                {name}
              </button>
            ))}
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
