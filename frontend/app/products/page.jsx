"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Boxes,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  Download,
  Upload,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Tag,
  PencilLine,
  Trash2,
  Copy,
  FileDown,
  X,
  Check,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { AddProductModal } from "@/components/products/AddProductModal";
import { ImportProductsModal } from "@/components/products/ImportProductsModal";

const PRODUCT_COLORS = [
  "bg-emerald-100 dark:bg-emerald-500/15",
  "bg-sky-100 dark:bg-sky-500/15",
  "bg-amber-100 dark:bg-amber-500/15",
  "bg-rose-100 dark:bg-rose-500/15",
  "bg-violet-100 dark:bg-violet-500/15",
  "bg-teal-100 dark:bg-teal-500/15",
];

const RAW_PRODUCTS = [
  ["Uxerflow T-Shirt #10 - White", 1.35, 471, 100, "In Stock", 5.0],
  ["Uxerflow T-Shirt #10 - Black", 1.35, 402, 0, "Out of Stock", 5.0],
  ["Uxerflow T-Shirt #19 - White", 1.35, 455, 20, "Restock", 4.9],
  ["SmartHome Hub", 150, 7, 12, "In Stock", 4.8],
  ["UltraSound Wireless Earbuds", 200, 5, 0, "Out of Stock", 4.8],
  ["ProVision 4K Monitor", 400.25, 1, 3, "Restock", 5.0],
  ["Uxerflow Retro Wave Shirt", 1.35, 120, 20, "In Stock", 4.7],
  ["Uxerflow Graphic Art T-Shirt", 1.35, 200, 0, "Out of Stock", 4.9],
  ["Uxerflow Classic Fit Crewneck", 28.5, 130, 11, "In Stock", 5.0],
  ["EchoWave Bluetooth Speaker", 55.5, 10, 20, "In Stock", 5.0],
  ["NimbusPro Backpack", 89.99, 34, 15, "In Stock", 4.6],
  ["AeroFit Running Shoes", 74.0, 58, 0, "Out of Stock", 4.5],
  ["LumaGlow Desk Lamp", 32.4, 22, 9, "In Stock", 4.4],
  ["PulseFit Smart Watch", 129.0, 18, 4, "Restock", 4.7],
  ["ZenBrew Coffee Maker", 64.99, 9, 6, "In Stock", 4.3],
  ["Vortex Gaming Mouse", 39.9, 47, 25, "In Stock", 4.8],
  ["Skyline Sunglasses", 19.99, 88, 0, "Out of Stock", 4.2],
  ["Uxerflow Denim Jacket", 45.0, 26, 8, "In Stock", 4.6],
  ["TerraTough Hiking Boots", 98.5, 14, 5, "Restock", 4.5],
  ["Aurora LED Strip Light", 17.25, 63, 40, "In Stock", 4.4],
  ["Nomad Travel Mug", 14.0, 150, 60, "In Stock", 4.9],
  ["Uxerflow Striped Polo", 22.75, 77, 0, "Out of Stock", 4.5],
  ["FlexCore Yoga Mat", 27.0, 41, 12, "In Stock", 4.7],
  ["Halo Ring Light", 36.6, 19, 3, "Restock", 4.3],
  ["Uxerflow Oversized Hoodie", 34.0, 96, 18, "In Stock", 4.8],
  ["CrispAir Mini Fan", 21.5, 30, 0, "Out of Stock", 4.1],
  ["Voyage Leather Wallet", 42.0, 25, 10, "In Stock", 4.6],
  ["GlowNest Table Lamp", 29.99, 12, 7, "In Stock", 4.4],
];

const INITIAL_PRODUCTS = RAW_PRODUCTS.map(
  ([name, price, sales, stock, status, rating], i) => ({
    id: i + 1,
    name,
    price,
    sales,
    stock,
    status,
    rating,
    imageUrl: "",
    images: [],
    color: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
  }),
);

const STATUS_STYLES = {
  "In Stock":
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  "Out of Stock":
    "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  Restock:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

const SORT_FIELDS = [
  { key: "name", label: "Product name" },
  { key: "price", label: "Price" },
  { key: "sales", label: "Sales" },
  { key: "revenue", label: "Revenue" },
  { key: "stock", label: "Stock" },
  { key: "rating", label: "Rating" },
];

const PER_PAGE_OPTIONS = [10, 25, 50];

function formatCurrency(value) {
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function downloadCsv(filename, rows) {
  const header = "Name,Price,Sales,Revenue,Stock,Status,Rating";
  const body = rows
    .map((p) =>
      [
        `"${p.name.replace(/"/g, '""')}"`,
        p.price.toFixed(2),
        p.sales,
        (p.price * p.sales).toFixed(2),
        p.stock,
        p.status,
        p.rating.toFixed(1),
      ].join(","),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ||
        "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      {status}
    </span>
  );
}

function RatingTag({ rating }) {
  if (!rating) {
    return (
      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
        New
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-neutral-700 dark:text-neutral-200">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function ProductThumb({ product, size = "h-10 w-10" }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-lg ${product.color}`}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
      )}
    </div>
  );
}

function MetricCard({ label, value, trend, up, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {value}
      </p>
      <p
        className={`mt-1 flex items-center gap-1 text-xs ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}
      >
        {up ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {trend}
      </p>
    </div>
  );
}

function BulkEditModal({ count, onClose, onApply }) {
  const [status, setStatus] = useState("In Stock");
  const [applyStock, setApplyStock] = useState(false);
  const [stock, setStock] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Edit {count} product{count === 1 ? "" : "s"}
          </h2>
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
              Set status
            </label>
            <div className="flex gap-2">
              {["In Stock", "Out of Stock", "Restock"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium ${
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

          <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={applyStock}
              onChange={(e) => setApplyStock(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-600"
            />
            Also update stock quantity
          </label>
          {applyStock && (
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="New stock quantity"
              inputMode="numeric"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          )}
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
            onClick={() =>
              onApply({
                status,
                stock: applyStock ? Number(stock) || 0 : null,
              })
            }
            className="rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
          >
            Apply changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [view, setView] = useState("table");
  const [showStats, setShowStats] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [openMenu, setOpenMenu] = useState(null); // 'filter' | 'sort' | 'columns' | 'more' | null
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [visibleColumns, setVisibleColumns] = useState({
    price: true,
    sales: true,
    revenue: true,
    stock: true,
    status: true,
    rating: true,
  });
  const [extraColumns, setExtraColumns] = useState([]);
  const [showAddColumnInput, setShowAddColumnInput] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [goToPageInput, setGoToPageInput] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showApplyCode, setShowApplyCode] = useState(false);
  const [codeValue, setCodeValue] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatuses, sortField, sortDir, perPage]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filterStatuses.length) {
      list = list.filter((p) => filterStatuses.includes(p.status));
    }
    if (sortField) {
      list = [...list].sort((a, b) => {
        const av = sortField === "revenue" ? a.price * a.sales : a[sortField];
        const bv = sortField === "revenue" ? b.price * b.sales : b[sortField];
        if (typeof av === "string") {
          return sortDir === "asc"
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
        }
        return sortDir === "asc" ? av - bv : bv - av;
      });
    }
    return list;
  }, [products, searchQuery, filterStatuses, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageProducts = filteredProducts.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );

  const stats = useMemo(() => {
    const totalRevenue = products.reduce((s, p) => s + p.price * p.sales, 0);
    const totalSold = products.reduce((s, p) => s + p.sales, 0);
    return {
      totalProducts: products.length,
      totalRevenue,
      totalSold,
      avgMonthlySales: Math.round(totalSold / 3),
    };
  }, [products]);

  const allPageSelected =
    pageProducts.length > 0 &&
    pageProducts.every((p) => selectedIds.has(p.id));

  function toggleMenu(name) {
    setOpenMenu((prev) => (prev === name ? null : name));
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageProducts.forEach((p) => next.delete(p.id));
      } else {
        pageProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleCreateProduct(product) {
    setProducts((prev) => [product, ...prev]);
    setShowAddModal(false);
    setToast(`Product "${product.name}" was added.`);
  }

  function handleImportProducts(rows) {
    setProducts((prev) => [...rows, ...prev]);
    setShowImportModal(false);
    setToast(`Imported ${rows.length} product${rows.length === 1 ? "" : "s"}.`);
  }

  function handleDeleteSelected() {
    if (!selectedIds.size) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected product(s)?`)) return;
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setToast(`Deleted ${selectedIds.size} product(s).`);
    clearSelection();
  }

  function handleApplyCode() {
    if (!codeValue.trim()) return;
    setToast(`Code "${codeValue.trim()}" applied to ${selectedIds.size} product(s).`);
    setCodeValue("");
    setShowApplyCode(false);
    clearSelection();
  }

  function handleBulkEditApply(changes) {
    setProducts((prev) =>
      prev.map((p) =>
        selectedIds.has(p.id)
          ? {
              ...p,
              status: changes.status,
              stock: changes.stock !== null ? changes.stock : p.stock,
            }
          : p,
      ),
    );
    setToast(`Updated ${selectedIds.size} product(s).`);
    setShowBulkEditModal(false);
    clearSelection();
  }

  function handleDuplicateSelected() {
    const toDuplicate = products.filter((p) => selectedIds.has(p.id));
    const duplicated = toDuplicate.map((p, i) => ({
      ...p,
      id: Date.now() + i,
      name: `${p.name} (copy)`,
    }));
    setProducts((prev) => [...duplicated, ...prev]);
    setToast(`Duplicated ${duplicated.length} product(s).`);
    setOpenMenu(null);
    clearSelection();
  }

  function handleExportSelected() {
    const rows = products.filter((p) => selectedIds.has(p.id));
    downloadCsv("selected-products.csv", rows);
    setOpenMenu(null);
  }

  function handleAddColumn() {
    const name = newColumnName.trim();
    if (!name) return;
    setExtraColumns((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewColumnName("");
    setShowAddColumnInput(false);
  }

  function goToPage(p) {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  }

  return (
    <div className="h-screen w-full overflow-x-auto bg-neutral-100 font-sans text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div style={{ minWidth: "1200px" }} className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  Products
                </h1>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Manage your catalog, stock, and pricing in one place.
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-56 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 py-2 pl-9 pr-3 text-sm text-neutral-700 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                  />
                </div>

                <div className="inline-flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1">
                  <button
                    type="button"
                    onClick={() => setView("table")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                      view === "table"
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <TableIcon className="h-4 w-4" />
                    Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
                      view === "grid"
                        ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Grid View
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu("filter")}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium ${
                      filterStatuses.length
                        ? "border-neutral-900 dark:border-emerald-600 bg-neutral-900 dark:bg-emerald-600 text-white"
                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                    {filterStatuses.length > 0 && (
                      <span className="rounded-full bg-white/20 px-1.5 text-xs">
                        {filterStatuses.length}
                      </span>
                    )}
                  </button>
                  {openMenu === "filter" && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute left-0 z-40 mt-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-xl">
                        <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                          Status
                        </p>
                        {Object.keys(STATUS_STYLES).map((s) => (
                          <label
                            key={s}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <input
                              type="checkbox"
                              checked={filterStatuses.includes(s)}
                              onChange={() =>
                                setFilterStatuses((prev) =>
                                  prev.includes(s)
                                    ? prev.filter((x) => x !== s)
                                    : [...prev, s],
                                )
                              }
                              className="h-4 w-4 rounded accent-emerald-600"
                            />
                            {s}
                          </label>
                        ))}
                        {filterStatuses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setFilterStatuses([])}
                            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu("sort")}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                    {sortField && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        · {SORT_FIELDS.find((f) => f.key === sortField)?.label}
                      </span>
                    )}
                  </button>
                  {openMenu === "sort" && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute left-0 z-40 mt-2 w-52 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-xl">
                        {SORT_FIELDS.map((f) => (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => {
                              setSortDir((prevDir) =>
                                sortField === f.key
                                  ? prevDir === "asc"
                                    ? "desc"
                                    : "asc"
                                  : "asc",
                              );
                              setSortField(f.key);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${
                              sortField === f.key
                                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                                : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            }`}
                          >
                            {f.label}
                            {sortField === f.key && (
                              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                {sortDir === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </button>
                        ))}
                        {sortField && (
                          <button
                            type="button"
                            onClick={() => setSortField(null)}
                            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-neutral-400 dark:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            Clear sort
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <label className="flex items-center gap-2 pl-1 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Show Statistics
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showStats}
                    onClick={() => setShowStats((v) => !v)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      showStats
                        ? "bg-emerald-500"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        showStats ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleMenu("columns")}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Customize
                  </button>
                  {openMenu === "columns" && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-xl">
                        <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                          Visible columns
                        </p>
                        {Object.keys(visibleColumns).map((col) => (
                          <label
                            key={col}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm capitalize text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <input
                              type="checkbox"
                              checked={visibleColumns[col]}
                              onChange={() =>
                                setVisibleColumns((prev) => ({
                                  ...prev,
                                  [col]: !prev[col],
                                }))
                              }
                              className="h-4 w-4 rounded accent-emerald-600"
                            />
                            {col}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => downloadCsv("products.csv", filteredProducts)}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:hover:bg-emerald-500"
                >
                  <Plus className="h-4 w-4" />
                  Add New Product
                </button>
              </div>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="mb-5 grid grid-cols-4 gap-4">
                <MetricCard
                  label="Total Product"
                  value={stats.totalProducts}
                  trend="+3 product vs last month"
                  up
                  icon={Boxes}
                />
                <MetricCard
                  label="Product Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  trend="+9% vs last month"
                  up
                  icon={DollarSign}
                />
                <MetricCard
                  label="Product Sold"
                  value={stats.totalSold.toLocaleString()}
                  trend="+7% vs last month"
                  up
                  icon={ShoppingCart}
                />
                <MetricCard
                  label="Avg. Monthly Sales"
                  value={stats.avgMonthlySales.toLocaleString()}
                  trend="+5% vs last month"
                  up
                  icon={TrendingUp}
                />
              </div>
            )}

            {/* Table view */}
            {view === "table" && (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allPageSelected}
                            onChange={toggleSelectPage}
                            className="h-4 w-4 rounded accent-emerald-600"
                          />
                        </th>
                        <th className="px-4 py-3">Product</th>
                        {visibleColumns.price && (
                          <th className="px-4 py-3">Price</th>
                        )}
                        {visibleColumns.sales && (
                          <th className="px-4 py-3">Sales</th>
                        )}
                        {visibleColumns.revenue && (
                          <th className="px-4 py-3">Revenue</th>
                        )}
                        {visibleColumns.stock && (
                          <th className="px-4 py-3">Stock</th>
                        )}
                        {visibleColumns.status && (
                          <th className="px-4 py-3">Status</th>
                        )}
                        {visibleColumns.rating && (
                          <th className="px-4 py-3">Rating</th>
                        )}
                        {extraColumns.map((col) => (
                          <th key={col} className="px-4 py-3">
                            {col}
                          </th>
                        ))}
                        <th className="relative w-10 px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setShowAddColumnInput((v) => !v)
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          {showAddColumnInput && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowAddColumnInput(false)}
                              />
                              <div className="absolute right-0 z-40 mt-2 flex w-52 gap-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-xl">
                                <input
                                  autoFocus
                                  value={newColumnName}
                                  onChange={(e) =>
                                    setNewColumnName(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddColumn()
                                  }
                                  placeholder="Column name"
                                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-2 py-1 text-xs font-normal normal-case text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddColumn}
                                  className="flex shrink-0 items-center justify-center rounded-lg bg-neutral-900 dark:bg-emerald-600 px-2 text-white"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageProducts.map((p) => {
                        const checked = selectedIds.has(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={`border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${
                              checked
                                ? "border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelect(p.id)}
                                className="h-4 w-4 rounded accent-emerald-600"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <ProductThumb product={p} />
                                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                  {p.name}
                                </span>
                              </div>
                            </td>
                            {visibleColumns.price && (
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                {formatCurrency(p.price)}
                              </td>
                            )}
                            {visibleColumns.sales && (
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                {p.sales.toLocaleString()} pcs
                              </td>
                            )}
                            {visibleColumns.revenue && (
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                {formatCurrency(p.price * p.sales)}
                              </td>
                            )}
                            {visibleColumns.stock && (
                              <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                                {p.stock}
                              </td>
                            )}
                            {visibleColumns.status && (
                              <td className="px-4 py-3">
                                <StatusBadge status={p.status} />
                              </td>
                            )}
                            {visibleColumns.rating && (
                              <td className="px-4 py-3">
                                <RatingTag rating={p.rating} />
                              </td>
                            )}
                            {extraColumns.map((col) => (
                              <td
                                key={col}
                                className="px-4 py-3 text-neutral-300 dark:text-neutral-600"
                              >
                                —
                              </td>
                            ))}
                            <td className="px-4 py-3" />
                          </tr>
                        );
                      })}
                      {pageProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan={12}
                            className="px-4 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500"
                          >
                            No products match your search or filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    Showing per page
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 outline-none"
                    >
                      {PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goToPage(1)}
                      disabled={safePage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(safePage - 1)}
                      disabled={safePage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {getPageList(safePage, totalPages).map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="flex h-8 w-8 items-center justify-center text-sm text-neutral-400 dark:text-neutral-500"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => goToPage(p)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                            p === safePage
                              ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(totalPages)}
                      disabled={safePage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      goToPage(Number(goToPageInput));
                      setGoToPageInput("");
                    }}
                    className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
                  >
                    Go to page
                    <input
                      value={goToPageInput}
                      onChange={(e) => setGoToPageInput(e.target.value)}
                      placeholder={String(safePage)}
                      inputMode="numeric"
                      className="w-14 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg px-2 py-1 font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Go
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Grid view */}
            {view === "grid" && (
              <div>
                <div className="grid grid-cols-4 gap-4">
                  {pageProducts.map((p) => {
                    const checked = selectedIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`overflow-hidden rounded-2xl border bg-white dark:bg-neutral-900 ${
                          checked
                            ? "border-emerald-400 ring-1 ring-emerald-400"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        <div className={`relative aspect-square w-full ${p.color}`}>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
                            </div>
                          )}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(p.id)}
                            className="absolute left-2 top-2 h-4 w-4 rounded accent-emerald-600"
                          />
                          <div className="absolute right-2 top-2">
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                        <div className="space-y-1.5 p-3">
                          <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {p.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                              {formatCurrency(p.price)}
                            </span>
                            <RatingTag rating={p.rating} />
                          </div>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">
                            {p.sales.toLocaleString()} pcs sold · {p.stock} in
                            stock
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {pageProducts.length === 0 && (
                    <div className="col-span-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
                      No products match your search or filters.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {getPageList(safePage, totalPages).map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`g-ellipsis-${i}`}
                        className="flex h-8 w-8 items-center justify-center text-sm text-neutral-400 dark:text-neutral-500"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                          p === safePage
                            ? "bg-neutral-900 dark:bg-emerald-600 text-white"
                            : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Floating bulk-action bar */}
            {selectedIds.size > 0 && (
              <div className="sticky bottom-6 z-30 mt-4 flex justify-center">
                <div className="flex items-center gap-1 rounded-2xl bg-neutral-900 dark:bg-neutral-800 px-3 py-2 text-white shadow-2xl">
                  <span className="px-2 text-sm font-medium">
                    {selectedIds.size} Selected
                  </span>
                  <span className="mx-1 h-5 w-px bg-white/20" />

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowApplyCode((v) => !v)}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm hover:bg-white/10"
                    >
                      <Tag className="h-4 w-4" />
                      Apply Code
                    </button>
                    {showApplyCode && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowApplyCode(false)}
                        />
                        <div className="absolute bottom-full left-1/2 z-40 mb-2 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 text-neutral-900 dark:text-neutral-100 shadow-xl">
                          <input
                            autoFocus
                            value={codeValue}
                            onChange={(e) => setCodeValue(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleApplyCode()
                            }
                            placeholder="Discount code"
                            className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 px-2 py-1.5 text-sm outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCode}
                            className="mt-2 w-full rounded-lg bg-neutral-900 dark:bg-emerald-600 py-1.5 text-sm font-medium text-white"
                          >
                            Apply
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBulkEditModal(true)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm hover:bg-white/10"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit Info
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-rose-400 hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu("more")}
                      className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/10"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenu === "more" && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setOpenMenu(null)}
                        />
                        <div className="absolute bottom-full left-1/2 z-40 mb-2 w-44 -translate-x-1/2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1 text-neutral-700 dark:text-neutral-200 shadow-xl">
                          <button
                            type="button"
                            onClick={handleDuplicateSelected}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={handleExportSelected}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <FileDown className="h-4 w-4" />
                            Export selected
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <span className="mx-1 h-5 w-px bg-white/20" />
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreateProduct}
        />
      )}

      {showImportModal && (
        <ImportProductsModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportProducts}
        />
      )}

      {showBulkEditModal && (
        <BulkEditModal
          count={selectedIds.size}
          onClose={() => setShowBulkEditModal(false)}
          onApply={handleBulkEditApply}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-neutral-900 dark:bg-emerald-600 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
