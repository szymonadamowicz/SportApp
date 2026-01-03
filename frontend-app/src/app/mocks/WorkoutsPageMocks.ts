// API MOCKS — symulacja backendu
import { WorkoutDTO } from "@/types/workoutDTO";
import { Achievement, Tip, Highlights } from "@/types/workout";

export const WorkoutsApiMock: WorkoutDTO[] = [
  {
    id: "w-2025-12-27-1",
    title: "Morning Strength",
    muscleGroup: "chest",
    scheduledAt: "2025-12-27T09:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-bench",
        name: "Bench Press",
        sets: 3,
        reps: 10,
        weight: 100,
        muscleGroups: ["chest", "shoulders", "triceps"],
      },
      {
        id: "ex-dips",
        name: "Dips",
        sets: 4,
        reps: 12,
        muscleGroups: ["chest", "triceps", "shoulders"],
      },
    ],
    notes: "Focus on controlled tempo",
  },

  {
    id: "w-2025-12-27-2",
    title: "Evening Cardio",
    muscleGroup: "cardio",
    scheduledAt: "2025-12-27T18:30:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-bike",
        name: "Stationary Bike",
        sets: 1,
        reps: 30,
        muscleGroups: ["cardiovascular", "legs"],
      },
    ],
  },

  {
    id: "w-2025-12-27-3",
    title: "Quick Mobility",
    muscleGroup: "mobility",
    scheduledAt: "2025-12-27T01:23:10",
    completedAt: null,
    exercises: [
      {
        id: "ex-mobility",
        name: "Hip Mobility Flow",
        sets: 1,
        reps: 15,
        muscleGroups: ["hips", "lower back"],
      },
    ],
  },

  {
    id: "w-2025-12-25-1",
    title: "Lower Body Power",
    muscleGroup: "lower body",
    scheduledAt: "2025-12-25T17:00:00",
    completedAt: "2025-12-25T18:20:00",
    exercises: [
      {
        id: "ex-squat",
        name: "Back Squat",
        sets: 5,
        reps: 5,
        weight: 140,
        muscleGroups: ["quadriceps", "glutes", "hamstrings", "core"],
      },
      {
        id: "ex-extensions",
        name: "Leg Extensions",
        sets: 4,
        reps: 12,
        weight: 80,
        muscleGroups: ["quadriceps"],
      },
    ],
  },

  {
    id: "w-2025-12-29-1",
    title: "Pull Day",
    muscleGroup: "back",
    scheduledAt: "2025-12-29T16:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-pullups",
        name: "Pull-ups",
        sets: 4,
        reps: 8,
        muscleGroups: ["lats", "biceps"],
      },
      {
        id: "ex-row",
        name: "Barbell Row",
        sets: 4,
        reps: 10,
        weight: 90,
        muscleGroups: ["back", "rear delts"],
      },
    ],
  },

  {
    id: "w-2026-01-03-1",
    title: "Push Accessories",
    muscleGroup: "upper body",
    scheduledAt: "2026-01-03T16:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-shoulder-press",
        name: "Shoulder Press",
        sets: 4,
        reps: 8,
        weight: 60,
        muscleGroups: ["shoulders", "triceps", "upper chest"],
      },
      {
        id: "ex-triceps",
        name: "Triceps Pushdown",
        sets: 3,
        reps: 15,
        weight: 40,
        muscleGroups: ["triceps"],
      },
    ],
  },

  {
    id: "w-2026-01-05-1",
    title: "Rest & Recovery",
    muscleGroup: "recovery",
    scheduledAt: "2026-01-05T10:00:00",
    completedAt: null,
    exercises: [],
    notes: "Optional stretching only",
  },

  {
    id: "w-2026-01-06-1",
    title: "Core Blast",
    muscleGroup: "core",
    scheduledAt: "2026-01-06T12:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-plank",
        name: "Plank Hold",
        sets: 3,
        reps: 60,
        muscleGroups: ["core"],
      },
    ],
  },

  {
    id: "w-2026-06-01-1",
    title: "Hypertrophy Block Start",
    muscleGroup: "full body",
    scheduledAt: "2026-06-01T17:00:00",
    completedAt: null,
    exercises: [
      {
        id: "ex-deadlift",
        name: "Deadlift",
        sets: 5,
        reps: 5,
        weight: 180,
        muscleGroups: ["posterior chain", "back"],
      },
    ],
  },
];

export const Tips: Tip[] = [
  { title: "Stay Hydrated" },
  { title: "Warm Up Properly" },
];

export const WeeklyProgress: Achievement[] = [
  {
    achievementTitle: "Total Volume",
    subtitle: "26,000kg",
  },
  { achievementTitle: "Avg Intensity", subtitle: "RPE 7.5" },
  {
    achievementTitle: "PRs Achieved this week",
    subtitle: "2",
  },
];

export const RecentHighlights: Highlights[] = [
  {
    highlightTitle: "Deadlift PR",
    subtitle: "200 kg × 3",
    rightPopup: "+15 kg",
  },
  {
    highlightTitle: "Streak",
    subtitle: "7 days in a row",
    rightPopup: "Level Up",
  },
];
