export const getWorkoutDay = (workoutDate: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const wDay = new Date(workoutDate).getDay();

  return days[wDay];
};
