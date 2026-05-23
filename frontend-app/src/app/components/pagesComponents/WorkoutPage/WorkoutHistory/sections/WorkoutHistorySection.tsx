import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListItem } from "../../sections/WorkoutListItem";
import { WorkoutHistorySectionProps } from "@/types/pages/workoutPage";
import { AnimatePresence, motion } from "framer-motion";

const stateTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

export function WorkoutHistorySection({
  title,
  items,
  empty,
  outerButton,
  onSelect,
  selectedId,
}: WorkoutHistorySectionProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {items.length === 0 ? (
        empty ? (
          <motion.div
            key="history-empty"
            layout
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={stateTransition}
          >
            <EmptyState
              icon={empty.icon}
              title={empty.title}
              description={empty.description}
              actionLabel={outerButton?.label}
              onAction={outerButton?.onClick}
            />
          </motion.div>
        ) : null
      ) : (
        <motion.div
          key="history-list"
          layout
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={stateTransition}
        >
          <InfoPanel title={title} outerButton={outerButton}>
            {items.map((item) => (
              <WorkoutListItem
                key={item.id}
                item={item}
                onClick={() => onSelect(item.id)}
                selected={selectedId === item.id}
              />
            ))}
          </InfoPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
