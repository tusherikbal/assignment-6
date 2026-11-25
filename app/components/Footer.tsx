export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-[#090909] py-6 text-sm text-neutral-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 font-display text-base font-bold tracking-wider text-white">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#ccff00] text-xs font-extrabold text-black">
            FL
          </span>
          <span>FITLOG</span>
        </div>

        <p className="text-center text-xs sm:text-sm text-neutral-400">
          © 2026 FitLog — Workout Library. Train hard, log honest.
        </p>
      </div>
    </footer>
  );
}