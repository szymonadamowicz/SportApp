import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { PaginationControls } from "@/components/PaginationControls/PaginationControls";
import { WorkoutListSectionProps } from "@/types/pages/workoutPage";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { WorkoutListItem } from "./WorkoutListItem";

const ITEMS_PER_PAGE = 6;

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
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(item.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const selectedIndex = useMemo(
    () => (selectedId ? item.findIndex((vm) => vm.id === selectedId) : -1),
    [item, selectedId],
  );
  const pageItems = useMemo(
    () =>
      item.slice(
        safePage * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [item, safePage],
  );

  useEffect(() => {
    setPage(0);
  }, [title]);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      setPage(Math.floor(selectedIndex / ITEMS_PER_PAGE));
    }
  }, [selectedIndex]);

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
            {pageItems.map((vm) => (
              <WorkoutListItem
                key={vm.id}
                item={vm}
                selected={selectedId === vm.id}
                onClick={() => onSelect(vm.id)}
              />
            ))}

            <PaginationControls
              page={safePage}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(0, current - 1))}
              onNext={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              previousLabel="Previous workout page"
              nextLabel="Next workout page"
            />
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
