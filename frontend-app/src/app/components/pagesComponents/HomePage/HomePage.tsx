"use client";

import { LoadingSpinner } from "@/components/Loading/LoadingSpinner";
import { mapWorkoutToListItemVM } from "@/helpers/mappers/mapWorkoutToListItemVm";
import InfoPanel from "../../InfoPanel/InfoPanel";
import { WorkoutListItem } from "../WorkoutPage/sections/WorkoutListItem";
import { useHomePageVM } from "./HomePageVM";
import Hero from "./sections/HeroSection";
import HighlightItem from "./sections/HighlightItem";
import TipItem from "./sections/TipItem";
import WeeklyProgressItem from "./sections/WeeklyProgressItem";
import EmptyState from "@/components/EmptyState/EmptyState";
import { CalendarDays } from "lucide-react";

export default function HomePage() {
  const vm = useHomePageVM();

  if (vm.isLoading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <div className="relative">
      <Hero
        hero={vm.hero}
        activeRun={vm.activeRun}
        activeElapsedSeconds={vm.activeElapsedSeconds}
        completedCount={vm.statsWeekly.completedCount}
        upcomingCount={vm.statsWeekly.plannedCount}
        onPrimaryAction={() =>
          vm.activeRun
            ? vm.goTo(`/workout-run/${vm.activeRun.workoutId}`)
            : vm.hero.kind === "rest"
            ? vm.goTo("/workouts?modal=open")
            : vm.goTo(`/workout-run/${vm.hero.workout.id}`)
        }
      />

      <div className="mt-5 flex flex-col gap-5 md:mt-6 md:flex-row md:items-start md:gap-6">
        <div className="flex flex-1 flex-col gap-5 md:gap-6">
          {vm.today.hasItems ? (
            <InfoPanel
              title="Trainings Today"
              outerButton={{
                label: "See All",
                onClick: () => vm.goTo("/workouts"),
              }}
            >
              {vm.today.items.map((item) => (
                <WorkoutListItem
                  key={item.id}
                  item={mapWorkoutToListItemVM(item, vm.now)}
                  onClick={() => vm.goTo(`/workouts?selected=${item.id}`)}
                />
              ))}
            </InfoPanel>
          ) : (
            <EmptyState
              icon={<CalendarDays size={28} />}
              title="No upcoming workouts"
              description="Nothing scheduled for now."
              missed={vm.today.missedItems.length > 0}
              missedItems={vm.today.missedItems}
            />
          )}

          <InfoPanel title="Tips for the day">
            {vm.info.tips.map((tip, idx) => (
              <TipItem key={idx} title={tip.title} />
            ))}
          </InfoPanel>
        </div>

        <div className="flex flex-1 flex-col gap-5 md:gap-6">
          <InfoPanel
            title="Week progress"
            desc={`sessions ${vm.statsWeekly.completedCount}/${vm.statsWeekly.plannedCount}`}
            progress={
              vm.statsWeekly.completedCount / vm.statsWeekly.plannedCount
            }
            layout="row"
            maxPerRow={3}
          >
            {vm.info.progress.map((item, idx) => (
              <WeeklyProgressItem
                key={idx}
                id={item.id}
                title={item.title}
                value={item.value}
                context={item.context}
                subLabel={item.subLabel}
              />
            ))}
          </InfoPanel>

          <InfoPanel
            title="Recent highlights"
            outerButton={{
              label: "See All",
              onClick: () => vm.goTo("/progress"),
            }}
          >
            {vm.info.highlights.map((h, idx) => (
              <HighlightItem key={idx} highlight={h} />
            ))}
          </InfoPanel>
        </div>
      </div>
    </div>
  );
}
