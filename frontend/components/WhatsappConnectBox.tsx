"use client";
import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

export function WhatsappConnectBox({ telegramId }: { telegramId: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("disconnected");
  const API = process.env.NEXT_PUBLIC_API_URL;

  console.log("API:", API);

  useEffect(() => {
    fetch(`${API}/whatsapp/connect?telegramId=${telegramId}`, {
      method: "POST",
    });

    const interval = setInterval(async () => {
      const s = await fetch(
        `${API}/whatsapp/status?telegramId=${telegramId}`,
      ).then((r) => r.json());
      setStatus(s.status);
      if (s.status === "connected") return clearInterval(interval);

      const res = await fetch(`${API}/whatsapp/qr?telegramId=${telegramId}`);
      if (res.ok) setQrUrl(URL.createObjectURL(await res.blob()));
    }, 3000);
    return () => clearInterval(interval);
  }, [telegramId]);

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
