"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFitLog } from "@/context/FitlogContext";

export default function Navbar() {
  const pathname = usePathname();
  const { todayPlan, savedWorkouts } = useFitLog();

  const isWorkoutActive = pathname === "/" || pathname.startsWith("/workout");
  const isPlanActive = pathname.startsWith("/my-plan");

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-wider text-white">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-[#ccff00] text-xs font-extrabold text-black">
            FL
          </span>
          <span>FITLOG</span>
        </Link>

        {/* Middle: Nav Links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`rounded-md px-3 py-1.5 transition ${
              isWorkoutActive
                ? "bg-neutral-800 text-[#ccff00]"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            Workout
          </Link>
          <Link
            href="/my-plan"
            className={`rounded-md px-3 py-1.5 transition ${
              isPlanActive
                ? "bg-neutral-800 text-[#ccff00]"
                : "text-neutral-300 hover:text-white"
            }`}
          >
            My Plan
          </Link>
        </nav>

        {/* Right: Plan & Saved Badges */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            href="/my-plan"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ccff00] px-3 py-1.5 text-black transition hover:brightness-95"
          >
            <span>Plan</span>
            <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[11px] font-bold">
              {todayPlan.length}
            </span>
          </Link>

          <Link
            href="/my-plan"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600 px-3 py-1.5 text-neutral-200 transition hover:border-white hover:text-white"
          >
            <span>Saved</span>
            <span className="rounded-full bg-neutral-800 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {savedWorkouts.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}