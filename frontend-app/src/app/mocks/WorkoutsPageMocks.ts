import { Achievement, Workout, Tip, Highlights } from "@/types/types";

export const Workouts: Workout[] = [
  {
    id: 1,
    title: "Morning Yoga",
    date: "2024-06-10T14:30:00",
    muscleGroup: "Chest",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 3,
        reps: 10,
        weight: 100,
        restTimeSec: 120,
      },
      {
        id: 2,
        name: "Dips",
        sets: 5,
        reps: 12,
        weight: 0,
        restTimeSec: 60,
      },
    ],
    completed: true,
  },
  {
    id: 2,
    title: "Evening Cardio",
    date: "2025-11-30T02:30:00",
    muscleGroup: "full body",
    exercises: [
      {
        id: 1,
        name: "Squats",
        sets: 3,
        reps: 6,
        weight: 120,
        restTimeSec: 120,
      },
      {
        id: 2,
        name: "Leg extensions",
        sets: 5,
        reps: 12,
        weight: 80,
        restTimeSec: 60,
      },
    ],
    completed: false,
  },
];

export const Tips: Tip[] = [
  { title: "Stay Hydrated" },
  { title: "Warm Up Properly" },
];

export const WeeklyProgress: Achievement[] = [
  {
    title: "Total Volume",
    subtitle: "26,000kg",
  },
  { title: "Avg Intensity", subtitle: "RPE 7.5" },
  {
    title: "PRs Achieved this week",
    subtitle: "2",
  },
];

export const RecentHighlights: Highlights[] = [
  {
    title: "Deadlift PR",
    subtitle: "200 kg × 3",
    rightPopup: "+15 kg",
  },
  {
    title: "Streak",
    subtitle: "7 days in a row",
    rightPopup: "Level Up",
  },
];
