"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertTriangle, CheckCircle2, Loader2, User } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedResourceId?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedResourceId,
}: BookingModalProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>(preselectedResourceId || "");
  
  // Date and Time inputs
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("10:00");
  const [endTime, setEndTime] = useState<string>("11:00");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);
  
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  // Real-time conflict state
  const [checkingConflict, setCheckingConflict] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSlotAvailable, setIsSlotAvailable] = useState<boolean | null>(null);
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch available resources
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        if (!selectedResourceId && data.length > 0) {
          setSelectedResourceId(preselectedResourceId || data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, [isOpen, preselectedResourceId]);

  useEffect(() => {
    if (preselectedResourceId) {
      setSelectedResourceId(preselectedResourceId);
    }
  }, [preselectedResourceId]);

  // Real-time pre-flight conflict check on time/resource change
  useEffect(() => {
    if (!selectedResourceId || !date || !startTime || !endTime) {
      setConflictError(null);
      setIsSlotAvailable(null);
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setConflictError("End time must be later than start time.");
      setIsSlotAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      setConflictError(null);
      try {
        const res = await fetch("/api/check-conflict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: selectedResourceId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
          }),
        });
        const data = await res.json();
        if (data.hasConflict) {
          setConflictError(data.error);
          setIsSlotAvailable(false);
        } else {
          setConflictError(null);
          setIsSlotAvailable(true);
        }
      } catch {
        setConflictError("Unable to verify slot availability.");
      } finally {
        setCheckingConflict(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedResourceId, date, startTime, endTime]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (conflictError || !isSlotAvailable) return;

    setSubmitting(true);
    setSubmitError(null);

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: selectedResourceId,
          title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete reservation.");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to book resource.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Reserve a Shared Resource</h3>
            <p className="text-xs text-slate-400">Strict conflict-prevention ensures zero overlapping bookings.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Resource Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Resource
            </label>
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.location} (Capacity: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Booking Purpose / Title
            </label>
            <input
              type="text"
              placeholder="e.g., Client Demo, Sprint Planning, Hardware Testing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-400" /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-400" /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Real-time Conflict Alert Badge */}
          <div className="pt-1">
            {checkingConflict ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Checking live schedule for potential overlaps...</span>
              </div>
            ) : conflictError ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Scheduling Conflict</p>
                  <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                </div>
              </div>
            ) : isSlotAvailable ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Slot is available! No overlapping reservations detected.</span>
              </div>
            ) : null}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Equipment requirements, team roster, or hybrid links"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {submitError && (
            <p className="text-xs font-semibold text-rose-400">{submitError}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || checkingConflict || !isSlotAvailable}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reserving...</span>
                </>
              ) : (
                <span>Confirm Reservation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
