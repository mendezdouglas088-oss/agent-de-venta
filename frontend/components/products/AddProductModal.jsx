"use client";

import { useRef, useState } from "react";
import { ImagePlus, Package, X } from "lucide-react";

const STATUS_OPTIONS = ["In Stock", "Out of Stock", "Restock"];

export function AddProductModal({ onClose, onCreate }) {
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("In Stock");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  }

  function removeImage(id) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function handleSave() {
    if (!name.trim()) return;
    onCreate({
      id: Date.now(),
      name: name.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      status,
      sales: 0,
      rating: 0,
      description: description.trim(),
      images: images.map((img) => img.url),
      imageUrl: images[0]?.url || "",
      color: "bg-neutral-100 dark:bg-neutral-800",
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
        className="w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Add new product
            </h2>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              Add product details and photos for your catalog.
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

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Product images
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
                >
                  <img
                    src={img.url}
                    alt="Product"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px] font-medium">Add photos</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
            {images.length > 0 && (
              <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                {images.length} {images.length === 1 ? "image" : "images"}{" "}
                selected · first image is used as the cover.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Product name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Uxerflow Retro Wave Shirt"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Price
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                Stock
              </label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium ${
                    status === s
                      ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description shown in the product library..."
              className="w-full resize-none rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
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
            disabled={!name.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Package className="h-4 w-4" />
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}
