import { PanelItem, Workout } from "@/types/types";

const workouts: Workout[] = [
  {
    id: "chest_001",
    name: "Chest Training",
    muscleGroup: "chest",
    completed: true,
    exercises: [
      { name: "Bench Press", sets: 3, reps: 8, weight: 80 },
      { name: "Incline Press", sets: 3, reps: 10, weight: 24 },
    ],
  },
  {
    id: "back_001",
    name: "Back Day",
    muscleGroup: "back",
    completed: false,
    exercises: [
      { name: "Pull-Ups", sets: 4, reps: 10 },
      { name: "Barbell Row", sets: 3, reps: 8, weight: 60 },
    ],
  },
  {
    id: "legs_001",
    name: "Leg Day",
    muscleGroup: "legs",
    completed: false,
    exercises: [
      { name: "Squat", sets: 4, reps: 6, weight: 100 },
      { name: "Lunges", sets: 3, reps: 10, weight: 20 },
    ],
  },
];

export const trainings: PanelItem[] = workouts.map((item, index) => ({
  title: item.name,
  subtitle: item.exercises
    .map((ex) => `${ex.name} ${ex.sets} x ${ex.reps}`)
    .join(`  • `),
  right: index == 0 ? "Next up" : null,
  workout: item,
}));

export const tipForTheDay: { tip: PanelItem[] } = {
  tip: [
    {
      title: "Brace before you press",
    },
  ],
};

export const weeklyProgress: PanelItem[] = [
  {
    id: "progress_001",
    title: "Total Volume",
    subtitle: "28,450 kg",
    bgColor: "bg-infoBlue/20",
  },
  {
    id: "progress_002",
    title: "Avg Intensity",
    subtitle: "RPE 7.5",
    bgColor: "bg-infoBlue/20",
  },
  {
    id: "progress_003",
    title: "PRs This Week",
    subtitle: "2",
    bgColor: "bg-infoBlue/20",
  },
];

export const recentHighlights: PanelItem[] = [
  {
    id: "highlight_001",
    title: "Deadlift PR",
    subtitle: "200 kg × 3",
    right: "+15 kg",
  },
  {
    id: "highlight_002",
    title: "Streak",
    subtitle: "7 days in a row",
    right: "Level Up",
  },
];
