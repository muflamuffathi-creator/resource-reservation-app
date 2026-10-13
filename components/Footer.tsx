import Link from "next/link";
import { Database, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-850 bg-slate-950/90 text-slate-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">PrimeWave Lab</span>
              <span className="text-xs text-slate-500">• (Pvt) Ltd</span>
            </div>
            <p className="text-xs text-slate-400">
              Turning Complexity into Possibility — Internal Facility & Resource Management.
            </p>
          </div>

          {/* System Status Indicators */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACID Conflict Engine Active</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-400">
              <Database className="h-3.5 w-3.5 text-teal-400" />
              <span>Neon PostgreSQL (Production)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 PrimeWave Lab. Built for Software Engineering Internship Assessment.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <Link href="/resources" className="hover:text-emerald-400 transition-colors">Resources</Link>
            <Link href="/schedule" className="hover:text-emerald-400 transition-colors">Timeline</Link>
            <Link href="/reservations" className="hover:text-emerald-400 transition-colors">Bookings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
