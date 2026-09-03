"use client";
import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";

export function WhatsappConnectBox({ connectionId, onConnected }) {
  const { socket } = useSocket();
  const [qrUrl, setQrUrl] = useState(null);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    apiFetch(`/whatsapp/status?connectionId=${connectionId}`)
      .then((r) => r.json())
      .then((s) => {
        setStatus(s.status);
        if (s.status !== "connected") {
          apiFetch(`/whatsapp/connect?connectionId=${connectionId}`, {
            method: "POST",
          });
        }
      });
  }, [connectionId]);

  useEffect(() => {
    if (!socket || !connectionId) return;
    socket.emit("join", connectionId);
    const onQr = (data) => {
      console.log("QR recibido:", data);
      if (data.connectionId === connectionId) setQrUrl(data.qr);
    };
    const onStatus = (data) => {
      console.log("Estado de WhatsApp recibido:", data);
      if (data.connectionId === connectionId) setStatus(data.status);
    };
    socket.on("whatsapp:qr", onQr);
    socket.on("whatsapp:status", onStatus);
    return () => {
      socket.off("whatsapp:qr", onQr);
      socket.off("whatsapp:status", onStatus);
    };
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
