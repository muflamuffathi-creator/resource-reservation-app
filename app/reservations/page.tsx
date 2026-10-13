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
      .then((data) => {
        if (!Array.isArray(data)) {
          setReservations([]);
          return;
        }
        setReservations(data);
      })
      .catch((err) => {
        console.error(err);
        setReservations([]);
      })
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

  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const filtered = safeReservations.filter((r) => {
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
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-emerald-400" /> Reservation Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Audit, filter, and manage scheduled organization bookings.
            </p>
          </div>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            New Reservation
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6">
          {(["ALL", "CONFIRMED", "CANCELLED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reservation List */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center">
            <p className="text-slate-400 text-sm">No reservations found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const start = new Date(r.startTime);
              const end = new Date(r.endTime);
              const isCancelled = r.status === "CANCELLED";

              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isCancelled
                      ? "border-slate-800/40 bg-slate-900/20 opacity-60"
                      : "border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        {r.resource?.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isCancelled
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-white">{r.title}</h3>

                    <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {start.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 font-medium pl-5.5">
                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                        {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{r.resource?.location}</span>
                      </div>
                    </div>

                    {r.notes && (
                      <p className="mt-3 text-xs italic text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Reserved by: <strong className="text-slate-200">{r.user?.name}</strong>
                    </span>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(r.id)}
                        className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        Cancel
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
