"use client";

import { useRef, useState } from "react";
import { AlertCircle, FileSpreadsheet, UploadCloud, X } from "lucide-react";

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  const priceIdx = headers.indexOf("price");
  const stockIdx = headers.indexOf("stock");
  const statusIdx = headers.indexOf("status");

  return lines
    .slice(1)
    .map((line) => line.split(",").map((c) => c.trim()))
    .filter((cols) => cols[nameIdx])
    .map((cols) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: cols[nameIdx],
      price: priceIdx >= 0 ? Number(cols[priceIdx]) || 0 : 0,
      stock: stockIdx >= 0 ? Number(cols[stockIdx]) || 0 : 0,
      status: statusIdx >= 0 && cols[statusIdx] ? cols[statusIdx] : "In Stock",
      sales: 0,
      rating: 0,
      images: [],
      imageUrl: "",
      color: "bg-neutral-100 dark:bg-neutral-800",
    }));
}

export function ImportProductsModal({ onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState([]);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      setFileName("");
      setParsed([]);
      return;
    }
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result || ""));
      if (!rows.length) {
        setError("Couldn't find any valid rows. Make sure the file has a header row with at least a \"name\" column.");
        setParsed([]);
      } else {
        setParsed(rows);
      }
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parsed.length) return;
    onImport(parsed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Import products
            </h2>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              Upload a CSV with name, price, stock, status columns.
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

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center ${
            dragOver
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          {fileName ? (
            <>
              <FileSpreadsheet className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{fileName}</p>
              {parsed.length > 0 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {parsed.length} product{parsed.length === 1 ? "" : "s"} ready to import
                </p>
              )}
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Drag a CSV file here, or click to browse
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Headers: name, price, stock, status
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files && e.target.files[0])}
        />

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
            onClick={handleImport}
            disabled={!parsed.length}
            className="rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Import {parsed.length > 0 ? `(${parsed.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
