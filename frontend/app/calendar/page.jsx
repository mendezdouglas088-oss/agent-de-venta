"use client";

import { useState } from "react";
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
  AlertTriangle,
  Settings,
  Package,
  Cable,
  Kanban,
  CalendarDays,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  ArrowRight,
  UserPlus,
  Link2,
} from "lucide-react";
import { Avatar, RailIcon } from "@/components/ui-primitives";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const CURRENT_USER = { name: "Adib Hussain" };
const TODAY_KEY = "2026-08-26";
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const HOUR_HEIGHT = 64;
const GRID_START_MINUTES = HOURS[0] * 60;

const COLORS = [
  {
    key: "emerald",
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    key: "sky",
    bg: "bg-sky-100",
    border: "border-sky-300",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  {
    key: "violet",
    bg: "bg-violet-100",
    border: "border-violet-300",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
  {
    key: "amber",
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  {
    key: "rose",
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
];
function colorSet(key) {
  return COLORS.find((c) => c.key === key) || COLORS[0];
}

const CALENDAR_FILTERS = [
  { key: "whatsapp", label: "WhatsApp", dot: "bg-emerald-500" },
  { key: "telegram", label: "Telegram", dot: "bg-sky-500" },
  { key: "manual", label: "Manual", dot: "bg-violet-500" },
];

const CATEGORIES = [
  { label: "Appointment", dot: "bg-emerald-500" },
  { label: "Follow-up", dot: "bg-sky-500" },
  { label: "Internal", dot: "bg-violet-500" },
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Product walkthrough call",
    contactName: "Pharah House",
    channel: "whatsapp",
    date: "2026-08-24",
    startTime: "09:00",
    endTime: "09:30",
    color: "emerald",
    link: "",
    description: "",
  },
  {
    id: 2,
    title: "Quick check-in",
    contactName: "Leonard Kayle",
    channel: "telegram",
    date: "2026-08-24",
    startTime: "11:00",
    endTime: "11:30",
    color: "sky",
    link: "",
    description: "",
  },
  {
    id: 3,
    title: "Follow up on quote",
    contactName: "Leslie Winkle",
    channel: "whatsapp",
    date: "2026-08-26",
    startTime: "14:00",
    endTime: "15:00",
    color: "emerald",
    link: "https://meet.google.com/abc-defg",
    description: "",
  },
  {
    id: 4,
    title: "Onboarding call",
    contactName: "Richard Hammon",
    channel: "telegram",
    date: "2026-08-27",
    startTime: "10:00",
    endTime: "10:30",
    color: "sky",
    link: "",
    description: "",
  },
  {
    id: 5,
    title: "Team planning",
    contactName: "",
    channel: "manual",
    date: "2026-08-28",
    startTime: "09:00",
    endTime: "09:30",
    color: "violet",
    link: "",
    description: "Weekly internal sync",
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}
function toDateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function eventStyle(ev) {
  const top =
    ((timeToMinutes(ev.startTime) - GRID_START_MINUTES) / 60) * HOUR_HEIGHT;
  const height = Math.max(
    ((timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime)) / 60) *
      HOUR_HEIGHT,
    28,
  );
  return { top: `${top}px`, height: `${height}px` };
}
function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

function MiniCalendar({
  month,
  year,
  onPrev,
  onNext,
  selectedDate,
  onSelectDate,
  eventDates,
}) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const monthLabel = first.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w} className="text-xs text-neutral-300">
            {w[0]}
          </span>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <span key={`empty-${idx}`} />;
          const dateKey = toDateKey(new Date(year, month, day));
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === TODAY_KEY;
          const hasEvents = eventDates.has(dateKey);
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(new Date(year, month, day))}
              className="flex flex-col items-center py-0.5"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isSelected
                    ? "bg-neutral-900 text-white"
                    : isToday
                      ? "bg-emerald-100 font-medium text-emerald-700"
                      : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {day}
              </span>
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${hasEvents ? "bg-emerald-500" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeGrid({ days, events, onSlotClick, onEventClick }) {
  return (
    <div className="flex overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
      <div className="w-16 shrink-0 border-r border-neutral-100 pt-10">
        {HOURS.map((h) => (
          <div
            key={h}
            className="flex h-16 items-start justify-end pr-2 text-xs text-neutral-400"
          >
            {formatHour(h)}
          </div>
        ))}
      </div>
      <div className="flex flex-1">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = events.filter((e) => e.date === dateKey);
          const isToday = dateKey === TODAY_KEY;
          return (
            <div
              key={dateKey}
              className="flex-1 border-r border-neutral-100 last:border-r-0"
            >
              <div className="flex h-10 flex-col items-center justify-center border-b border-neutral-100">
                <span className="text-xs text-neutral-400">
                  {WEEKDAY_LABELS[day.getDay()]}
                </span>
                <span
                  className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-neutral-900 text-white" : "text-neutral-700"}`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div
                className="relative"
                style={{ height: HOURS.length * HOUR_HEIGHT }}
              >
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onSlotClick(dateKey, h)}
                    className="block h-16 w-full border-b border-neutral-100 hover:bg-neutral-50"
                  />
                ))}
                {dayEvents.map((ev) => {
                  const c = colorSet(ev.color);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      style={eventStyle(ev)}
                      className={`absolute left-1 right-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs ${c.bg} ${c.border} ${c.text}`}
                    >
                      <p className="truncate font-medium">{ev.title}</p>
                      <p className="truncate">
                        {ev.startTime} - {ev.endTime}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({ year, month, events, onDayClick }) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-xs font-medium text-neutral-400"
          >
            {w}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const date = new Date(year, month, day);
          const dateKey = toDateKey(date);
          const dayEvents = events.filter((e) => e.date === dateKey);
          const isToday = dateKey === TODAY_KEY;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDayClick(date)}
              className={`flex h-24 flex-col items-start gap-1 rounded-xl border p-1.5 text-left ${isToday ? "border-emerald-300 bg-emerald-50" : "border-neutral-100 hover:bg-neutral-50"}`}
            >
              <span className="text-xs font-medium text-neutral-600">
                {day}
              </span>
              <div className="w-full space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => {
                  const c = colorSet(ev.color);
                  return (
                    <span
                      key={ev.id}
                      className={`block truncate rounded px-1 py-0.5 text-xs ${c.bg} ${c.text}`}
                    >
                      {ev.title}
                    </span>
                  );
                })}
                {dayEvents.length > 2 && (
                  <span className="text-xs text-neutral-400">
                    +{dayEvents.length - 2} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EventModal({
  initialData,
  defaultDate,
  defaultHour,
  onClose,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [date, setDate] = useState(
    initialData ? initialData.date : defaultDate || "",
  );
  const [startTime, setStartTime] = useState(
    initialData
      ? initialData.startTime
      : defaultHour !== undefined
        ? `${pad(defaultHour)}:00`
        : "09:00",
  );
  const [endTime, setEndTime] = useState(
    initialData
      ? initialData.endTime
      : defaultHour !== undefined
        ? `${pad(defaultHour + 1)}:00`
        : "09:30",
  );
  const [contactName, setContactName] = useState(
    initialData ? initialData.contactName : "",
  );
  const [channel, setChannel] = useState(
    initialData ? initialData.channel : "whatsapp",
  );
  const [link, setLink] = useState(initialData ? initialData.link : "");
  const [description, setDescription] = useState(
    initialData ? initialData.description : "",
  );
  const [color, setColor] = useState(
    initialData ? initialData.color : "emerald",
  );

  function handleSave() {
    if (!title.trim() || !date || !startTime || !endTime) return;
    onSave({
      id: initialData ? initialData.id : Date.now(),
      title: title.trim(),
      date,
      startTime,
      endTime,
      contactName: contactName.trim(),
      channel,
      link: link.trim(),
      description: description.trim(),
      color,
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
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            {initialData ? "Edit schedule" : "Add schedule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New event title"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
          />

          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
            />
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
            <UserPlus className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Add contact (optional)"
              className="w-full text-sm text-neutral-700 placeholder-neutral-400 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChannel("whatsapp")}
              className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-medium ${channel === "whatsapp" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setChannel("telegram")}
              className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-medium ${channel === "telegram" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
            >
              Telegram
            </button>
            <button
              type="button"
              onClick={() => setChannel("manual")}
              className={`flex-1 rounded-xl border px-3 py-1.5 text-xs font-medium ${channel === "manual" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600"}`}
            >
              Manual
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Add meeting link (optional)"
              className="w-full text-sm text-neutral-700 placeholder-neutral-400 outline-none"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add description"
            className="w-full resize-none rounded-xl border border-neutral-200 p-3 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400"
          />

          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                className={`h-6 w-6 rounded-full ${c.dot} ${color === c.key ? "ring-2 ring-neutral-400 ring-offset-2" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          {initialData ? (
            <button
              type="button"
              onClick={() => onDelete(initialData.id)}
              className="rounded-xl p-2 text-rose-500 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
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
              disabled={!title.trim() || !date}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const [anchorDate, setAnchorDate] = useState(new Date(2026, 7, 26));
  const [viewMode, setViewMode] = useState("week");
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [activeFilters, setActiveFilters] = useState([
    "whatsapp",
    "telegram",
    "manual",
  ]);
  const [miniMonth, setMiniMonth] = useState(7);
  const [miniYear, setMiniYear] = useState(2026);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefill, setPrefill] = useState(null);

  const visibleEvents = events.filter((e) => activeFilters.includes(e.channel));
  const selectedKey = toDateKey(anchorDate);
  const days =
    viewMode === "day"
      ? [anchorDate]
      : Array.from({ length: 7 }, (_, i) =>
          addDays(startOfWeek(anchorDate), i),
        );

  const rangeLabel =
    viewMode === "day"
      ? anchorDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : anchorDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

  function toggleFilter(key) {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function goToday() {
    const t = new Date(2026, 7, 26);
    setAnchorDate(t);
    setMiniMonth(t.getMonth());
    setMiniYear(t.getFullYear());
  }

  function goPrev() {
    if (viewMode === "day") setAnchorDate((d) => addDays(d, -1));
    else if (viewMode === "week") setAnchorDate((d) => addDays(d, -7));
    else
      setAnchorDate(
        (d) => new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()),
      );
  }

  function goNext() {
    if (viewMode === "day") setAnchorDate((d) => addDays(d, 1));
    else if (viewMode === "week") setAnchorDate((d) => addDays(d, 7));
    else
      setAnchorDate(
        (d) => new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()),
      );
  }

  function openNewAt(dateKey, hour) {
    setEditingEvent(null);
    setPrefill({ date: dateKey, hour });
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditingEvent(ev);
    setPrefill(null);
    setShowModal(true);
  }

  function handleSave(event) {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      return exists
        ? prev.map((e) => (e.id === event.id ? event : e))
        : [...prev, event];
    });
    setShowModal(false);
    setEditingEvent(null);
    setPrefill(null);
  }

  function handleDelete(id) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setShowModal(false);
    setEditingEvent(null);
  }

  const eventDates = new Set(visibleEvents.map((e) => e.date));

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900">
      <div style={{ minWidth: "1300px" }} className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white p-4">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    CRM Calendar
                  </p>
                  <p className="text-xs text-neutral-400">
                    Appointments workspace
                  </p>
                </div>
              </div>

              <MiniCalendar
                month={miniMonth}
                year={miniYear}
                onPrev={() => {
                  if (miniMonth === 0) {
                    setMiniMonth(11);
                    setMiniYear((y) => y - 1);
                  } else {
                    setMiniMonth((m) => m - 1);
                  }
                }}
                onNext={() => {
                  if (miniMonth === 11) {
                    setMiniMonth(0);
                    setMiniYear((y) => y + 1);
                  } else {
                    setMiniMonth((m) => m + 1);
                  }
                }}
                selectedDate={selectedKey}
                onSelectDate={(d) => setAnchorDate(d)}
                eventDates={eventDates}
              />

              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-300">
                My Calendars
              </p>
              <div className="space-y-1.5">
                {CALENDAR_FILTERS.map((f) => (
                  <label
                    key={f.key}
                    className="flex items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(f.key)}
                      onChange={() => toggleFilter(f.key)}
                      className="h-3.5 w-3.5 rounded accent-neutral-900"
                    />
                    <span className={`h-2 w-2 rounded-full ${f.dot}`} />
                    {f.label}
                  </label>
                ))}
              </div>

              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-neutral-300">
                Categories
              </p>
              <div className="space-y-1.5">
                {CATEGORIES.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-2.5 px-1 py-1 text-sm text-neutral-600"
                  >
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-neutral-900">
                    {rangeLabel}
                  </h1>
                  <button
                    type="button"
                    onClick={goToday}
                    className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    Today
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <HelpCircle className="h-4 w-4 text-neutral-400" />
                  <Settings className="h-4 w-4 text-neutral-400" />
                  <div className="flex items-center rounded-xl bg-neutral-100 p-1">
                    {["day", "week", "month"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setViewMode(mode)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${viewMode === mode ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => openNewAt(selectedKey, 9)}
                    className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </button>
                </div>
              </div>

              {viewMode === "month" ? (
                <MonthGrid
                  year={anchorDate.getFullYear()}
                  month={anchorDate.getMonth()}
                  events={visibleEvents}
                  onDayClick={(d) => {
                    setAnchorDate(d);
                    setViewMode("day");
                  }}
                />
              ) : (
                <TimeGrid
                  days={days}
                  events={visibleEvents}
                  onSlotClick={openNewAt}
                  onEventClick={openEdit}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <EventModal
          initialData={editingEvent}
          defaultDate={prefill ? prefill.date : selectedKey}
          defaultHour={prefill ? prefill.hour : undefined}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
            setPrefill(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
