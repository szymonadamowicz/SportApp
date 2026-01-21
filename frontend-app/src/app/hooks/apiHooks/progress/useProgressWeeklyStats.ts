import { useMemo } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";

import { useNow } from "@/hooks/helperHooks/useNow";
import { WeeklyStats } from "@/types/progress/progress";
import { calculateWeeklyStats } from "@/helpers/utils/selectors/progress/progressSelector";

export const useWeeklyStats = (): WeeklyStats => {
  const { allWorkouts: workouts } = useWorkouts();
  const now = useNow();

  return useMemo(() => {
    return calculateWeeklyStats(workouts, now);
  }, [workouts, now]);
};
