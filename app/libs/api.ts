import { Workout } from "@/app/types/workout";

const PRIMARY_API = "https://api.abcz.workers.dev/api/fitlog";
const FALLBACK_API = "https://api.api-store.workers.dev/api/fitlog";

function toNumber(val: unknown, fallback = 0): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const match = val.match(/[\d.]+/);
    if (match) {
      const parsed = Number(match[0]);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return fallback;
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeWorkout(raw: Record<string, unknown>, index: number): Workout {
  const id = String(raw.id ?? raw._id ?? index + 1);
  const name = String(raw.name ?? raw.title ?? `Workout ${index + 1}`);

  const rawCategories = raw.categories ?? raw.category ?? raw.tags ?? raw.muscleGroups ?? [];
  const categories = toStringArray(rawCategories);

  const rawInstructions = raw.instructions ?? raw.steps ?? [];
  const instructions = Array.isArray(rawInstructions)
    ? rawInstructions.map((step) => String(step).trim()).filter(Boolean)
    : typeof rawInstructions === "string"
      ? rawInstructions
          .split(/\n+|\d+\.\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return {
    id,
    name,
    subtitle: String(
      raw.subtitle ??
        raw.shortDescription ??
        raw.description ??
        "Focused compound movement for strength and conditioning."
    ),
    description: String(
      raw.description ??
        raw.subtitle ??
        "Focused compound movement for strength and conditioning."
    ),
    image: String(raw.image ?? raw.thumbnail ?? raw.img ?? "/placeholder-workout.png"),
    categories: categories.length ? categories : ["GENERAL"],
    equipment: String(raw.equipment ?? raw.equipments ?? "Bodyweight"),
    difficulty: String(raw.difficulty ?? raw.level ?? "Intermediate"),
    sets: String(raw.sets ?? "3-4"),
    reps: String(raw.reps ?? "8-12"),
    durationMinutes: toNumber(raw.duration ?? raw.durationMinutes ?? raw.minutes, 20),
    calories: toNumber(raw.calories ?? raw.kcal ?? raw.calorie, 150),
    rating: toNumber(raw.rating ?? raw.score, 4.5),
    instructions:
      instructions.length > 0
        ? instructions.slice(0, 4)
        : [
            "Set your stance and grip with a neutral spine.",
            "Brace your core and control the lowering phase.",
            "Drive through the working muscles with steady breathing.",
            "Reset smoothly and complete the prescribed reps.",
          ],
  };
}

function extractList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.workouts)) return obj.workouts as Record<string, unknown>[];
    if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
  }
  return [];
}

async function fetchFromEndpoints(urls: string[]): Promise<Response> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        lastError = new Error(`Request failed with status ${res.status} for ${url}`);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("All API endpoints failed");
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const res = await fetchFromEndpoints([PRIMARY_API, FALLBACK_API]);
  const json = await res.json();
  const list = extractList(json);
  return list.map((item, idx) => normalizeWorkout(item, idx));
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  try {
    const res = await fetchFromEndpoints([
      `${PRIMARY_API}/${encodeURIComponent(id)}`,
      `${FALLBACK_API}/${encodeURIComponent(id)}`,
    ]);
    const json = await res.json();
    const record =
      json && typeof json === "object"
        ? ((json as Record<string, unknown>).data ??
            (json as Record<string, unknown>).workout ??
            json)
        : null;

    if (record && typeof record === "object" && !Array.isArray(record)) {
      return normalizeWorkout(record as Record<string, unknown>, 0);
    }
  } catch {
    // Fallback to searching the full list if single-item endpoint doesn't match
  }

  const all = await getAllWorkouts();
  return all.find((w) => String(w.id) === String(id)) ?? null;
}