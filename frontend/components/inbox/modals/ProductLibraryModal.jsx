"use client";

import { Package, Plus, X } from "lucide-react";

export function ProductLibraryModal({ products, onClose, onAddProduct }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
      <div
        style={{ maxHeight: "85vh" }}
        className="w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
              Product library
            </h2>
            <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
              These images are available to reuse in posts.
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

        <div className="grid grid-cols-4 gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
            >
              <div className="aspect-square w-full">
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
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-200">
                  {p.name}
                </p>
                {p.price && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">{p.price}</p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddProduct}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
