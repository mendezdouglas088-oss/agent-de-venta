"use client";

import { useMemo, useState } from "react";
import {
  ClipboardClock,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Users,
  Calendar,
  MessageSquare,
  Package,
  Repeat,
  Phone,
  Send,
} from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${String(date.getDate()).padStart(2, "0")} ${
    MONTHS[date.getMonth()]
  }, ${date.getFullYear()}`;
}

export function PublicationCard({
  publication,
  products,
  groups,
  onToggleActive,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pubProducts = useMemo(
    () =>
      publication.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean),
    [publication.productIds, products],
  );

  const pubGroups = useMemo(
    () =>
      publication.groupIds
        .map((id) => groups.find((g) => g.id === id))
        .filter(Boolean),
    [publication.groupIds, groups],
  );

  // Pick 3 random product thumbnails, stable across re-renders of this card.
  const thumbs = useMemo(() => {
    const arr = [...pubProducts];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publication.id]);

  const channels = [...new Set(pubGroups.map((g) => g.channel))];

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-xl mx-1">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-emerald-600 text-white">
            <ClipboardClock className="h-5 w-5" />
          </div>
          <p
            title={publication.name}
            className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50"
          >
            {publication.name}
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleActive(publication.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              publication.active
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            }`}
          >
            {publication.active ? "Active" : "Inactive"}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-40 mt-2 w-44 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(publication);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(publication.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete publication
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3 product thumbnails */}
      <div className="mt-4 grid h-28 grid-cols-3 gap-1 overflow-hidden rounded-xl">
        {[0, 1, 2].map((i) => {
          const p = thumbs[i];
          return (
            <div
              key={i}
              className={`flex items-center justify-center overflow-hidden ${
                p ? p.color : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {p?.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Caption / headline */}
      <p className="mt-4 line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
        {publication.caption || publication.name}
      </p>

      {/* Channels */}
      {channels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {channels.map((ch) => (
            <span
              key={ch}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                ch === "whatsapp"
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
              }`}
            >
              {ch === "whatsapp" ? (
                <Phone className="h-3 w-3" />
              ) : (
                <Send className="h-3 w-3" />
              )}
              {ch === "whatsapp" ? "WhatsApp" : "Telegram"}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          {publication.groupIds.length} group
          {publication.groupIds.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          Created {formatDate(publication.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          {publication.messagesCount} message
          {publication.messagesCount === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          {publication.productIds.length} product
          {publication.productIds.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
          Published {publication.timesPublished} time
          {publication.timesPublished === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
