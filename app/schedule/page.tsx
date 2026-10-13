"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/BookingModal";
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2, MapPin, Plus } from "lucide-react";

interface Reservation {
  id: string;
  resourceId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    name: string;
  };
}

interface Resource {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(undefined);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleDateChange(delta: number) {
    if (!currentDate) return;
    const next = new Date(currentDate);
    next.setDate(next.getDate() + delta);
    setCurrentDate(next);
  }

  const dateString = currentDate ? currentDate.toISOString().split("T")[0] : "";

  // Filter reservations for the selected date
  const dayReservations = reservations.filter((r) => {
    if (r.status === "CANCELLED" || !dateString) return false;
    const rDate = new Date(r.startTime).toISOString().split("T")[0];
    return rDate === dateString;
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
        {/* Header with Date Navigator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Daily Timeline & Availability</h1>
            <p className="text-sm text-slate-400 mt-1">
              Visual overview of active bookings across all shared facilities and equipment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDateChange(-1)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>
                {currentDate
                  ? currentDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Today"}
              </span>
            </div>
            <button
              onClick={() => handleDateChange(1)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Timeline Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Time Slot Header */}
                <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-400">
                  <div className="col-span-3 p-4 border-r border-slate-800">Resource / Facility</div>
                  <div className="col-span-9 grid grid-cols-10 text-center divide-x divide-slate-800/60">
                    {timeSlots.slice(0, 10).map((time) => (
                      <div key={time} className="py-4">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Rows */}
                <div className="divide-y divide-slate-800/80">
                  {resources.map((resource) => {
                    const resBookings = dayReservations.filter((r) => r.resourceId === resource.id);

                    return (
                      <div key={resource.id} className="grid grid-cols-12 hover:bg-slate-900/40 transition-colors">
                        {/* Resource Info */}
                        <div className="col-span-3 p-4 border-r border-slate-800 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-white leading-tight">{resource.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {resource.location}
                            </span>
                            <span>• Cap: {resource.capacity}</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedResourceId(resource.id);
                              setIsBookingOpen(true);
                            }}
                            className="mt-2 text-left text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Book slot
                          </button>
                        </div>

                        {/* Timeline slots */}
                        <div className="col-span-9 p-3 relative flex items-center">
                          {resBookings.length === 0 ? (
                            <div className="w-full text-center text-xs text-slate-600 italic">
                              Available all day
                            </div>
                          ) : (
                            <div className="w-full space-y-1.5">
                              {resBookings.map((b) => {
                                const start = new Date(b.startTime);
                                const end = new Date(b.endTime);

                                return (
                                  <div
                                    key={b.id}
                                    className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs text-emerald-200 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                      <span className="font-semibold text-white">{b.title}</span>
                                      <span className="text-emerald-400/80">({b.user.name})</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => loadData()}
        preselectedResourceId={selectedResourceId}
      />
    </div>
  );
}
