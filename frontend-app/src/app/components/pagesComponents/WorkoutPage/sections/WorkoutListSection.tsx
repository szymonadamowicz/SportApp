import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListSectionProps } from "@/types/pages/workoutPage";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { WorkoutListItem } from "./WorkoutListItem";

const stateTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function WorkoutListSection({
  item,
  listState,
  selectedId,
  title,
  seeAllLabel,
  onToggleSeeAll,
  onSelect,
}: WorkoutListSectionProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {listState === "hasData" ? (
        <motion.div
          key="workout-list"
          layout
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={stateTransition}
        >
          <InfoPanel
            title={title}
            outerButton={{
              label: seeAllLabel,
              onClick: onToggleSeeAll,
            }}
          >
            {item.map((vm) => (
              <WorkoutListItem
                key={vm.id}
                item={vm}
                selected={selectedId === vm.id}
                onClick={() => onSelect(vm.id)}
              />
            ))}
          </InfoPanel>
        </motion.div>
      ) : (
        <motion.div
          key="workout-empty"
          layout
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={stateTransition}
        >
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="No trainings left"
            description="You're all caught up. Enjoy your free time!"
            actionLabel={seeAllLabel}
            onAction={onToggleSeeAll}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
