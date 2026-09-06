"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api"; // ajusta el path a donde realmente lo tengas
import { useSocket } from "@/contexts/SocketContext";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

import { ALL_ACCOUNTS } from "@/components/inbox/constants";
import { NavSidebar } from "@/components/inbox/NavSidebar";
import { ChatList } from "@/components/inbox/ChatList";
import { ChatView } from "@/components/inbox/ChatView";
import { ProfileSidebar } from "@/components/inbox/ProfileSidebar";
import { CreatePostModal } from "@/components/inbox/modals/CreatePostModal";
import { CreateProductModal } from "@/components/inbox/modals/CreateProductModal";
import { AddUserModal } from "@/components/inbox/modals/AddUserModal";
import { ProductLibraryModal } from "@/components/inbox/modals/ProductLibraryModal";
import { ConnectionTypeModal } from "@/components/inbox/modals/ConnectionTypeModal";
import { SelectUserModal } from "@/components/inbox/modals/SelectUserModal";
import { WhatsAppQRModal } from "@/components/inbox/modals/WhatsAppQRModal";
import { TelegramConnectModal } from "@/components/inbox/modals/TelegramConnectModal";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headset",
    price: "$59.00",
    color: "bg-emerald-100",
    imageUrl: "",
  },
  {
    id: 2,
    name: "Desk Lamp",
    price: "$24.00",
    color: "bg-amber-100",
    imageUrl: "",
  },
];

export default function CRMInboxDashboard() {
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [connectingAccountId, setConnectingAccountId] = useState(null);
  const [negotiationsOpen, setNegotiationsOpen] = useState(true);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [toast, setToast] = useState("");
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showSelectUserModal, setShowSelectUserModal] = useState(false);
  const { socket, clearPendingAttention, whatsappState } = useSocket();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showWhatsAppQR, setShowWhatsAppQR] = useState(false);
  const [showTelegramForm, setShowTelegramForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [typingChatId, setTypingChatId] = useState(null);

  function fetchAccounts() {
    apiFetch("/whatsapp-connections")
      .then((res) => res.json())
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : []).map((a) => ({
          id: a.id,
          name: a.nameUserConnected,
          connectionId: a.connectionId,
        }));
        setAccounts(mapped);
      })
      .catch(() => setToast("Could not load accounts."));
  }

  useEffect(() => {
    socket.on("typing", ({ chatId, isTyping }) => {
      setTypingChatId(isTyping ? chatId : null);
    });
    return () => socket.off("typing");
  }, [socket]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const effectiveAccountId =
    selectedAccountId ?? (accounts[0] ? accounts[0].connectionId : null);

  useEffect(() => {
    if (!effectiveAccountId) return;
    const qs =
      effectiveAccountId === ALL_ACCOUNTS
        ? ""
        : `?connectionId=${effectiveAccountId}`;
    apiFetch(`/whatsapp/groups${qs}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setGroups)
      .catch(() => setToast("Could not load groups."));
  }, [effectiveAccountId]);

  useEffect(() => {
    if (!effectiveAccountId || effectiveAccountId === ALL_ACCOUNTS) return;
    apiFetch(`/whatsapp/sync?connectionId=${effectiveAccountId}`, {
      method: "POST",
    }).catch(() => {}); // best-effort, la data nueva llega por socket
  }, [effectiveAccountId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const [selectedAccountName, setSelectedAccountName] = useState(null);

  const effectiveAccountName =
    selectedAccountName ?? (accounts[0] ? accounts[0].name : "");

  const [chats, setChats] = useState([]);

  function formatChatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function mapMessage(m) {
    const time = new Date(m.timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      id: m.id,
      from: m.fromMe ? effectiveAccountName || "Company" : activeChat.name,
      side: m.fromMe ? "out" : "in",
      time,
      timestamp: m.timestamp * 1000, // nuevo
      text: m.body || "",
      meta: `Message ${m.fromMe ? "sent" : "received"} ${time}`,
    };
  }

  useEffect(() => {
    if (!effectiveAccountId) return;
    const qs =
      effectiveAccountId === ALL_ACCOUNTS
        ? ""
        : `?connectionId=${effectiveAccountId}`;
    apiFetch(`/whatsapp/chats${qs}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        const mapped = (Array.isArray(data) ? data : [])
          .map((c) => ({
            id: `${c.sessionId}::${c.chatId}`,
            connectionId: c.sessionId,
            chatId: c.chatId,
            name: c.name,
            snippet: c.lastMessage || "",
            time: formatChatTime(c.lastMessageAt),
            unread: c.unreadCount || 0,
            channel: "whatsapp",
          }))
          .sort(
            (a, b) => (b.lastMessageAtRaw ?? 0) - (a.lastMessageAtRaw ?? 0),
          );
        setChats(mapped);
      })
      .catch(() => setToast("Could not load chats."));
  }, [effectiveAccountId]);

  const activeChat = chats.find((c) => c.id === activeChatId) ||
    chats[0] || { name: "" };
  const effectiveChatId = activeChatId ?? (chats[0] ? chats[0].id : null);
  const effectiveChatIdRef = useRef(effectiveChatId);
  useEffect(() => {
    effectiveChatIdRef.current = effectiveChatId;
  }, [effectiveChatId]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!effectiveChatId) {
      setMessages([]);
      return;
    }
    const [sessionId, chatId] = effectiveChatId.split("::");
    apiFetch(
      `/whatsapp/messages?connectionId=${sessionId}&chatId=${encodeURIComponent(chatId)}&limit=150`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) =>
        setMessages(
          (Array.isArray(data) ? data : [])
            .map(mapMessage)
            .sort((a, b) => a.timestamp - b.timestamp),
        ),
      )
      .catch(() => setToast("Could not load messages."));
  }, [effectiveChatId]);

  function upsertChatFromMessage(payload) {
    const compositeId = `${payload.sessionId}::${payload.chatId}`;
    const isActive = compositeId === effectiveChatIdRef.current;

    if (isActive) {
      setMessages((prev) =>
        [
          ...prev,
          {
            id: payload.messageId ?? Date.now(),
            from: payload.fromMe
              ? effectiveAccountName || "Company"
              : payload.contact?.name || payload.chatId,
            side: payload.fromMe ? "out" : "in",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            timestamp: payload.timestamp
              ? payload.timestamp * 1000
              : Date.now(), // nuevo
            text: payload.text,
            meta: `Message ${payload.fromMe ? "sent" : "received"} just now`,
          },
        ].sort((a, b) => a.timestamp - b.timestamp),
      );
    }
    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === compositeId);
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const isActive = compositeId === effectiveChatIdRef.current;

      if (idx === -1) {
        return [
          {
            id: compositeId,
            connectionId: payload.sessionId,
            chatId: payload.chatId,
            name: payload.contact?.name || payload.chatId,
            snippet: payload.text,
            time,
            unread: isActive ? 0 : 1,
            channel: "whatsapp",
          },
          ...prev,
        ];
      }
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        snippet: payload.text,
        time,
        unread: isActive ? 0 : updated[idx].unread + 1,
      };
      const [chat] = updated.splice(idx, 1);
      return [chat, ...updated];
    });
  }

  function upsertNewChat(payload) {
    const compositeId = `${payload.sessionId}::${payload.chatId}`;
    setChats((prev) =>
      prev.some((c) => c.id === compositeId)
        ? prev
        : [
            {
              id: compositeId,
              connectionId: payload.sessionId,
              chatId: payload.chatId,
              name: payload.name,
              snippet: "",
              time: "",
              unread: payload.unreadCount || 0,
              channel: "whatsapp",
            },
            ...prev,
          ],
    );
  }

  function upsertNewGroup(payload) {
    setGroups((prev) =>
      prev.some((g) => g.whatsappGroupId === payload.whatsappGroupId)
        ? prev
        : [
            {
              whatsappGroupId: payload.whatsappGroupId,
              title: payload.title,
              publishEnabled: false,
            },
            ...prev,
          ],
    );
  }

  useEffect(() => {
    if (!socket) return;
    socket.on("whatsapp:new-chat", upsertNewChat);
    socket.on("whatsapp:new-group", upsertNewGroup);
    return () => {
      socket.off("whatsapp:new-chat", upsertNewChat);
      socket.off("whatsapp:new-group", upsertNewGroup);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("whatsapp:message", upsertChatFromMessage);
    return () => socket.off("whatsapp:message", upsertChatFromMessage);
  }, [socket]);

  useEffect(() => {
    const pending = Object.entries(whatsappState).find(
      ([, v]) => v.status === "qr",
    );
    if (pending) {
      const [connectionId] = pending;
      setConnectingAccountId(connectionId);
      setShowWhatsAppQR(true);
    }
  }, [whatsappState]);

  useEffect(() => {
    clearPendingAttention(); // apaga el parpadeo del ícono al entrar a Inbox
  }, []);

  function handleProductCreated(product) {
    setProducts((prev) => [...prev, product]);
    setShowProductModal(false);
    setToast(`Product "${product.name}" added to the library.`);
  }

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <Sidebar onOpenProducts={() => setShowLibrary(true)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <NavSidebar
              effectiveAccountName={effectiveAccountName}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              negotiationsOpen={negotiationsOpen}
              onToggleNegotiations={() => setNegotiationsOpen((v) => !v)}
              onAddUser={() => setShowAddUserModal(true)}
              onAccountClick={() => {
                if (accounts.length > 1) {
                  setShowSelectUserModal(true);
                } else {
                  setConnectingAccountId(accounts[0]?.connectionId ?? null);
                  setShowConnectionModal(true);
                }
              }}
            />

            <ChatList
              chats={chats}
              effectiveChatId={effectiveChatId}
              onSelectChat={setActiveChatId}
            />

            <ChatView
              messages={messages}
              activeChat={activeChat}
              effectiveAccountId={effectiveAccountId}
              onOpenPostModal={() => setShowPostModal(true)}
              onMessageSent={(msg) => setMessages((prev) => [...prev, msg])}
              isTyping={typingChatId === activeChat?.id}
            />

            <ProfileSidebar activeChat={activeChat} />
          </div>
        </div>
      </div>

      {showPostModal && (
        <CreatePostModal
          products={products}
          groups={groups}
          onClose={() => setShowPostModal(false)}
          onSchedule={(summary) => {
            setShowPostModal(false);
            setToast(summary);
          }}
          onAddProduct={() => setShowProductModal(true)}
        />
      )}

      {showConnectionModal && (
        <ConnectionTypeModal
          onClose={() => setShowConnectionModal(false)}
          onSelect={(type) => {
            setShowConnectionModal(false);
            if (type === "whatsapp") setShowWhatsAppQR(true);
            if (type === "telegram") setShowTelegramForm(true);
          }}
        />
      )}

      {showSelectUserModal && (
        <SelectUserModal
          accounts={accounts}
          onClose={() => setShowSelectUserModal(false)}
          onSelectAccount={(account) => {
            setSelectedAccountName(account.name);
            setSelectedAccountId(
              account.id === ALL_ACCOUNTS
                ? ALL_ACCOUNTS
                : (account.connectionId ?? null),
            );
            setConnectingAccountId(
              account.id === ALL_ACCOUNTS
                ? null
                : (account.connectionId ?? null),
            );
            setShowSelectUserModal(false);
          }}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onCreated={() => {
            setShowAddUserModal(false);
            fetchAccounts();
            setToast("Account created.");
          }}
        />
      )}

      {showWhatsAppQR && (
        <WhatsAppQRModal
          connectingAccountId={connectingAccountId}
          onClose={() => setShowWhatsAppQR(false)}
        />
      )}
      {showTelegramForm && (
        <TelegramConnectModal
          onClose={() => setShowTelegramForm(false)}
          onConnect={() => {
            setShowTelegramForm(false);
            setToast("Telegram account connected.");
          }}
        />
      )}

      {showProductModal && (
        <CreateProductModal
          onClose={() => setShowProductModal(false)}
          onCreate={handleProductCreated}
        />
      )}

      {showLibrary && (
        <ProductLibraryModal
          products={products}
          onClose={() => setShowLibrary(false)}
          onAddProduct={() => {
            setShowLibrary(false);
            setShowProductModal(true);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
