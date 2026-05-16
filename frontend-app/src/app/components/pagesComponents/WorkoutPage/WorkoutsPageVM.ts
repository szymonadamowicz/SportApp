"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkouts } from "@/hooks/apiHooks/workouts/useWorkouts";
import { WorkoutListState } from "@/types/pages/workoutPage";
import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import {
  getUpcomingWorkouts,
  getMissedWorkouts,
  getCompletedWorkouts,
  sortAsc,
  getWorkoutsForWeek,
} from "@/helpers/utils/selectors/workout/workoutSelector";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useNow } from "@/hooks/helperHooks/useNow";
import { useRouter, useSearchParams } from "next/navigation";

export const useWorkoutsPageVM = () => {
  const { allWorkouts: workouts, isLoading, isError } = useWorkouts();
  const now = useNow();

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<
    string | undefined
  >(undefined);

  const searchParams = useSearchParams();
  const router = useRouter();

  const isCreateModalOpen = searchParams.get("modal") === "open";
  const selectedFromQuery = searchParams.get("selected") ?? undefined;

  const [seeAll, setSeeAll] = useLocalStorageState<boolean>(
    "workouts.seeAll",
    false,
  );

  const toggleSeeAll = () => {
    setSeeAll((v) => !v);
  };

  const openModal = () => {
    router.push("/workouts?modal=open", { scroll: false });
  };

  const closeModal = () => {
    router.push("/workouts", { scroll: false });
  };

  const closeSelectedWorkout = () => {
    setSelectedWorkoutId(undefined);
    router.push("/workouts", { scroll: false });
  };

  const upcoming = getUpcomingWorkouts(workouts, now);
  const upcomingSorted = sortAsc(upcoming);
  const upcomingThisWeek = getWorkoutsForWeek(upcomingSorted, now);
  const missedSorted = getMissedWorkouts(workouts, now);
  const completedSorted = getCompletedWorkouts(workouts, now);
  const visibleWorkouts = seeAll ? upcomingSorted : upcomingThisWeek;

  const fallbackWorkouts =
    visibleWorkouts.length > 0
      ? visibleWorkouts
      : upcomingSorted.length > 0
        ? upcomingSorted
        : missedSorted.length > 0
          ? missedSorted
          : completedSorted;
  const fallbackWorkoutId = fallbackWorkouts[0]?.id;

  useEffect(() => {
    if (!selectedFromQuery) return;
    setSelectedWorkoutId(selectedFromQuery);
  }, [selectedFromQuery]);

  useEffect(() => {
    if (selectedFromQuery) return;

    setSelectedWorkoutId((current) => {
      if (current && workouts.some((w) => w.id === current)) {
        return current;
      }

      return fallbackWorkoutId;
    });
  }, [selectedFromQuery, workouts, fallbackWorkoutId]);

  const selectedWorkout = useMemo(
    () => workouts.find((w) => w.id === selectedWorkoutId),
    [workouts, selectedWorkoutId],
  );

  const visibleWorkoutItems = visibleWorkouts.map((w) =>
    mapWorkoutToListItemVM(w, now),
  );

  const listState: WorkoutListState =
    visibleWorkouts.length === 0 ? "empty" : "hasData";

  const editWorkoutId = searchParams.get("edit");

  const selectedEditWorkoutId = editWorkoutId ?? undefined;

  return {
    now,

    visibleWorkouts,
    visibleWorkoutItems,
    listState,

    selectedWorkout,
    selectedWorkoutId,

    seeAll,
    toggleSeeAll,

    setSelectWorkout: (id: string) =>
      setSelectedWorkoutId((current) => (current === id ? undefined : id)),

    openModal,
    closeModal,
    closeSelectedWorkout,
    isCreateModalOpen,

    selectedEditWorkoutId,
    isLoading,
    isError,
  };
};
