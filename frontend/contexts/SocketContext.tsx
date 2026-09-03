"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createSocket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [pendingAttention, setPendingAttention] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const s = createSocket();
    s.connect();
    socketRef.current = s;
    setSocket(s);

    apiFetch("/whatsapp-connections")
      .then((res) => res.json())
      .then((accounts) => {
        (Array.isArray(accounts) ? accounts : []).forEach((a) =>
          s.emit("join", a.id),
        );
      });

    const markPending = () => {
      if (window.location.pathname !== "/inbox") setPendingAttention(true);
    };
    s.on("whatsapp:qr", markPending);
    s.on("whatsapp:status", (data) => {
      if (data.status !== "connected") markPending();
    });

    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        pendingAttention,
        clearPendingAttention: () => setPendingAttention(false),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
