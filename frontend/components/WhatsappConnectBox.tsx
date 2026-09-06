"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";

export function WhatsappConnectBox({ connectionId, onConnected }) {
  const { socket, whatsappState } = useSocket();
  const [initialStatus, setInitialStatus] = useState(null);

  const conn =
    whatsappState[connectionId] ||
    (initialStatus ? { status: initialStatus } : {});
  const qrUrl = conn.qr ?? null;
  const status = conn.status ?? "connecting";
  const isFailed = status === "auth_failed" || status === "error";

  useEffect(() => {
    if (!connectionId) return;
    if (whatsappState[connectionId]) return;

    apiFetch(`/whatsapp/status?connectionId=${connectionId}`)
      .then((r) => r.json())
      .then((s) => {
        setInitialStatus(s.status);
        if (s.status !== "connected") {
          apiFetch(`/whatsapp/connect?connectionId=${connectionId}`, {
            method: "POST",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  useEffect(() => {
    if (!socket || !connectionId) return;
    socket.emit("join", connectionId);
  }, [socket, connectionId]);

  useEffect(() => {
    if (status === "connected") {
      const t = setTimeout(() => onConnected?.(), 1200);
      return () => clearTimeout(t);
    }
  }, [status, onConnected]);

  return (
    <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center">
      {status === "connected" ? (
        <>
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="text-sm font-medium text-neutral-700">Conectado</p>
        </>
      ) : qrUrl ? (
        <img
          src={qrUrl}
          alt="QR de WhatsApp"
          className="h-full w-full rounded-xl object-contain p-2"
        />
      ) : isFailed ? (
        <>
          <AlertTriangle className="h-10 w-10 text-rose-500" />
          <p className="text-sm text-neutral-600">
            No se pudo conectar. Cerrá y volvé a intentar.
          </p>
        </>
      ) : (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">Conectando...</p>
        </>
      )}
    </div>
  );
}
