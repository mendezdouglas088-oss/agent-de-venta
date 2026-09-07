"use client";

import { useState } from "react";
import { X, Check, Package } from "lucide-react";

export function CreatePostModal({
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
        className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              New automated post
            </h2>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              This will be sent automatically to the groups you select.
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
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write the text your groups will see..."
              className="w-full resize-none rounded-xl border border-neutral-200 dark:border-neutral-700 p-3 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Product images
              </label>
              <button
                type="button"
                onClick={onAddProduct}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400"
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
                        <Package className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
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
                <p className="col-span-4 text-xs text-neutral-400 dark:text-neutral-500">
                  No products yet. Add one to reuse its images.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
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
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Scheduling
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                  scheduleMode === "now"
                    ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                Post now
              </button>
              <button
                type="button"
                onClick={() => setScheduleMode("later")}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${
                  scheduleMode === "later"
                    ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
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
                className="mt-2 w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
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
            onClick={handleSubmit}
            className="rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
          >
            {scheduleMode === "now" ? "Post now" : "Schedule post"}
          </button>
        </div>
      </div>
    </div>
  );
}
