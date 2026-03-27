import { isSameDay, isThisWeek } from "./workoutTime";

export const getWorkoutDay = (workoutDate: Date, now: Date) => {
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
  const isSame = isSameDay(workoutDate, now);

  if (isSame) {
    return "Today";
  }

  if (!isThisWeek(workoutDate, now)) {
    return getWorkoutDate(workoutDate);
  }

  return days[wDay];
};

export const getWorkoutDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
