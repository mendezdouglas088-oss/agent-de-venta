"use client";
import { useEffect } from "react";
import { QrCode } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";

export function WhatsappConnectBox({ connectionId, onConnected }) {
  const { socket, whatsappState } = useSocket();
  const conn = whatsappState[connectionId] || {};
  const qrUrl = conn.qr ?? null;
  const status = conn.status ?? "checking";

  useEffect(() => {
    if (!connectionId) return;
    // si ya hay qr/status guardado (context sobrevivió la navegación), no reinicies la conexión
    if (whatsappState[connectionId]) return;

    apiFetch(`/whatsapp/status?telegramId=${connectionId}`)
      .then((r) => r.json())
      .then((s) => {
        if (s.status !== "connected") {
          apiFetch(`/whatsapp/connect?telegramId=${connectionId}`, {
            method: "POST",
          });
        }
      });
    // whatsappState fuera de deps a propósito: solo queremos chequear el valor al montar
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
    <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
      {status === "connected" ? (
        <p className="text-sm text-neutral-600">Conectado ✅</p>
      ) : qrUrl ? (
        <img
          src={qrUrl}
          alt="QR de WhatsApp"
          className="h-full w-full rounded-xl object-contain p-2"
        />
      ) : (
        <QrCode className="h-24 w-24 text-neutral-800" strokeWidth={1} />
      )}
    </div>
  );
}
