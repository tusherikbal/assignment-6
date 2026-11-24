"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Workout } from "@/app/types/workout";
const PLAN_KEY = "fitlog_today_plan_v1";
const SAVED_KEY = "fitlog_saved_workouts_v1";
const DONE_KEY = "fitlog_completed_ids_v1";
const MAX_PLAN_ITEMS = 5;

interface ToastItem {
  id: number;
  message: string;
}

interface FitLogContextType {
  todayPlan: Workout[];
  savedWorkouts: Workout[];
  completedIds: string[];
  toast: ToastItem | null;
  showToast: (message: string) => void;
  addToPlan: (workout: Workout) => void;
  removeFromPlan: (id: string) => void;
  toggleSave: (workout: Workout) => void;
  removeFromSaved: (id: string) => void;
  markAsDone: (id: string) => void;
  isInPlan: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
}

const FitLogContext = createContext<FitLogContextType | undefined>(undefined);

export function FitLogProvider({ children }: { children: React.ReactNode }) {
  const [todayPlan, setTodayPlan] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);

  // Load initial data from localStorage on client mount
  useEffect(() => {
    try {
      const rawPlan = localStorage.getItem(PLAN_KEY);
      const rawSaved = localStorage.getItem(SAVED_KEY);
      const rawDone = localStorage.getItem(DONE_KEY);

      if (rawPlan) setTodayPlan(JSON.parse(rawPlan));
      if (rawSaved) setSavedWorkouts(JSON.parse(rawSaved));
      if (rawDone) setCompletedIds(JSON.parse(rawDone));
    } catch {
      // Ignore malformed localStorage entries
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(PLAN_KEY, JSON.stringify(todayPlan));
  }, [todayPlan, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedWorkouts));
  }, [savedWorkouts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(DONE_KEY, JSON.stringify(completedIds));
  }, [completedIds, isHydrated]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2600);
  }, []);

  const addToPlan = useCallback(
    (workout: Workout) => {
      const exists = todayPlan.some((item) => item.id === workout.id);
      if (exists) {
        showToast("Already in today's plan");
        return;
      }
      if (todayPlan.length >= MAX_PLAN_ITEMS) {
        showToast("Today's plan cap reached (max 5 lifts)");
        return;
      }
      setTodayPlan((prev) => [...prev, workout]);
      showToast("Added to today's plan");
    },
    [todayPlan, showToast]
  );

  const removeFromPlan = useCallback(
    (id: string) => {
      setTodayPlan((prev) => prev.filter((item) => item.id !== id));
      setCompletedIds((prev) => prev.filter((doneId) => doneId !== id));
      showToast("Removed from today's plan");
    },
    [showToast]
  );

  const toggleSave = useCallback(
    (workout: Workout) => {
      const exists = savedWorkouts.some((item) => item.id === workout.id);
      if (exists) {
        setSavedWorkouts((prev) => prev.filter((item) => item.id !== workout.id));
        showToast("Removed from saved");
      } else {
        setSavedWorkouts((prev) => [...prev, workout]);
        showToast("Saved for later");
      }
    },
    [savedWorkouts, showToast]
  );

  const removeFromSaved = useCallback(
    (id: string) => {
      setSavedWorkouts((prev) => prev.filter((item) => item.id !== id));
      showToast("Removed from saved");
    },
    [showToast]
  );

  const markAsDone = useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        if (prev.includes(id)) {
          showToast("Already marked as done");
          return prev;
        }
        showToast("Workout marked as done");
        return [...prev, id];
      });
    },
    [showToast]
  );

  const isInPlan = useCallback(
    (id: string) => todayPlan.some((item) => item.id === id),
    [todayPlan]
  );

  const isSaved = useCallback(
    (id: string) => savedWorkouts.some((item) => item.id === id),
    [savedWorkouts]
  );

  const isCompleted = useCallback(
    (id: string) => completedIds.includes(id),
    [completedIds]
  );

  return (
    <FitLogContext.Provider
      value={{
        todayPlan,
        savedWorkouts,
        completedIds,
        toast,
        showToast,
        addToPlan,
        removeFromPlan,
        toggleSave,
        removeFromSaved,
        markAsDone,
        isInPlan,
        isSaved,
        isCompleted,
      }}
    >
      {children}

      {/* Simple Toast UI */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast.message}
        </div>
      )}
    </FitLogContext.Provider>
  );
}

export function useFitLog() {
  const ctx = useContext(FitLogContext);
  if (!ctx) {
    throw new Error("useFitLog must be used inside FitLogProvider");
  }
  return ctx;
}