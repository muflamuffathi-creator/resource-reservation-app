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
      fetch("/api/resources").then((res) => res.json()).catch(() => []),
      fetch("/api/reservations").then((res) => res.json()).catch(() => []),
    ])
      .then(([resData, bookData]) => {
        setResources(Array.isArray(resData) ? resData : []);
        setReservations(Array.isArray(bookData) ? bookData : []);
      })
      .catch((err) => {
        console.error(err);
        setResources([]);
        setReservations([]);
      })
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

  function getSlotBooking(resourceId: string, time: string) {
    if (!dateString || !Array.isArray(reservations)) return null;
    const [hour] = time.split(":").map(Number);

    return reservations.find((r) => {
      if (r.resourceId !== resourceId || r.status === "CANCELLED") return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      const resDate = start.toISOString().split("T")[0];
      if (resDate !== dateString) return false;

      const startHour = start.getHours();
      const endHour = end.getHours() + (end.getMinutes() > 0 ? 1 : 0);
      return hour >= startHour && hour < endHour;
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-emerald-400" /> Facility Timeline & Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Interactive hourly visual matrix to track room occupancy and prevent overlaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-medium">
              <button
                onClick={() => handleDateChange(-1)}
                className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-32 text-center text-white font-semibold">
                {currentDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => handleDateChange(1)}
                className="rounded p-1 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Reserve Slot
            </button>
          </div>
        </div>

        {/* Timeline Matrix */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 overflow-x-auto shadow-2xl">
            <div className="min-w-[850px]">
              {/* Timeline Header (Time Slots) */}
              <div className="grid grid-cols-12 gap-2 border-b border-slate-800/80 pb-3 mb-3 text-center">
                <div className="col-span-3 text-left pl-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resource
                </div>
                {timeSlots.slice(0, 9).map((slot) => (
                  <div key={slot} className="col-span-1 text-[11px] font-medium text-slate-400">
                    {slot}
                  </div>
                ))}
              </div>

              {/* Resource Rows */}
              <div className="space-y-3">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="grid grid-cols-12 gap-2 items-center rounded-xl border border-slate-800/60 bg-slate-900/80 p-2.5 hover:border-slate-700 transition-all"
                  >
                    <div className="col-span-3 pl-2">
                      <h4 className="text-sm font-bold text-white truncate">{res.name}</h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" /> {res.location}
                      </p>
                    </div>

                    {/* Hourly Blocks */}
                    {timeSlots.slice(0, 9).map((slot) => {
                      const booking = getSlotBooking(res.id, slot);
                      return (
                        <div key={slot} className="col-span-1 h-12 flex items-center justify-center">
                          {booking ? (
                            <div
                              title={`${booking.title} (${booking.user.name})`}
                              className="h-full w-full rounded-lg bg-rose-500/20 border border-rose-500/40 p-1 flex flex-col justify-center items-center text-center cursor-help overflow-hidden"
                            >
                              <span className="text-[10px] font-bold text-rose-300 truncate w-full">
                                {booking.title}
                              </span>
                              <span className="text-[9px] text-rose-400/80 truncate w-full">
                                {booking.user.name}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedResourceId(res.id);
                                setIsBookingOpen(true);
                              }}
                              className="h-full w-full rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all flex items-center justify-center text-[10px] font-semibold text-emerald-500/70 hover:text-emerald-300 cursor-pointer"
                            >
                              Free
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
