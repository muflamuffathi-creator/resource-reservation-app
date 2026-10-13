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
      .then((data: Resource[]) => {
        setResources(data || []);
        // Extract unique categories
        const catMap = new Map<string, Category>();
        data.forEach((r) => {
          if (r.category) catMap.set(r.category.id, r.category);
        });
        const cats = Array.from(catMap.values());
        setCategories(cats);
        if (cats.length > 0 && !newCategoryId) setNewCategoryId(cats[0].id);
      })
      .catch((err) => console.error(err))
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
          capacity: newCapacity,
          description: newDescription,
          status: "ACTIVE",
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

  const filteredResources = resources.filter((r) => {
    const matchesCat = selectedCategory === "ALL" || r.categoryId === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenBooking={() => {
          setSelectedResourceId(undefined);
          setIsBookingOpen(true);
        }}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Facility & Equipment Directory</h1>
            <p className="text-sm text-slate-400 mt-1">
              Browse shared organization facilities, testing benches, and laboratory gear.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Resource</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Facilities ({resources.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, lab or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            No resources found matching the criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      {res.category?.name}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      {res.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {res.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[3rem]">
                    {res.description || "No special description provided for this resource."}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{res.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Capacity: {res.capacity}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedResourceId(res.id);
                      setIsBookingOpen(true);
                    }}
                    className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-sm cursor-pointer"
                  >
                    Reserve This Resource
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => loadResources()}
        preselectedResourceId={selectedResourceId}
      />

      {/* Add Resource Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Shared Resource</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spectrum Analyzer Bench"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 3, Rack A"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specs, usage notes or safety rules"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  {creating ? "Creating..." : "Save Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
