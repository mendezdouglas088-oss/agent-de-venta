"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  ClipboardClock,
  Zap,
  Users,
  MessageSquare,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { CreatePublicationModal } from "@/components/publications/CreatePublicationModal";

const PRODUCT_COLORS = [
  "bg-emerald-100 dark:bg-emerald-500/15",
  "bg-sky-100 dark:bg-sky-500/15",
  "bg-amber-100 dark:bg-amber-500/15",
  "bg-rose-100 dark:bg-rose-500/15",
  "bg-violet-100 dark:bg-violet-500/15",
  "bg-teal-100 dark:bg-teal-500/15",
];

const RAW_PRODUCTS = [
  "SmartHome Hub",
  "UltraSound Wireless Earbuds",
  "ProVision 4K Monitor",
  "EchoWave Bluetooth Speaker",
  "NimbusPro Backpack",
  "PulseFit Smart Watch",
  "Vortex Gaming Mouse",
  "Aurora LED Strip Light",
  "AeroFit Running Shoes",
  "ZenBrew Coffee Maker",
];

const PRODUCTS = RAW_PRODUCTS.map((name, i) => ({
  id: i + 1,
  name,
  imageUrl: "",
  color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
}));

const GROUPS = [
  { id: 1, name: "VIP Sales - WhatsApp", channel: "whatsapp" },
  { id: 2, name: "Flash Offers - Telegram", channel: "telegram" },
  { id: 3, name: "General Community - WhatsApp", channel: "whatsapp" },
  { id: 4, name: "Loyal Customers - Telegram", channel: "telegram" },
  { id: 5, name: "New Arrivals Club - WhatsApp", channel: "whatsapp" },
  { id: 6, name: "Weekend Deals - Telegram", channel: "telegram" },
  { id: 7, name: "Wholesale Buyers - WhatsApp", channel: "whatsapp" },
  { id: 8, name: "Product Drops - Telegram", channel: "telegram" },
];

const INITIAL_PUBLICATIONS = [
  {
    id: 1,
    name: "Spring Sale Announcement",
    productIds: [1, 2, 3],
    groupIds: [1, 2, 3],
    caption:
      "✨ Spring is here! Check our SmartHome Hub, earbuds and more with launch pricing this week only.",
    schedule: { mode: "daily", time: "09:00" },
    active: true,
    createdAt: "2026-03-01T09:00:00",
    messagesCount: 128,
    timesPublished: 14,
  },
  {
    id: 2,
    name: "New Arrivals Drop",
    productIds: [4, 5],
    groupIds: [4, 5, 6],
    caption:
      "🔥 New arrivals just landed — EchoWave speaker and NimbusPro backpack, message us to grab yours.",
    schedule: { mode: "interval", intervalValue: 6, intervalUnit: "hours" },
    active: true,
    createdAt: "2026-02-20T10:00:00",
    messagesCount: 342,
    timesPublished: 40,
  },
  {
    id: 3,
    name: "Weekend Flash Deals",
    productIds: [6, 7, 8],
    groupIds: [2, 6],
    caption:
      "🛍️ Weekend only: smart watch, gaming mouse and LED strips at flash prices.",
    schedule: { mode: "specific", specificAt: "2026-09-12T18:00" },
    active: false,
    createdAt: "2026-01-15T08:30:00",
    messagesCount: 76,
    timesPublished: 3,
  },
  {
    id: 4,
    name: "Wholesale Catalog Update",
    productIds: [9, 10],
    groupIds: [7],
    caption:
      "📦 Updated wholesale catalog is live — running shoes and coffee makers back in stock.",
    schedule: { mode: "daily", time: "" },
    active: true,
    createdAt: "2025-12-05T11:00:00",
    messagesCount: 54,
    timesPublished: 60,
  },
  {
    id: 5,
    name: "Holiday Promo Blast",
    productIds: [1, 4, 9],
    groupIds: [1, 3, 5, 8],
    caption:
      "🎁 Holiday promo blast — bundle deals across our best sellers, today and tomorrow only.",
    schedule: { mode: "interval", intervalValue: 2, intervalUnit: "days" },
    active: false,
    createdAt: "2025-11-20T14:00:00",
    messagesCount: 210,
    timesPublished: 22,
  },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {value}
      </p>
    </div>
  );
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', data }
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredPublications = useMemo(() => {
    let list = publications;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      list = list.filter((p) =>
        statusFilter === "active" ? p.active : !p.active,
      );
    }
    return list;
  }, [publications, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = publications.filter((p) => p.active).length;
    const totalGroupAssignments = publications.reduce(
      (s, p) => s + p.groupIds.length,
      0,
    );
    const totalMessages = publications.reduce((s, p) => s + p.messagesCount, 0);
    return {
      total: publications.length,
      active,
      totalGroupAssignments,
      totalMessages,
    };
  }, [publications]);

  function handleToggleActive(id) {
    setPublications((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  }

  function handleSavePublication(pub) {
    setPublications((prev) => {
      const exists = prev.some((p) => p.id === pub.id);
      if (exists) return prev.map((p) => (p.id === pub.id ? pub : p));
      return [pub, ...prev];
    });
    const isEdit = publications.some((p) => p.id === pub.id);
    setToast(
      isEdit
        ? `Publication "${pub.name}" updated.`
        : `Publication "${pub.name}" created.`,
    );
    setModalState(null);
  }

  function handleDelete(id) {
    const pub = publications.find((p) => p.id === id);
    if (!window.confirm(`Delete publication "${pub?.name}"?`)) return;
    setPublications((prev) => prev.filter((p) => p.id !== id));
    setToast(`Publication "${pub?.name}" deleted.`);
  }

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Publications
                </h1>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Create and manage automated posts sent to your WhatsApp and
                  Telegram groups.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ mode: "create" })}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                Add Publication
              </button>
            </div>

            {/* Stats */}
            <div className="mb-5 grid grid-cols-4 gap-4">
              <MetricCard
                label="Total Publications"
                value={stats.total}
                icon={ClipboardClock}
              />
              <MetricCard
                label="Active Publications"
                value={stats.active}
                icon={Zap}
              />
              <MetricCard
                label="Group Assignments"
                value={stats.totalGroupAssignments}
                icon={Users}
              />
              <MetricCard
                label="Messages Sent"
                value={stats.totalMessages.toLocaleString()}
                icon={MessageSquare}
              />
            </div>

            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search publications..."
                  className="w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-2 pl-9 pr-3 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                />
              </div>

              <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      statusFilter === f.key
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            {filteredPublications.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-8 gap-y-1">
                {filteredPublications.map((pub) => (
                  <PublicationCard
                    key={pub.id}
                    publication={pub}
                    products={PRODUCTS}
                    groups={GROUPS}
                    onToggleActive={handleToggleActive}
                    onEdit={(data) => setModalState({ mode: "edit", data })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 py-14 text-center text-sm text-neutral-400 dark:text-neutral-500">
                No publications match your search or filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {modalState && (
        <CreatePublicationModal
          initialData={modalState.mode === "edit" ? modalState.data : null}
          products={PRODUCTS}
          groups={GROUPS}
          onClose={() => setModalState(null)}
          onSave={handleSavePublication}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
