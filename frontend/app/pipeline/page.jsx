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
  Trash2,
  AlertTriangle,
  BotMessageSquare,
  Settings,
  Package,
  Home,
  Cable,
  Kanban,
  Plus,
  X,
  Phone,
  Send as SendIcon,
} from "lucide-react";
import { Avatar, RailIcon } from "@/components/ui-primitives";

const CURRENT_USER = { name: "Adib Hussain" };

const SOURCES = [
  "VIP Sales - WhatsApp",
  "Flash Offers - Telegram",
  "General Community - WhatsApp",
  "Loyal Customers - Telegram",
];

const STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const INITIAL_LEADS = [
  {
    id: 1,
    name: "Penny Valeria",
    channel: "whatsapp",
    value: "$1,200",
    source: "VIP Sales - WhatsApp",
    stage: "new",
  },
  {
    id: 2,
    name: "Pharah House",
    channel: "whatsapp",
    value: "$3,400",
    source: "VIP Sales - WhatsApp",
    stage: "negotiation",
  },
  {
    id: 3,
    name: "Leonard Kayle",
    channel: "telegram",
    value: "$850",
    source: "Flash Offers - Telegram",
    stage: "contacted",
  },
  {
    id: 4,
    name: "Leslie Winkle",
    channel: "whatsapp",
    value: "$2,000",
    source: "General Community - WhatsApp",
    stage: "qualified",
  },
  {
    id: 5,
    name: "Richard Hammon",
    channel: "telegram",
    value: "$500",
    source: "Loyal Customers - Telegram",
    stage: "won",
  },
  {
    id: 6,
    name: "Rob Stark",
    channel: "whatsapp",
    value: "$1,750",
    source: "VIP Sales - WhatsApp",
    stage: "lost",
  },
];

function ChannelIcon({ channel }) {
  const Icon = channel === "telegram" ? SendIcon : Phone;
  return (
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-full ${channel === "telegram" ? "bg-sky-500" : "bg-emerald-500"}`}
    >
      <Icon className="h-2.5 w-2.5 text-white" />
    </span>
  );
}

function LeadCard({ lead, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="cursor-grab space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={lead.name} size="h-7 w-7" />
          <span className="text-sm font-medium text-neutral-800">
            {lead.name}
          </span>
        </div>
        <ChannelIcon channel={lead.channel} />
      </div>
      <p className="text-sm font-semibold text-neutral-900">{lead.value}</p>
      <span className="inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
        {lead.source}
      </span>
    </div>
  );
}

function NewLeadModal({ defaultStage, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [value, setValue] = useState("");
  const [source, setSource] = useState(SOURCES[0]);
  const [stage, setStage] = useState(defaultStage || "new");

  function handleSave() {
    if (!name.trim()) return;
    onCreate({
      id: Date.now(),
      name: name.trim(),
      channel,
      value: value.trim() || "$0",
      source,
      stage,
    });
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
          <h2 className="text-base font-semibold text-neutral-900">New lead</h2>
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
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nayla Barghese"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Channel
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${channel === "whatsapp" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannel("telegram")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${channel === "telegram" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
              >
                Telegram
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Deal value
            </label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="$0"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400">
              Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStage(s.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${stage === s.key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                >
                  {s.label}
                </button>
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
            disabled={!name.trim()}
            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save lead
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [showModal, setShowModal] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(null);

  function handleDragStart(e, leadId) {
    e.dataTransfer.setData("text/plain", String(leadId));
  }

  function handleDrop(e, stageKey) {
    e.preventDefault();
    const leadId = Number(e.dataTransfer.getData("text/plain"));
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: stageKey } : l)),
    );
    setDragOverStage(null);
  }

  function handleCreate(lead) {
    setLeads((prev) => [...prev, lead]);
    setShowModal(false);
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
            <RailIcon
              icon={Zap}
              label="Automations"
              onClick={() => router.push("/automation")}
            />
            <RailIcon
              icon={MessageSquare}
              label="Inbox"
              onClick={() => router.push("/inbox")}
            />
            <RailIcon icon={Kanban} active label="Pipeline" />
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

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                Pipeline
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Drag leads across stages as deals move forward.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              New lead
            </button>
          </div>

          <div className="flex h-full gap-4 pb-4">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage.key);
              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage.key);
                  }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => handleDrop(e, stage.key)}
                  className={`flex w-64 shrink-0 flex-col rounded-2xl border p-3 ${
                    dragOverStage === stage.key
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-neutral-200 bg-neutral-100"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {stage.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <NewLeadModal
          defaultStage="new"
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
