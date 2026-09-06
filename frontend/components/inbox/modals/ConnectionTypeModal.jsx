"use client";

import { Phone, Send, X } from "lucide-react";

export function ConnectionTypeModal({ onClose, onSelect }) {
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
              Connect a channel
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Choose which platform you want to connect.
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
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onSelect("whatsapp")}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Phone className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-neutral-800">
                WhatsApp
              </span>
              <span className="block text-xs text-neutral-400">
                Scan a QR code to link a number
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelect("telegram")}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-sky-400 hover:bg-sky-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
              <Send className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-neutral-800">
                Telegram
              </span>
              <span className="block text-xs text-neutral-400">
                Connect with a hash ID and token
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
