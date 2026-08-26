export const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
];

export function colorForName(name) {
  const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function initialsForName(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = "h-9 w-9" }) {
  return (
    <div
      className={`${size} ${colorForName(name)} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white`}
    >
      {initialsForName(name)}
    </div>
  );
}

export function RailIcon({
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
