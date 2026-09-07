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
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

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
      className="cursor-pointer rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 hover:border-neutral-300 dark:hover:border-neutral-600"
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <type.icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {type.label}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        {automation.name}
      </h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {automation.sources.map((s) => (
          <span
            key={s}
            className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
        {TRIGGERS.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-neutral-400 dark:text-neutral-500">{t.label}</span>
            <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-200">
              <ArrowRight className="h-3 w-3 text-neutral-300 dark:text-neutral-600" />
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
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Delete automation
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Are you sure you want to delete "{automation.name}"? This can't be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 dark:hover:bg-rose-400"
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
        className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {initialData ? "Edit automation" : "New automation"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appointment booking - VIP Sales"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
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
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
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
                      ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              When they interact
            </label>
            <div className="space-y-2">
              {TRIGGERS.map((t) => (
                <div
                  key={t.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2"
                >
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">{t.label}</span>
                  <select
                    value={rules[t.key]}
                    onChange={(e) =>
                      setRules((prev) => ({ ...prev, [t.key]: e.target.value }))
                    }
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-xs text-neutral-700 dark:text-neutral-200 outline-none"
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
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || selectedSources.length === 0}
            className="rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
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
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Automations
                </h1>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Manage what happens automatically in your connected groups and
                  contacts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
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
