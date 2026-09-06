"use client";

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

export function Avatar({ name, size = "h-9 w-9" }) {
  return (
    <div
      className={`${size} ${colorForName(name)} flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white`}
    >
      {initialsForName(name)}
    </div>
  );
}
