"use client";

import { Users, X } from "lucide-react";
import { Avatar } from "@/components/inbox/Avatar";
import { ALL_ACCOUNTS } from "@/components/inbox/constants";

export function SelectUserModal({ accounts, onClose, onSelectAccount }) {
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
              Select Another User
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Choose which account you want to work with.
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
          {accounts.length > 1 && (
            <button
              type="button"
              onClick={() =>
                onSelectAccount({ id: ALL_ACCOUNTS, name: "All Users" })
              }
              className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-sky-400 hover:bg-sky-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
                <Users className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-neutral-800">
                  All Users
                </span>
                <span className="block text-xs text-neutral-400">
                  Show every account at once
                </span>
              </span>
            </button>
          )}

          {accounts.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => onSelectAccount(account)}
              className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-emerald-400 hover:bg-emerald-50"
            >
              <Avatar name={account.name} size="h-9 w-9" />
              <span className="text-sm font-medium text-neutral-800">
                {account.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
