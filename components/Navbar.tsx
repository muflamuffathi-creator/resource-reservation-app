"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Layers, BookmarkCheck, PlusCircle } from "lucide-react";

interface NavbarProps {
  onOpenBooking?: () => void;
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/resources", label: "Resources", icon: Layers },
    { href: "/schedule", label: "Schedule & Timeline", icon: Calendar },
    { href: "/reservations", label: "All Bookings", icon: BookmarkCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            PW
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">PrimeWave</span>
            <span className="ml-1.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              Lab
            </span>
            <p className="text-[10px] text-slate-400">Resource Reservation System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {onOpenBooking && (
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Book Resource</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
