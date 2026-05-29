import EmptyState from "@/components/EmptyState/EmptyState";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import { WorkoutListItem } from "../../sections/WorkoutListItem";
import { WorkoutHistorySectionProps } from "@/types/pages/workoutPage";
import { PaginationControls } from "@/components/PaginationControls/PaginationControls";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 6;

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
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const selectedIndex = useMemo(
    () =>
      selectedId ? items.findIndex((item) => item.id === selectedId) : -1,
    [items, selectedId],
  );
  const pageItems = useMemo(
    () =>
      items.slice(
        safePage * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
      ),
    [items, safePage],
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
            {pageItems.map((item) => (
              <WorkoutListItem
                key={item.id}
                item={item}
                onClick={() => onSelect(item.id)}
                selected={selectedId === item.id}
              />
            ))}

            <PaginationControls
              page={safePage}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(0, current - 1))}
              onNext={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              previousLabel="Previous history page"
              nextLabel="Next history page"
            />
          </InfoPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
