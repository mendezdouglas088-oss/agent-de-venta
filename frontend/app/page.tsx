"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  Zap,
  MessageSquare,
  Users,
  Heart,
  Star,
  Repeat,
  Clock,
  ThumbsUp,
  Trash2,
  BotMessageSquare,
  AlertTriangle,
  Settings,
  Package,
  Cable,
  Kanban,
  TrendingUp,
  Phone,
  Send as SendIcon,
} from "lucide-react";
import { Avatar, RailIcon } from "@/components/ui-primitives";

const CURRENT_USER = { name: "Adib Hussain" };

const METRICS = [
  { label: "Total Leads", value: "6", trend: "+12% this month", icon: Users },
  {
    label: "Conversion Rate",
    value: "33%",
    trend: "2 of 6 leads won",
    icon: TrendingUp,
  },
  {
    label: "Messages Today",
    value: "128",
    trend: "82 WhatsApp · 46 Telegram",
    icon: MessageSquare,
  },
  {
    label: "Active Automations",
    value: "2",
    trend: "1 scheduling · 1 products",
    icon: Zap,
  },
];

const STAGE_BREAKDOWN = [
  { label: "New", count: 1 },
  { label: "Contacted", count: 1 },
  { label: "Qualified", count: 1 },
  { label: "Negotiation", count: 1 },
  { label: "Won", count: 1 },
  { label: "Lost", count: 1 },
];

const CHANNEL_MESSAGES = [
  { channel: "whatsapp", label: "WhatsApp", count: 82 },
  { channel: "telegram", label: "Telegram", count: 46 },
];

const RECENT_ACTIVITY = [
  {
    name: "Pharah House",
    channel: "whatsapp",
    snippet: "Thanks, checking it now.",
    time: "10:15",
  },
  {
    name: "Leonard Kayle",
    channel: "telegram",
    snippet: "Already started",
    time: "11:31",
  },
  {
    name: "Leslie Winkle",
    channel: "whatsapp",
    snippet: "Hello, I have...",
    time: "11:14",
  },
  {
    name: "Richard Hammon",
    channel: "telegram",
    snippet: "We'll proceed...",
    time: "11:09",
  },
];

const ACTIVE_AUTOMATIONS = [
  { name: "Appointment booking - VIP Sales", type: "Appointment scheduling" },
  { name: "Product drops - Flash Offers", type: "Product posting" },
];

function MetricCard({ metric }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {metric.label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <metric.icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-neutral-900">
        {metric.value}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{metric.trend}</p>
    </div>
  );
}

function PipelineOverviewCard() {
  const max = Math.max(...STAGE_BREAKDOWN.map((s) => s.count));
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-900">
        Pipeline overview
      </h2>
      <div className="mt-4 space-y-3">
        {STAGE_BREAKDOWN.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-neutral-500">
              {s.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(s.count / max) * 100}%` }}
              />
            </div>
            <span className="w-4 shrink-0 text-right text-xs font-medium text-neutral-700">
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelMessagesCard() {
  const max = Math.max(...CHANNEL_MESSAGES.map((c) => c.count));
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-900">
        Messages by channel
      </h2>
      <div className="mt-4 space-y-3">
        {CHANNEL_MESSAGES.map((c) => {
          const Icon = c.channel === "telegram" ? SendIcon : Phone;
          return (
            <div key={c.channel} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.channel === "telegram" ? "bg-sky-500" : "bg-emerald-500"}`}
              >
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="w-16 shrink-0 text-xs text-neutral-500">
                {c.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${c.channel === "telegram" ? "bg-sky-500" : "bg-emerald-500"}`}
                  style={{ width: `${(c.count / max) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium text-neutral-700">
                {c.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivityCard({ router }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-900">
        Recent activity
      </h2>
      <div className="mt-4 space-y-1">
        {RECENT_ACTIVITY.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => router.push("/inbox")}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-neutral-50"
          >
            <Avatar name={a.name} size="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium text-neutral-800">
                  {a.name}
                </span>
                <span className="shrink-0 text-xs text-neutral-400">
                  {a.time}
                </span>
              </div>
              <span className="truncate text-xs text-neutral-400">
                {a.snippet}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ActiveAutomationsCard({ router }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-neutral-900">
        Active automations
      </h2>
      <div className="mt-4 space-y-1">
        {ACTIVE_AUTOMATIONS.map((a) => (
          <button
            key={a.name}
            type="button"
            onClick={() => router.push("/automation")}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-neutral-50"
          >
            <div>
              <p className="text-sm font-medium text-neutral-800">{a.name}</p>
              <p className="text-xs text-neutral-400">{a.type}</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

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
            <RailIcon icon={Home} active label="Dashboard" />
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
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-neutral-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              A quick overview of your conversations, pipeline, and automations.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {METRICS.map((m) => (
              <MetricCard key={m.label} metric={m} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <PipelineOverviewCard />
              <ChannelMessagesCard />
            </div>
            <div className="space-y-4">
              <RecentActivityCard router={router} />
              <ActiveAutomationsCard router={router} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
