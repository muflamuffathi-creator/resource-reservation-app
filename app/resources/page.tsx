"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/BookingModal";
import {
  Layers,
  MapPin,
  Users,
  Search,
  Plus,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
  description: string;
  categoryId: string;
  category: Category;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Resource Form
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCapacity, setNewCapacity] = useState(4);
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  function loadResources() {
    setLoading(true);
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setResources([]);
          return;
        }
        setResources(data);
        // Extract unique categories
        const catMap = new Map<string, Category>();
        data.forEach((r: Resource) => {
          if (r.category) catMap.set(r.category.id, r.category);
        });
        const cats = Array.from(catMap.values());
        setCategories(cats);
        if (cats.length > 0 && !newCategoryId) setNewCategoryId(cats[0].id);
      })
      .catch((err) => {
        console.error(err);
        setResources([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          categoryId: newCategoryId,
          location: newLocation,
          capacity: Number(newCapacity),
          description: newDescription,
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setNewName("");
        setNewLocation("");
        setNewDescription("");
        loadResources();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const safeResources = Array.isArray(resources) ? resources : [];
  const filteredResources = safeResources.filter((r) => {
    const matchesCat = selectedCategory === "ALL" || r.categoryId === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-emerald-400" /> Resource Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Browse, monitor, and provision organization-wide physical & digital assets.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add New Resource
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by resource name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
            <p className="text-slate-400 text-sm">No resources match your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      {res.category?.name || "Resource"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        res.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {res.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {res.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {res.description || "Shared facility available for booking."}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-slate-800/80 pt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{res.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Capacity: {res.capacity} people</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedResourceId(res.id);
                      setIsBookingOpen(true);
                    }}
                    className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer text-center"
                  >
                    Reserve Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Resource Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Create New Resource</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Media Production Studio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Building 2, Room 401"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes about equipment, access badge requirements..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {creating ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => loadResources()}
        preselectedResourceId={selectedResourceId}
      />
    </div>
  );
}
