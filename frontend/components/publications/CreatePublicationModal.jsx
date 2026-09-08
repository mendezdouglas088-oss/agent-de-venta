"use client";

import { useState } from "react";
import {
  X,
  Check,
  Package,
  Phone,
  Send,
  Sparkles,
  CalendarDays,
  Repeat,
  Clock,
} from "lucide-react";

const SCHEDULE_MODES = [
  { key: "daily", label: "Every day", icon: Clock },
  { key: "specific", label: "Specific day", icon: CalendarDays },
  { key: "interval", label: "Every X time", icon: Repeat },
];

const CAPTION_TEMPLATES = [
  (name, items) =>
    `✨ New drop alert! ${items} just landed — grab yours before "${name}" sells out.`,
  (name, items) =>
    `🔥 Fresh stock: ${items}. Message us to order now, limited pieces for ${name}.`,
  (name, items) =>
    `🛍️ ${items} available today. Tap in for prices and delivery — part of ${name}.`,
];

function buildAiCaption(name, productNames) {
  const items = productNames.length
    ? productNames.slice(0, 3).join(", ")
    : "our latest products";
  const template =
    CAPTION_TEMPLATES[Math.floor(Math.random() * CAPTION_TEMPLATES.length)];
  return template(name || "this publication", items);
}

export function CreatePublicationModal({
  initialData,
  products,
  groups,
  onClose,
  onSave,
}) {
  const isEdit = !!initialData;
  const schedule = initialData?.schedule;

  const [name, setName] = useState(initialData?.name || "");
  const [selectedProductIds, setSelectedProductIds] = useState(
    initialData?.productIds || [],
  );
  const [channelFilter, setChannelFilter] = useState("both");
  const [selectedGroupIds, setSelectedGroupIds] = useState(
    initialData?.groupIds || [],
  );
  const [caption, setCaption] = useState(initialData?.caption || "");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  const [scheduleMode, setScheduleMode] = useState(schedule?.mode || "daily");
  const [dailyTime, setDailyTime] = useState(schedule?.time || "");
  const [specificAt, setSpecificAt] = useState(schedule?.specificAt || "");
  const [intervalValue, setIntervalValue] = useState(
    schedule?.intervalValue || 3,
  );
  const [intervalUnit, setIntervalUnit] = useState(
    schedule?.intervalUnit || "days",
  );

  const filteredGroups =
    channelFilter === "both"
      ? groups
      : groups.filter((g) => g.channel === channelFilter);

  const canSave =
    name.trim().length > 0 &&
    selectedProductIds.length > 0 &&
    selectedGroupIds.length > 0;

  function toggleProduct(id) {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleGroup(id) {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleGenerateCaption() {
    if (isGeneratingCaption) return;
    setIsGeneratingCaption(true);
    const names = selectedProductIds
      .map((id) => products.find((p) => p.id === id)?.name)
      .filter(Boolean);
    setTimeout(() => {
      setCaption(buildAiCaption(name, names));
      setIsGeneratingCaption(false);
    }, 900);
  }

  function handleSave() {
    if (!canSave) return;

    let scheduleData;
    if (scheduleMode === "daily") {
      scheduleData = { mode: "daily", time: dailyTime || null };
    } else if (scheduleMode === "specific") {
      scheduleData = { mode: "specific", specificAt: specificAt || null };
    } else {
      scheduleData = {
        mode: "interval",
        intervalValue: Number(intervalValue) || 1,
        intervalUnit,
      };
    }

    onSave({
      id: initialData?.id ?? Date.now(),
      name: name.trim(),
      productIds: selectedProductIds,
      groupIds: selectedGroupIds,
      caption: caption.trim(),
      schedule: scheduleData,
      active: initialData?.active ?? true,
      createdAt: initialData?.createdAt ?? new Date().toISOString(),
      messagesCount: initialData?.messagesCount ?? 0,
      timesPublished: initialData?.timesPublished ?? 0,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "88vh" }}
        className="w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              {isEdit ? "Edit publication" : "New publication"}
            </h2>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              Pick the products, groups, and schedule for this publication.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Products */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Products in this publication
            </label>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => {
                const selected = selectedProductIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    title={p.name}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 ${
                      selected ? "border-emerald-500" : "border-transparent"
                    }`}
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
                        <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
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
                <p className="w-full text-xs text-neutral-400 dark:text-neutral-500">
                  No products yet. Add one from the Products page first.
                </p>
              )}
            </div>
            {selectedProductIds.length > 0 && (
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                {selectedProductIds.length} product
                {selectedProductIds.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>

          {/* Groups */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Groups to publish in
              </label>
              <div className="inline-flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-0.5">
                {[
                  { key: "whatsapp", label: "WhatsApp" },
                  { key: "telegram", label: "Telegram" },
                  { key: "both", label: "Both" },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setChannelFilter(c.key)}
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      channelFilter === c.key
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700 p-1.5">
              {filteredGroups.map((g) => {
                const selected = selectedGroupIds.includes(g.id);
                const isTelegram = g.channel === "telegram";
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGroup(g.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                      selected
                        ? "bg-emerald-50 dark:bg-emerald-500/10"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                        isTelegram ? "bg-sky-500" : "bg-emerald-500"
                      }`}
                    >
                      {isTelegram ? (
                        <Send className="h-3 w-3" />
                      ) : (
                        <Phone className="h-3 w-3" />
                      )}
                    </span>
                    <span className="flex-1 truncate text-neutral-700 dark:text-neutral-200">
                      {g.name}
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                );
              })}
              {filteredGroups.length === 0 && (
                <p className="px-2 py-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                  No groups for this channel.
                </p>
              )}
            </div>
            {selectedGroupIds.length > 0 && (
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                {selectedGroupIds.length} group
                {selectedGroupIds.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Publication name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring Sale Announcement"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          {/* Caption */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Caption
              </label>
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-emerald-500 px-2.5 py-1 text-xs font-medium text-neutral hover:opacity-90 disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isGeneratingCaption ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Write the caption your groups will see, or generate one with AI..."
              className="w-full resize-none rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Publication schedule
            </label>
            <div className="flex gap-2">
              {SCHEDULE_MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setScheduleMode(m.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium ${
                    scheduleMode === m.key
                      ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>

            {scheduleMode === "daily" && (
              <div className="mt-2">
                <input
                  type="time"
                  value={dailyTime}
                  onChange={(e) => setDailyTime(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                />
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                  Optional time of day. Leave empty to publish any time during
                  the day.
                </p>
              </div>
            )}

            {scheduleMode === "specific" && (
              <input
                type="datetime-local"
                value={specificAt}
                onChange={(e) => setSpecificAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            )}

            {scheduleMode === "interval" && (
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="w-24 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            )}
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
            disabled={!canSave}
            className="rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? "Save changes" : "Create publication"}
          </button>
        </div>
      </div>
    </div>
  );
}
