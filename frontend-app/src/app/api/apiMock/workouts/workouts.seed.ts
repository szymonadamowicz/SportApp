import { WorkoutDTO } from "@/types/workout/workoutDTO";
import { Tip, Highlights } from "@/types/workout/workout";

export const workoutsSeed: WorkoutDTO[] = [
  {
    id: "w-2025-12-27-1",
    title: "Morning Strength",
    muscleGroups: ["chest", "shoulders"],
    mainFocus: "chest",
    scheduledAt: "2025-12-27T09:00:00",
    completedAt: null,
    exercises: [
      { id: "ex-bench", name: "Bench Press", sets: 3, reps: 10, weight: 100 },
      { id: "ex-dips", name: "Dips", sets: 4, reps: 12 },
    ],
  },
  {
    id: "w-2025-12-27-2",
    title: "Evening Cardio",
    muscleGroups: ["cardiovascular", "legs", "calves"],
    mainFocus: "cardio",
    scheduledAt: "2025-12-27T18:30:00",
    completedAt: null,
    exercises: [{ id: "ex-bike", name: "Stationary Bike", sets: 1, reps: 30 }],
  },
  {
    id: "w-2025-12-27-3",
    title: "Quick Mobility",
    muscleGroups: ["mobility", "flexibility"],
    mainFocus: "mobility",
    scheduledAt: "2025-12-27T01:23:10",
    completedAt: null,
    exercises: [
      { id: "ex-mobility", name: "Hip Mobility Flow", sets: 1, reps: 15 },
    ],
  },
  {
    id: "w-2025-12-25-1",
    title: "Lower Body Power",
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    mainFocus: "lower body",
    scheduledAt: "2025-12-25T17:00:00",
    completedAt: "2025-12-25T18:20:00",
    exercises: [
      { id: "ex-squat", name: "Back Squat", sets: 5, reps: 5, weight: 140 },
      {
        id: "ex-extensions",
        name: "Leg Extensions",
        sets: 4,
        reps: 12,
        weight: 80,
      },
    ],
  },
  {
    id: "w-2025-12-29-1",
    title: "Pull Day",
    muscleGroups: ["back", "biceps", "rear delts"],
    mainFocus: "back",
    scheduledAt: "2025-12-29T16:00:00",
    completedAt: null,
    exercises: [
      { id: "ex-pullups", name: "Pull-ups", sets: 4, reps: 8 },
      { id: "ex-row", name: "Barbell Row", sets: 4, reps: 10, weight: 90 },
    ],
  },
  {
    id: "w-2026-01-03-1",
    title: "Push Accessories",
    muscleGroups: ["shoulders", "triceps", "upper chest"],
    mainFocus: "shoulders",
    scheduledAt: "2026-01-03T16:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-shoulder-press",
        name: "Shoulder Press",
        sets: 4,
        reps: 8,
        weight: 60,
      },
      {
        id: "ex-triceps",
        name: "Triceps Pushdown",
        sets: 3,
        reps: 15,
        weight: 40,
      },
    ],
  },
  {
    id: "w-2026-01-05-1",
    title: "Rest & Recovery",
    muscleGroups: ["full body"],
    mainFocus: "recovery",
    scheduledAt: "2026-01-05T10:00:00",
    completedAt: null,
    exercises: [],
  },
  {
    id: "w-2026-01-06-1",
    title: "Core Blast",
    muscleGroups: ["core", "abdominals"],
    mainFocus: "core",
    scheduledAt: "2026-01-06T12:00:00",
    completedAt: null,
    exercises: [{ id: "ex-plank", name: "Plank Hold", sets: 3, reps: 60 }],
  },
  {
    id: "w-2026-06-01-1",
    title: "Hypertrophy Block Start",
    muscleGroups: ["back", "glutes", "hamstrings"],
    mainFocus: "full body",
    scheduledAt: "2026-06-01T17:00:00",
    completedAt: null,
    exercises: [
      { id: "ex-deadlift", name: "Deadlift", sets: 5, reps: 5, weight: 180 },
    ],
  },
];

export const Tips: Tip[] = [
  { title: "Stay Hydrated" },
  { title: "Warm Up Properly" },
];

export const RecentHighlights: Highlights[] = [
  { title: "Deadlift PR", subtitle: "200 kg × 3", rightPopup: "+15 kg" },
  { title: "Streak", subtitle: "7 days in a row", rightPopup: "Level Up" },
];
