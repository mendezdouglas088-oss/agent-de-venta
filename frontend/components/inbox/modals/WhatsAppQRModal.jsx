"use client";

import { X } from "lucide-react";
import { WhatsappConnectBox } from "@/components/WhatsappConnectBox";
import { useSocket } from "@/contexts/SocketContext";

export function WhatsAppQRModal({ connectingAccountId, onClose }) {
  const { whatsappState } = useSocket();
  const showScanHint = whatsappState[connectingAccountId]?.qr;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            Connect WhatsApp
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {connectingAccountId ? (
          <WhatsappConnectBox
            connectionId={connectingAccountId}
            onConnected={onClose}
          />
        ) : (
          <p className="text-sm text-neutral-500">No account selected.</p>
        )}
        {showScanHint && (
          <p className="mt-4 text-sm text-neutral-500">
            Open WhatsApp on your phone and scan this code to link your account.
          </p>
        )}
      </div>
    </div>
  );
}
