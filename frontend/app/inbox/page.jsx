"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Star,
  Clock,
  Package,
  Plus,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  Bookmark,
  Paperclip,
  Smile,
  Mic,
  Send,
  X,
  Copy,
  Edit3,
  Bell,
  MessageCircle,
  Ban,
  Flag,
  Calendar,
  Inbox,
  Archive,
  Check,
  Hash,
  AtSign,
  FolderOpen,
  FileText,
  Phone,
  Upload,
  ExternalLink,
  MessageSquareText,
} from "lucide-react";
import { apiFetch } from "@/lib/api"; // ajusta el path a donde realmente lo tengas
import { WhatsappConnectBox } from "@/components/WhatsappConnectBox";
import { useSocket } from "@/contexts/SocketContext";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const MAIN_MENU = [
  { key: "channels", label: "Channels", icon: Hash },
  { key: "drafts", label: "Drafts", icon: FileText },
  { key: "mentions", label: "Mentions", icon: AtSign },
  { key: "files", label: "Files & Media", icon: FolderOpen },
];

const ALL_ACCOUNTS = "all";

const CONVERSATION_FILTERS = [
  { key: "new", label: "New", icon: Inbox, count: 5 },
  { key: "all", label: "All", icon: MessageSquare, count: 30 },
  { key: "assigned", label: "Assigned", icon: UserPlus, count: 11 },
  { key: "favourites", label: "Favourites", icon: Star, count: 9 },
];

const NEGOTIATION_SUBCATEGORIES = ["All", "Urgent", "Completed"];

const CONTACTS = [
  "Nayla Barghese",
  "Sofia Ahmed",
  "Mark Buffalo",
  "Patrick Shwayne",
  "Liang li",
];

const MESSAGES_BY_CHAT = {
  2: [
    {
      id: 1,
      from: "Pharah House",
      side: "in",
      time: "10:15",
      text: "We need to make sure that the product works well at every circumstance that fits with us.",
      meta: "Message received 04:15 PM",
    },
    {
      id: 2,
      from: "Company",
      side: "out",
      text: "Sending you the files and docs within a few moments. Meanwhile, check our website for insights.",
      link: "https://www.desigtale.com/018900z",
      meta: "Message sent 6:40 PM",
    },
    {
      id: 3,
      from: "Pharah House",
      side: "in",
      time: "10:15",
      text: "Thanks, checking it now.",
      meta: "Message received 10:15 PM",
    },
    {
      id: 4,
      from: "Company",
      side: "out",
      text: "Quick glimpse of our proposal. When you're proposing the next meeting, we'll revise and go through the counter offer you'll be presenting.",
      attachments: ["Proposal", "Updated Doc"],
      meta: "Message sent 11:45 PM",
    },
  ],
};

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

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
];

function colorForName(name) {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initialsForName(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, size = "h-9 w-9" }) {
  return (
    <div
      className={`${size} ${colorForName(name)} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white`}
    >
      {initialsForName(name)}
    </div>
  );
}

function RailIcon({
  icon: Icon,
  tone = "default",
  active = false,
  onClick,
  label,
}) {
  const toneClasses =
    tone === "brand"
      ? "bg-emerald-500 text-white hover:bg-emerald-600"
      : active
        ? "bg-neutral-900 text-white"
        : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600";
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${toneClasses}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

function ChannelBadge({ channel }) {
  const isTelegram = channel === "telegram";
  const Icon = isTelegram ? Send : Phone;
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white ${
        isTelegram ? "bg-sky-500" : "bg-emerald-500"
      }`}
    >
      <Icon className="h-2 w-2 text-white" />
    </span>
  );
}

function CreatePostModal({
  products,
  groups,
  onClose,
  onSchedule,
  onAddProduct,
}) {
  const [content, setContent] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduleAt, setScheduleAt] = useState("");

  function toggleId(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleGroup(g) {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  function handleSubmit() {
    const groupsLabel = selectedGroups.length
      ? `${selectedGroups.length} group(s)`
      : "no groups yet";
    const whenLabel =
      scheduleMode === "now"
        ? "right now"
        : scheduleAt
          ? `on ${scheduleAt.replace("T", " at ")}`
          : "once you pick a time";
    onSchedule(`Post ready for ${groupsLabel} — sending ${whenLabel}.`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div
        style={{ maxHeight: "85vh" }}
        className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              New automated post
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              This will be sent automatically to the groups you select.
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

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write the text your groups will see..."
              className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Product images
              </label>
              <button
                type="button"
                onClick={onAddProduct}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
              >
                + Add product
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {products.map((p) => {
                const selected = selectedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleId(p.id)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 ${selected ? "border-emerald-500" : "border-transparent"}`}
                  >
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center ${p.color}`}
                      >
                        <Package className="h-5 w-5 text-neutral-500" />
                      </div>
                    )}
                    {selected && (
                      <div className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
              {products.length === 0 && (
                <p className="col-span-4 text-xs text-neutral-400">
                  No products yet. Add one to reuse its images.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Target groups
            </label>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => {
                const selected = selectedGroups.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGroup(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Scheduling
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                  scheduleMode === "now"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                Post now
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("later")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                  scheduleMode === "later"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-600"
                }`}
              >
                Schedule
              </button>
            </div>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
              />
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {scheduleMode === "now" ? "Post now" : "Schedule post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateProductModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!name.trim()) return;
    onCreate({
      id: Date.now(),
      name: name.trim(),
      price: price.trim(),
      imageUrl,
      color: "bg-neutral-100",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            New product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 hover:border-neutral-400"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload image</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Headset"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Price (optional)
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$0.00"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    apiFetch("/whatsapp-connections/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameUserConnected: name.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(() => onCreated())
      .catch(() => setError("Could not create the account. Try again."))
      .finally(() => setSaving(false));
  }

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
          <h2 className="text-base font-semibold text-neutral-900">Add User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
          Account name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sarah Connor"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
        />
        {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductLibraryModal({ products, onClose, onAddProduct }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div
        style={{ maxHeight: "85vh" }}
        className="w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Product library
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              These images are available to reuse in posts.
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

        <div className="grid grid-cols-4 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-neutral-200"
            >
              <div className="aspect-square w-full">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center ${p.color}`}
                  >
                    <Package className="h-5 w-5 text-neutral-500" />
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-neutral-700">
                  {p.name}
                </p>
                {p.price && (
                  <p className="text-xs text-neutral-400">{p.price}</p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddProduct}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add product</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectionTypeModal({ onClose, onSelect }) {
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
              Connect a channel
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Choose which platform you want to connect.
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
          <button
            type="button"
            onClick={() => onSelect("whatsapp")}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-emerald-400 hover:bg-emerald-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Phone className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-neutral-800">
                WhatsApp
              </span>
              <span className="block text-xs text-neutral-400">
                Scan a QR code to link a number
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelect("telegram")}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-sky-400 hover:bg-sky-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
              <Send className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-neutral-800">
                Telegram
              </span>
              <span className="block text-xs text-neutral-400">
                Connect with a hash ID and token
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectUserModal({ accounts, onClose, onSelectAccount }) {
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

function WhatsAppQRModal({ connectingAccountId, onClose }) {
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
        <p className="mt-4 text-sm text-neutral-500">
          Open WhatsApp on your phone and scan this code to link your account.
        </p>
      </div>
    </div>
  );
}

function TelegramConnectModal({ onClose, onConnect }) {
  const [hashId, setHashId] = useState("");
  const [token, setToken] = useState("");

  function handleSubmit() {
    if (!hashId.trim() || !token.trim()) return;
    onConnect();
  }

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
              Connect Telegram
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Enter your bot credentials to link the account.
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
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Hash ID
            </label>
            <input
              value={hashId}
              onChange={(e) => setHashId(e.target.value)}
              placeholder="e.g. 8f3a1c..."
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 123456:ABC-DEF..."
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hashId.trim() || !token.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CRMInboxDashboard() {
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [connectingAccountId, setConnectingAccountId] = useState(null);
  const [negotiationsOpen, setNegotiationsOpen] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
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
        const mapped = (Array.isArray(data) ? data : []).map((c) => ({
          id: `${c.connectionId}::${c.chatId}`,
          connectionId: c.connectionId,
          chatId: c.chatId,
          name: c.name,
          snippet: c.lastMessage || "",
          time: formatChatTime(c.lastMessageAt),
          unread: c.unreadCount || 0,
          channel: "whatsapp",
        }));
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
  const messages = MESSAGES_BY_CHAT[activeChatId] || [];

  function upsertChatFromMessage(payload) {
    const compositeId = `${payload.sessionId}::${payload.chatId}`;
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
        {/* Icon rail */}
        <Sidebar onOpenProducts={() => setShowLibrary(true)} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Nav sidebar */}
            <div className="flex h-full w-64 flex-col border-r border-neutral-200 bg-white">
              <div className="flex items-center justify-between px-5 pt-5">
                <h1 className="text-lg font-semibold text-neutral-900">
                  Inbox
                </h1>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                className="mt-4 flex items-center gap-2.5 px-5"
                onClick={() => {
                  if (accounts.length > 1) {
                    setShowSelectUserModal(true);
                  } else {
                    setConnectingAccountId(accounts[0]?.connectionId ?? null);
                    setShowConnectionModal(true);
                  }
                }}
              >
                <Avatar name={effectiveAccountName || "?"} size="h-8 w-8" />
                <span className="text-sm font-medium text-neutral-700">
                  {effectiveAccountName}
                </span>
              </button>

              <div className="mt-6 flex-1 overflow-y-auto px-3">
                <div className="space-y-0.5">
                  {MAIN_MENU.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>

                <p className="mt-6 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-300">
                  Conversations
                </p>
                <div className="mt-1.5 space-y-0.5">
                  {CONVERSATION_FILTERS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFilter(f.key)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm ${
                        activeFilter === f.key
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <f.icon className="h-4 w-4" />
                        {f.label}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {f.count}
                      </span>
                    </button>
                  ))}

                  <div>
                    <button
                      type="button"
                      onClick={() => setNegotiationsOpen((v) => !v)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      <span className="flex items-center gap-3">
                        {negotiationsOpen ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        Negotiations
                      </span>
                      <span className="text-xs text-neutral-400">20</span>
                    </button>
                    {negotiationsOpen && (
                      <div className="ml-6 mt-0.5 space-y-0.5 border-l border-neutral-100 pl-3">
                        {NEGOTIATION_SUBCATEGORIES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  >
                    <span className="flex items-center gap-3">
                      <ChevronRight className="h-3.5 w-3.5" />
                      Closed
                    </span>
                    <span className="text-xs text-neutral-400">145</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  >
                    <span className="flex items-center gap-3">
                      <Archive className="h-3.5 w-3.5" />
                      Archives
                    </span>
                    <span className="text-xs text-neutral-400">32</span>
                  </button>
                </div>

                <p className="mt-6 px-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-300">
                  Contacts
                </p>
                <div className="mb-4 mt-1.5 space-y-0.5">
                  {CONTACTS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      <Avatar name={name} size="h-6 w-6" />
                      {name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add contacts
                  </button>
                </div>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex h-full w-80 flex-col border-r border-neutral-200 bg-white">
              <div className="flex items-center gap-3 px-4 pt-5">
                <Menu className="h-4 w-4 text-neutral-400" />
                <h2 className="text-sm font-semibold text-neutral-700">All</h2>
              </div>
              <div className="px-4 pt-3">
                <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-neutral-400" />
                  <input
                    placeholder="Search by chats and people"
                    className="w-full bg-transparent text-xs text-neutral-600 placeholder-neutral-400 outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
                {chats.map((chat) => {
                  const isActive = chat.id === effectiveChatId;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                        isActive
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-transparent hover:bg-neutral-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar name={chat.name} />
                        <ChannelBadge channel={chat.channel} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium text-neutral-800">
                            {chat.name}
                          </span>
                          <span className="shrink-0 text-xs text-neutral-400">
                            {chat.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs text-neutral-400">
                            {chat.snippet}
                          </span>
                          {chat.unread > 0 && (
                            <span className="ml-2 flex h-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-semibold text-white">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat view */}
            <div className="flex h-full flex-1 flex-col bg-neutral-50">
              <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <MessageSquareText />
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Move to Closed
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                  >
                    Not assigned
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookmarked((v) => !v)}
                    className={`rounded-lg p-1.5 ${bookmarked ? "text-emerald-500" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"}`}
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-center text-neutral-300">
                    <Inbox className="mb-2 h-8 w-8" />
                    <p className="text-sm">
                      No sample messages for this contact in the demo.
                    </p>
                  </div>
                )}
                {messages.map((m) =>
                  m.side === "in" ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-md">
                        <div className="mb-1 flex items-center justify-end gap-2 text-xs text-neutral-400">
                          <span className="font-medium text-neutral-600">
                            {m.from}
                          </span>
                          <span>{m.time}</span>
                        </div>
                        <div className="rounded-2xl rounded-tr-sm border border-emerald-200 bg-emerald-100 px-4 py-3 text-sm text-neutral-700">
                          {m.text}
                        </div>
                        <p className="mt-1 text-right text-xs text-neutral-300">
                          {m.meta}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-md">
                        <p className="mb-1 text-xs font-medium text-neutral-500">
                          {m.from}
                        </p>
                        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
                          <p>{m.text}</p>
                          {m.link && (
                            <a
                              href={m.link}
                              className="mt-2 flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {m.link}
                            </a>
                          )}
                          {m.attachments && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {m.attachments.map((a) => (
                                <span
                                  key={a}
                                  className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {a}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-300">
                          <Check className="h-3 w-3 text-emerald-500" />
                          {m.meta}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="border-t border-neutral-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2.5">
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <input
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent text-sm text-neutral-700 placeholder-neutral-400 outline-none"
                    />
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPostModal(true)}
                    title="Create automated group post"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile sidebar */}
            <div className="flex h-full w-72 flex-col overflow-y-auto border-l border-neutral-200 bg-white px-5 py-5">
              <div className="flex flex-col items-center text-center">
                <Avatar name={activeChat.name} size="h-16 w-16" />
                <h3 className="mt-3 text-sm font-semibold text-neutral-900">
                  {activeChat.name}
                </h3>
                <a
                  href="#"
                  className="mt-0.5 flex items-center gap-1 text-xs text-sky-600 hover:underline"
                >
                  https://desig.com/sta
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-400 hover:text-neutral-600"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-400 hover:text-neutral-600"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  Unsubscribe
                </button>
              </div>

              <div className="mt-5 space-y-2.5 rounded-xl border border-neutral-100 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Status
                  </span>
                  <span className="font-medium text-emerald-600">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Flag className="h-3.5 w-3.5" />
                    Appeals
                  </span>
                  <span className="font-medium text-neutral-600">2</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    Last Contact
                  </span>
                  <span className="font-medium text-neutral-600">1hr ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-neutral-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Subscribed
                  </span>
                  <span className="font-medium text-neutral-600">
                    9 Days ago
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                  Notifications
                </p>
                <div className="mt-2 space-y-3">
                  {[
                    { icon: Bell, event: "5 Deals Pending", time: "Just now" },
                    {
                      icon: MessageCircle,
                      event: "New Message",
                      time: "12 hours ago",
                    },
                    {
                      icon: UserPlus,
                      event: "New user registered",
                      time: "59 minutes ago",
                    },
                  ].map((n) => (
                    <div key={n.event} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                        <n.icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-700">
                          {n.event}
                        </p>
                        <p className="text-xs text-neutral-400">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-2 mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                  User Settings
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between rounded-lg px-1 py-2">
                    <span className="flex items-center gap-2.5 text-xs text-neutral-600">
                      <Bell className="h-3.5 w-3.5 text-neutral-400" />
                      Notifications
                    </span>
                    <span className="flex h-5 w-9 items-center rounded-full bg-emerald-500 p-0.5">
                      <span className="h-4 w-4 translate-x-4 rounded-full bg-white transition-transform" />
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-xs text-neutral-600 hover:bg-neutral-50"
                  >
                    <Flag className="h-3.5 w-3.5 text-neutral-400" />
                    Report
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-xs text-rose-500 hover:bg-rose-50"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Block
                  </button>
                </div>
              </div>
            </div>
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
            setSelectedAccountId(account.id ?? null);
            setConnectingAccountId(
              account.id === ALL_ACCOUNTS ? null : (account.id ?? null),
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
