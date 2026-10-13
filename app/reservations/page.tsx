"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/BookingModal";
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Reservation {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  resource: {
    id: string;
    name: string;
    location: string;
    category?: {
      name: string;
    };
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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  function loadReservations() {
    setLoading(true);
    fetch("/api/reservations")
      .then((res) => res.json())
      .then((data) => setReservations(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReservations();
  }, []);

  function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this reservation? The slot will immediately become available to others.")) return;
    fetch("/api/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CANCELLED" }),
    })
      .then((res) => res.json())
      .then(() => loadReservations())
      .catch((err) => console.error(err));
  }

  const filtered = reservations.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Reservation Records & Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Audit, inspect, and manage active and historical bookings across all organizational units.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All ({reservations.length})
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "CONFIRMED"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Confirmed ({reservations.filter((r) => r.status === "CONFIRMED").length})
            </button>
            <button
              onClick={() => setStatusFilter("CANCELLED")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "CANCELLED"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Cancelled ({reservations.filter((r) => r.status === "CANCELLED").length})
            </button>
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500">
            No reservations found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => {
              const start = new Date(r.startTime);
              const end = new Date(r.endTime);
              const isCancelled = r.status === "CANCELLED";

              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCancelled
                      ? "border-slate-800/40 bg-slate-900/20 opacity-60"
                      : "border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {r.resource.category?.name || "Facility"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          isCancelled
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{r.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{r.resource.name} ({r.resource.location})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {r.notes && (
                      <p className="text-xs text-slate-400 italic flex items-center gap-1 mt-1">
                        <FileText className="h-3 w-3 text-slate-500" />
                        <span>Note: {r.notes}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-300">{r.user.name}</p>
                      <p className="text-slate-500 text-[11px]">{r.user.department?.name || r.user.email}</p>
                    </div>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => loadReservations()}
      />
    </div>
  );
}
