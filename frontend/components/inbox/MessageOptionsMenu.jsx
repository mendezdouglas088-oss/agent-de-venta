export function MessageOptionsMenu({
  align = "left",
  onReply,
  onForward,
  onCopy,
}) {
  return (
    <div
      className={`absolute bottom-0 z-20 mb-1 w-32 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-1 shadow-lg ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      <button
        type="button"
        onClick={onReply}
        className="block w-full px-3 py-1.5 text-left text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Responder
      </button>
      <button
        type="button"
        onClick={onForward}
        className="block w-full px-3 py-1.5 text-left text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Reenviar
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="block w-full px-3 py-1.5 text-left text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        Copiar
      </button>
    </div>
  );
}
