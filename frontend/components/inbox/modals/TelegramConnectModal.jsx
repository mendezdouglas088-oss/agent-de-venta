"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TelegramConnectModal({ onClose, onConnect }) {
  const [hashId, setHashId] = useState("");
  const [token, setToken] = useState("");

  function handleSubmit() {
    if (!hashId.trim() || !token.trim()) return;
    onConnect();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Connect Telegram
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Enter your bot credentials to link the account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Hash ID
            </label>
            <input
              value={hashId}
              onChange={(e) => setHashId(e.target.value)}
              placeholder="e.g. 8f3a1c..."
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 123456:ABC-DEF..."
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hashId.trim() || !token.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
