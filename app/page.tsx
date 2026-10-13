"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/BookingModal";
import {
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Resource {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
  description: string;
  category: Category;
  reservations: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }[];
}

interface Reservation {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  resource: {
    id: string;
    name: string;
    location: string;
  };
  user: {
    name: string;
    email: string;
    department?: {
      name: string;
      code: string;
    };
  };
}

export default function Dashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(undefined);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/resources").then((res) => res.json()),
      fetch("/api/reservations").then((res) => res.json()),
    ])
      .then(([resData, bookData]) => {
        setResources(resData || []);
        setReservations(bookData || []);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CANCELLED" }),
    })
      .then((res) => res.json())
      .then(() => loadData())
      .catch((err) => console.error(err));
  }

  const [todayDateString, setTodayDateString] = useState<string>("");

  useEffect(() => {
    setTodayDateString(new Date().toDateString());
  }, []);

  // Calculate live statistics
  const activeBookings = reservations.filter((r) => r.status === "CONFIRMED");
  const confirmedToday = activeBookings.filter((r) => {
    if (!todayDateString) return false;
    return new Date(r.startTime).toDateString() === todayDateString;
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
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>PrimeWave Lab Operational System</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Resource Reservation Hub
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Centralized management for shared laboratories, hardware testing stations,
                boardrooms, and creative gear. Built with strict collision prevention to guarantee zero double-bookings.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedResourceId(undefined);
                  setIsBookingOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
              >
                <span>Reserve a Resource</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Shared Resources</span>
              <Layers className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{resources.length}</div>
            <p className="mt-1 text-xs text-slate-400">Meeting rooms, labs & testing gear</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings Today</span>
              <Clock className="h-5 w-5 text-teal-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{confirmedToday.length}</div>
            <p className="mt-1 text-xs text-slate-400">Scheduled for today</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <Calendar className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">{activeBookings.length}</div>
            <p className="mt-1 text-xs text-slate-400">Across all facilities</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Conflict Prevention</span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-extrabold text-emerald-400">100%</div>
            <p className="mt-1 text-xs text-slate-400">Transactional isolation enforced</p>
          </div>
        </div>

        {/* Resources & Today's Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Shared Resources (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Featured Shared Resources</h2>
                <p className="text-xs text-slate-400">Browse availability and book directly</p>
              </div>
              <Link
                href="/resources"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View all ({resources.length}) <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.slice(0, 6).map((res) => {
                  const hasUpcoming = res.reservations && res.reservations.length > 0;
                  return (
                    <div
                      key={res.id}
                      className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            {res.category?.name || "Resource"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              res.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {res.status}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {res.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>

                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            <span>{res.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>Cap: {res.capacity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {hasUpcoming ? `${res.reservations.length} upcoming booking(s)` : "Free today"}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedResourceId(res.id);
                            setIsBookingOpen(true);
                          }}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Schedule (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Active Schedule</h2>
                <p className="text-xs text-slate-400">Live feed of reservations</p>
              </div>
              <Link
                href="/reservations"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
                No reservations scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((r) => {
                  const start = new Date(r.startTime);
                  const end = new Date(r.endTime);
                  const isCancelled = r.status === "CANCELLED";

                  return (
                    <div
                      key={r.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isCancelled
                          ? "border-slate-800/50 bg-slate-900/30 opacity-60"
                          : "border-slate-800 bg-slate-900/90 shadow-sm hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400 block">
                            {r.resource.name}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{r.title}</h4>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            isCancelled
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          <span>
                            {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} •{" "}
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          By: <strong className="text-slate-300">{r.user.name}</strong>
                          {r.user.department && ` (${r.user.department.code})`}
                        </span>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(r.id)}
                            className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        preselectedResourceId={selectedResourceId}
      />
    </div>
  );
}
