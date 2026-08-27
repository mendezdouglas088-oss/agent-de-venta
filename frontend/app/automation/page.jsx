"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  MessageSquare,
  Users,
  Heart,
  Star,
  Repeat,
  Clock,
  ThumbsUp,
  CalendarDays,
  Trash2,
  AlertTriangle,
  Settings,
  BotMessageSquare,
  Package,
  Cable,
  Plus,
  Home,
  X,
  Kanban,
  Calendar,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { Avatar, RailIcon } from "@/components/ui-primitives";

const CURRENT_USER = { name: "Adib Hussain" };

const SOURCES = [
  "VIP Sales - WhatsApp",
  "Flash Offers - Telegram",
  "General Community - WhatsApp",
  "Loyal Customers - Telegram",
];

const AUTOMATION_TYPES = [
  { key: "scheduling", label: "Appointment scheduling", icon: Calendar },
  { key: "products", label: "Product posting", icon: Package },
  { key: "qualification", label: "Lead qualification", icon: UserPlus },
];

const TRIGGERS = [
  { key: "onGroupReply", label: "When a contact replies in the group" },
  { key: "onMention", label: "When you're mentioned" },
  { key: "onDirectMessage", label: "When they message you privately" },
];

const RESPONSE_ACTIONS = [
  "Reply with AI agent",
  "Notify me",
  "Ignore",
  "Move to CRM as Lead",
];

const INITIAL_AUTOMATIONS = [
  {
    id: 1,
    name: "Appointment booking - VIP Sales",
    type: "scheduling",
    sources: ["VIP Sales - WhatsApp"],
    onGroupReply: "Reply with AI agent",
    onMention: "Notify me",
    onDirectMessage: "Reply with AI agent",
  },
  {
    id: 2,
    name: "Product drops - Flash Offers",
    type: "products",
    sources: ["Flash Offers - Telegram", "General Community - WhatsApp"],
    onGroupReply: "Ignore",
    onMention: "Reply with AI agent",
    onDirectMessage: "Move to CRM as Lead",
  },
];

function typeInfo(key) {
  return AUTOMATION_TYPES.find((t) => t.key === key) || AUTOMATION_TYPES[0];
}

function AutomationCard({ automation, onEdit, onDelete }) {
  const type = typeInfo(automation.type);
  return (
    <div
      onClick={onEdit}
      className="cursor-pointer rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-300"
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <type.icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-medium text-neutral-500">
            {type.label}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <h3 className="text-sm font-semibold text-neutral-900">
        {automation.name}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {automation.sources.map((s) => (
          <span
            key={s}
            className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
        {TRIGGERS.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-neutral-400">{t.label}</span>
            <span className="flex items-center gap-1 font-medium text-neutral-700">
              <ArrowRight className="h-3 w-3 text-neutral-300" />
              {automation[t.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ automation, onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          Delete automation
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Are you sure you want to delete "{automation.name}"? This can't be
          undone.
        </p>
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
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function NewAutomationModal({ onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData ? initialData.name : "");
  const [selectedSources, setSelectedSources] = useState(
    initialData ? initialData.sources : [],
  );
  const [type, setType] = useState(
    initialData ? initialData.type : "scheduling",
  );
  const [rules, setRules] = useState(
    initialData
      ? {
          onGroupReply: initialData.onGroupReply,
          onMention: initialData.onMention,
          onDirectMessage: initialData.onDirectMessage,
        }
      : {
          onGroupReply: RESPONSE_ACTIONS[0],
          onMention: RESPONSE_ACTIONS[0],
          onDirectMessage: RESPONSE_ACTIONS[0],
        },
  );

  function toggleSource(s) {
    setSelectedSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function handleSave() {
    if (!name.trim() || selectedSources.length === 0) return;
    onSave({
      id: initialData ? initialData.id : Date.now(),
      name: name.trim(),
      type,
      sources: selectedSources,
      ...rules,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
        className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            {initialData ? "Edit automation" : "New automation"}
          </h2>
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
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appointment booking - VIP Sales"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Source
            </label>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => {
                const selected = selectedSources.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSource(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Automation type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AUTOMATION_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center ${
                    type === t.key
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              When they interact
            </label>
            <div className="space-y-2">
              {TRIGGERS.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2"
                >
                  <span className="text-xs text-neutral-600">{t.label}</span>
                  <select
                    value={rules[t.key]}
                    onChange={(e) =>
                      setRules((prev) => ({ ...prev, [t.key]: e.target.value }))
                    }
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 outline-none"
                  >
                    {RESPONSE_ACTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
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
            disabled={!name.trim() || selectedSources.length === 0}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {initialData ? "Save changes" : "Save automation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [showModal, setShowModal] = useState(false);

  const [editingAutomation, setEditingAutomation] = useState(null);
  const [deletingAutomation, setDeletingAutomation] = useState(null);

  function handleSave(automation) {
    setAutomations((prev) => {
      const exists = prev.some((a) => a.id === automation.id);
      return exists
        ? prev.map((a) => (a.id === automation.id ? automation : a))
        : [...prev, automation];
    });
    setShowModal(false);
    setEditingAutomation(null);
  }

  function handleDelete() {
    setAutomations((prev) =>
      prev.filter((a) => a.id !== deletingAutomation.id),
    );
    setDeletingAutomation(null);
  }

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <div className="flex h-full w-16 flex-col items-center justify-between border-r border-neutral-200 bg-white py-4">
          <div className="flex flex-col items-center gap-3">
            <RailIcon
              icon={BotMessageSquare}
              tone="brand"
              label="Hola !!!"
              //   onClick={() => router.push("/automation")}
            />
            <RailIcon
              icon={Home}
              label="Dashboard"
              onClick={() => router.push("/")}
            />
            <RailIcon icon={Zap} active label="Automations" />
            <RailIcon
              icon={MessageSquare}
              label="Inbox"
              onClick={() => router.push("/inbox")}
            />
            <RailIcon
              icon={Kanban}
              label="Pipeline"
              onClick={() => router.push("/pipeline")}
            />
            <RailIcon
              icon={Cable}
              label="Connection"
              onClick={() => setShowConnectionModal(true)}
            />
            <RailIcon
              icon={Package}
              label="Products"
              onClick={() => setShowLibrary(true)}
            />
            <RailIcon
              icon={CalendarDays}
              label="Calendar"
              onClick={() => router.push("/calendar")}
            />
            <RailIcon icon={Users} label="Contacts" />
            <RailIcon icon={Heart} label="Favorites" />
            <RailIcon icon={Star} label="Starred" />
            <RailIcon icon={Repeat} label="History" />
            <RailIcon icon={Clock} label="Recent" />
            <RailIcon icon={ThumbsUp} label="Approved" />

            <RailIcon icon={Trash2} label="Trash" />
            <RailIcon icon={AlertTriangle} label="Alerts" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <RailIcon icon={Settings} label="Settings" />
            <Avatar name={CURRENT_USER.name} size="h-9 w-9" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                Automations
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Manage what happens automatically in your connected groups and
                contacts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              New automation
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {automations.map((a) => (
              <AutomationCard
                key={a.id}
                automation={a}
                onEdit={() => setEditingAutomation(a)}
                onDelete={() => setDeletingAutomation(a)}
              />
            ))}
          </div>
        </div>
      </div>

      {(showModal || editingAutomation) && (
        <NewAutomationModal
          initialData={editingAutomation}
          onClose={() => {
            setShowModal(false);
            setEditingAutomation(null);
          }}
          onSave={handleSave}
        />
      )}
      {deletingAutomation && (
        <DeleteConfirmModal
          automation={deletingAutomation}
          onClose={() => setDeletingAutomation(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
