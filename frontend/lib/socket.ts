import { io } from "socket.io-client";

export function createSocket() {
  const token = localStorage.getItem("accessToken");
  const origin = new URL(process.env.NEXT_PUBLIC_API_URL as string).origin;

  return io(origin, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: false,
  });
}
