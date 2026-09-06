"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquareText,
  CheckCircle2,
  UserPlus,
  Bookmark,
  Inbox,
  Paperclip,
  ExternalLink,
  Check,
  Plus,
  Smile,
  Ellipsis,
  Mic,
  Send,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { MediaAttachment } from "./MediaAttachment";

import { MessageOptionsMenu } from "./MessageOptionsMenu";

export function ChatView({
  messages,
  activeChat,
  effectiveAccountId,
  onOpenPostModal,
  onMessageSent,
  isTyping,
  onReply,
  onForward,
  effectiveAccountName,
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [activeChat?.id, messages]);

  function handleCopy(m) {
    navigator.clipboard?.writeText(m.text ?? "");
    setOpenMenuId(null);
  }
  console.log("chatview messages", {
    connectionId: effectiveAccountId,
    chatId: activeChat?.id,
    message: messageDraft,
  });
  const realChatId = activeChat?.id?.includes("::")
    ? activeChat.id.split("::")[1]
    : activeChat?.id;
  async function handleSendMessage() {
    if (!messageDraft.trim()) return;
    const text = messageDraft;
    setMessageDraft("");

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      side: "out",
      from: effectiveAccountName,
      text,
      timestamp: Date.now(), // nuevo
      meta: "Enviando...",
    };
    onMessageSent?.(optimisticMsg);

    try {
      const res = await apiFetch("/whatsapp/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: effectiveAccountId,
          chatId: realChatId,
          message: text,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to send message");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-neutral-50">
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageSquareText />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Move to Closed
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Not assigned
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <UserPlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setBookmarked((v) => !v)}
            className={`rounded-lg p-1.5 ${bookmarked ? "text-emerald-500" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"}`}
          >
            <Bookmark
              className="h-4 w-4"
              fill={bookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-neutral-300">
            <Inbox className="mb-2 h-8 w-8" />
            <p className="text-sm">
              No sample messages for this contact in the demo.
            </p>
          </div>
        )}
        {messages.map((m) =>
          m.side === "in" ? (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-md">
                <div className="mb-1 flex items-center justify-start gap-2 text-xs text-neutral-400">
                  <span className="font-medium text-neutral-600">{m.from}</span>
                  <span>{m.time}</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white  px-4 py-3 text-sm text-neutral-700 shadow-sm">
                  {m.text}
                  <MediaAttachment
                    type={m.type}
                    hasMedia={m.hasMedia}
                    serializedId={m.serializedId}
                    connectionId={activeChat?.connectionId}
                    caption={m.text}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-neutral-300">
                  {m.meta}
                </p>
              </div>
              <div className="relative shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId((id) => (id === m.id ? null : m.id))
                  }
                  className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
                {openMenuId === m.id && (
                  <MessageOptionsMenu
                    align="left"
                    onReply={() => {
                      onReply?.(m);
                      setOpenMenuId(null);
                    }}
                    onForward={() => {
                      onForward?.(m);
                      setOpenMenuId(null);
                    }}
                    onCopy={() => handleCopy(m)}
                  />
                )}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="relative shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId((id) => (id === m.id ? null : m.id))
                  }
                  className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
                {openMenuId === m.id && (
                  <MessageOptionsMenu
                    align="right"
                    onReply={() => {
                      onReply?.(m);
                      setOpenMenuId(null);
                    }}
                    onForward={() => {
                      onForward?.(m);
                      setOpenMenuId(null);
                    }}
                    onCopy={() => handleCopy(m)}
                  />
                )}
              </div>
              <div className="max-w-md">
                <p className="mb-1 text-right text-xs font-medium text-neutral-500">
                  {m.from}
                </p>
                <div className="rounded-2xl rounded-br-sm border border-neutral-200  border-emerald-200 bg-emerald-100 px-4 py-3 text-sm text-neutral-700 ">
                  <p>{m.text}</p>
                  <MediaAttachment
                    type={m.type}
                    hasMedia={m.hasMedia}
                    serializedId={m.serializedId}
                    connectionId={activeChat?.connectionId}
                    caption={m.text}
                  />
                  {m.link && (
                    <a
                      href={m.link}
                      className="mt-2 flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {m.link}
                    </a>
                  )}
                  {m.attachments && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.attachments.map((a) => (
                        <span
                          key={a}
                          className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
                        >
                          <Paperclip className="h-3 w-3" />
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-300">
                  <Check className="h-3 w-3 text-emerald-500" />
                  {m.meta}
                </p>
              </div>
            </div>
          ),
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm">
              escribiendo…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2.5">
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none"
            />
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-600"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleSendMessage}
            title="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
