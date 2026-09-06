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
  const [chats, setChats] = useState([]);
  const [activeSection, setActiveSection] = useState("chats"); // "chats" | "channels" | "mentions"
  const [mentions, setMentions] = useState([]);

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

  // useEffect(() => {
  //   socket.on("typing", ({ chatId, isTyping }) => {
  //     setTypingChatId(isTyping ? chatId : null);
  //   });
  //   return () => socket.off("typing");
  // }, [socket]);

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
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setToast("Could not load groups."));
  }, [effectiveAccountId]);

  useEffect(() => {
    if (!effectiveAccountId || effectiveAccountId === ALL_ACCOUNTS) return;
    apiFetch(`/whatsapp/sync?connectionId=${effectiveAccountId}`, {
      method: "POST",
    }).catch(() => {}); // best-effort, la data nueva llega por socket
  }, [effectiveAccountId]);

  useEffect(() => {
    if (!effectiveAccountId || effectiveAccountId === ALL_ACCOUNTS) {
      setMentions([]);
      return;
    }
    apiFetch(`/whatsapp/mentions?connectionId=${effectiveAccountId}&limit=100`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(setMentions)
      .catch(() => setToast("Could not load mentions."));
  }, [effectiveAccountId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const [selectedAccountName, setSelectedAccountName] = useState(null);

  const effectiveAccountName =
    selectedAccountName ?? (accounts[0] ? accounts[0].name : "");

  function formatChatTime(timestamp) {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function mapGroupToListItem(g, connectionId) {
    return {
      id: `${connectionId}::${g.whatsappGroupId}`,
      connectionId,
      chatId: g.whatsappGroupId,
      name: g.title,
      snippet: g.lastMessage || "",
      time: formatChatTime(g.lastMessageAt),
      unread: g.unreadCount || 0,
      channel: "whatsapp",
      isGroup: true,
    };
  }

  function buildMentionItems(items, connectionId) {
    const seen = new Set();
    const result = [];
    for (const m of items) {
      if (seen.has(m.chatId)) continue;
      seen.add(m.chatId);
      result.push({
        id: `${connectionId}::${m.chatId}`,
        connectionId,
        chatId: m.chatId,
        name: m.groupTitle || m.chatId,
        snippet: m.body || "",
        time: formatChatTime(m.timestamp),
        unread: 0,
        channel: "whatsapp",
        isGroup: !!m.isGroup,
      });
    }
    return result;
  }

  function mapMessage(m) {
    const time = new Date(m.timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const senderName =
      m.authorName || (m.author ? m.author.split("@")[0] : null);
    return {
      id: m.id,
      from: m.fromMe
        ? effectiveAccountName || "Company"
        : senderName || activeChat.name,
      side: m.fromMe ? "out" : "in",
      time,
      timestamp: m.timestamp * 1000,
      text: m.body || "",
      meta: `Message ${m.fromMe ? "sent" : "received"} ${time}`,
      type: m.type,
      hasMedia: m.hasMedia,
      serializedId: m.serializedId,
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
            isGroup: false, // -> sin los grupos
            isNew: !!c.isNew,
          }))
          .sort(
            (a, b) => (b.lastMessageAtRaw ?? 0) - (a.lastMessageAtRaw ?? 0),
          );
        setChats(mapped);
      })
      .catch(() => setToast("Could not load chats."));
  }, [effectiveAccountId]);

  const listItems =
    activeSection === "channels"
      ? groups.map((g) => mapGroupToListItem(g, effectiveAccountId))
      : activeSection === "mentions"
        ? buildMentionItems(mentions, effectiveAccountId)
        : activeFilter === "new"
          ? chats.filter((c) => c.isNew)
          : chats;

  const sectionTitle =
    activeSection === "channels"
      ? "Channels"
      : activeSection === "mentions"
        ? "Mentions"
        : activeFilter === "new"
          ? "New"
          : "All";

  const unreadTotal = chats.reduce((sum, c) => sum + (c.unread || 0), 0);
  const newCount = chats.filter((c) => c.isNew).length;

  const activeChat = listItems.find((c) => c.id === activeChatId) ||
    listItems[0] || { name: "" };
  const effectiveChatId =
    activeChatId ??
    (activeFilter === "new" ? null : listItems[0] ? listItems[0].id : null);
  const effectiveChatIdRef = useRef(effectiveChatId);
  useEffect(() => {
    effectiveChatIdRef.current = effectiveChatId;
  }, [effectiveChatId]);

  const effectiveAccountIdRef = useRef(effectiveAccountId);
  useEffect(() => {
    effectiveAccountIdRef.current = effectiveAccountId;
  }, [effectiveAccountId]);
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

    // marcar como leído
    if (activeChat.unread > 0) {
      apiFetch(
        `/whatsapp/mark-as-read?connectionId=${sessionId}&chatId=${encodeURIComponent(chatId)}`,
        { method: "POST" },
      ).catch(() => {});

      if (activeChat.isGroup) {
        setGroups((prev) =>
          prev.map((g) =>
            g.whatsappGroupId === chatId ? { ...g, unreadCount: 0 } : g,
          ),
        );
      } else {
        setChats((prev) =>
          prev.map((c) => (c.id === effectiveChatId ? { ...c, unread: 0 } : c)),
        );
      }
    }

    // sacar de "New"
    if (!activeChat.isGroup && activeChat.isNew) {
      apiFetch(
        `/whatsapp/chats/${encodeURIComponent(chatId)}/seen?connectionId=${sessionId}`,
        { method: "POST" },
      ).catch(() => {});
      setChats((prev) =>
        prev.map((c) =>
          c.id === effectiveChatId ? { ...c, isNew: false } : c,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveChatId]);

  function upsertChatFromMessage(payload) {
    const currentAccountId = effectiveAccountIdRef.current;
    if (
      currentAccountId !== ALL_ACCOUNTS &&
      payload.sessionId !== currentAccountId
    ) {
      return;
    }

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
              : Date.now(),
            text: payload.text,
            meta: `Message ${payload.fromMe ? "sent" : "received"} just now`,
            type: payload.type,
            hasMedia: payload.hasMedia,
            serializedId: payload.serializedId,
          },
        ].sort((a, b) => a.timestamp - b.timestamp),
      );
    }

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (payload.isGroup) {
      setGroups((prev) => {
        const idx = prev.findIndex((g) => g.whatsappGroupId === payload.chatId);
        if (idx === -1) return prev; // grupo aún no sincronizado, lo trae el próximo sync
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: payload.text,
          unreadCount: isActive ? 0 : (updated[idx].unreadCount || 0) + 1,
        };
        const [group] = updated.splice(idx, 1);
        return [group, ...updated];
      });
      return;
    }

    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === compositeId);
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
            isGroup: false,
            isNew: false,
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
    const currentAccountId = effectiveAccountIdRef.current;
    if (
      currentAccountId !== ALL_ACCOUNTS &&
      payload.sessionId !== currentAccountId
    ) {
      return;
    }

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
              isGroup: false,
              isNew: true,
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

  function handleFilterChange(key) {
    setActiveSection("chats");
    setActiveChatId(null);
    setActiveFilter(key);
  }

  function handleSectionChange(key) {
    setActiveSection((prev) => (prev === key ? "chats" : key)); // click de nuevo = volver a Chats
    setActiveChatId(null);
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
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              unreadTotal={unreadTotal}
              newCount={newCount}
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
              title={sectionTitle}
              chats={listItems}
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
              effectiveAccountName={effectiveAccountName}
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
            const isAll = account.id === ALL_ACCOUNTS;
            setSelectedAccountName(account.name);
            setSelectedAccountId(
              isAll ? ALL_ACCOUNTS : (account.connectionId ?? null),
            );
            setConnectingAccountId(
              isAll ? null : (account.connectionId ?? null),
            );
            setShowSelectUserModal(false);
            if (!isAll) {
              setShowWhatsAppQR(true);
            }
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
