"use client";

import {
  inputClass,
  inputErrorClass,
  errorHintClass,
  exerciseNameInputClass,
  inlineInputClass,
} from "@/helpers/ui/workoutCreateStyles";
import { useLockBodyScroll } from "@/hooks/helperHooks/useLockBodyScroll";
import { CreateModalProps } from "@/types/pages/workoutPage";
import clsx from "clsx";
import { Dumbbell, X, Plus } from "lucide-react";
import { Field } from "./WorkoutCreateField";
import { IconButton } from "./WorkoutCreateIconButton";
import { SmallLabel } from "./WorkoutCreateSmallLabel";
import { useWorkoutModalVM } from "../WorkoutModalVM";
import { AnimatePresence, motion } from "framer-motion";
import { overlay, modal, toast } from "./Variants";

export function CreateWorkoutModal({
  open,
  onClose,
  editModalId,
}: CreateModalProps) {
  useLockBodyScroll(open);

  const vm = useWorkoutModalVM({ editModalId, onClose, open });

  const isEditMode = vm.mode === "edit";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-4"
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="modal"
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
  relative max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-xl rounded-t-3xl sm:rounded-3xl md:max-w-2xl
  border border-borderSoft
  shadow-2xl overflow-hidden
  bg-[linear-gradient(180deg,#13171b,#0c0f12)]
"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-borderSoft px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex min-w-0 items-center gap-2">
                <Dumbbell className="h-5 w-5 text-accent" />
                <h2 className="truncate text-base font-semibold text-textPrimary sm:text-lg">
                  {isEditMode ? "Edit training" : "Create new training"}
                </h2>
              </div>

              <IconButton onClick={onClose}>
                <X size={14} />
              </IconButton>
            </div>

            <div className="rf-mobile-scroll max-h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom))] space-y-6 overflow-y-auto px-5 py-5 sm:max-h-[65vh] sm:space-y-8 sm:px-8 sm:py-6">
              <Field
                label="Training name"
                hint={
                  isEditMode
                    ? "Update the name of your training"
                    : "Give your workout a clear, recognizable name"
                }
              >
                <input
                  className={clsx(
                    inputClass,
                    vm.errors.title && inputErrorClass,
                  )}
                  placeholder={isEditMode ? "Training name" : "e.g. Push Day"}
                  value={vm.title}
                  onChange={(e) => vm.setTitle(e.target.value)}
                />
                <AnimatePresence>
                  {vm.errors.title && (
                    <motion.p
                      key="title-error"
                      className={errorHintClass}
                      initial={{ opacity: 0, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.14 }}
                    >
                      {vm.errors.title}
                    </motion.p>
                  )}
                </AnimatePresence>
              </Field>

              <Field label="Muscle groups">
                <div ref={vm.dropdownRef} className="relative">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {vm.selectedMuscles.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => vm.removeMuscle(m)}
                        className="
  rounded-full px-3 py-1 text-sm transition cursor-pointer
  bg-[rgba(34,197,94,0.10)]
  text-[rgba(167,243,208,0.95)]
  border border-[rgba(34,197,94,0.22)]
  hover:bg-[rgba(34,197,94,0.16)]
"
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <input
                    className={inputClass}
                    placeholder="Select or type muscle group"
                    value={vm.muscleInput}
                    onFocus={() => vm.setDropdownOpen(true)}
                    onChange={(e) => {
                      vm.setMuscleInput(e.target.value);
                      vm.setDropdownOpen(true);
                    }}
                  />

                  <AnimatePresence>
                    {vm.dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="
    absolute left-0 top-full mt-2 w-full z-50 overflow-hidden
    rounded-2xl
    border border-borderSoft
    shadow-[0_30px_90px_rgba(0,0,0,0.75)]
    backdrop-blur-md
  "
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(20,24,28,0.98), rgba(12,15,18,0.98))",
                        }}
                      >
                        <div className="max-h-52 overflow-y-auto py-1">
                          {vm.dropdownItems.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => vm.toggleTemp(m)}
                              className={clsx(
                                "w-full px-4 py-2 text-left text-sm transition cursor-pointer",
                                vm.tempSelected.includes(m)
                                  ? "bg-[rgba(34,197,94,0.15)] text-[rgba(167,243,208,1)] font-medium"
                                  : "text-textPrimary hover:bg-bgHighlight/60",
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-2 border-t border-borderSoft bg-bgMain/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={vm.addCustomMuscle}
                            disabled={!vm.muscleInput.trim()}
                            className={clsx(
                              "inline-flex min-h-10 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition border-2",
                              !vm.muscleInput.trim()
                                ? "bg-bgHighlight/50 text-textMuted/50 border-borderSoft/40 cursor-not-allowed"
                                : "bg-[rgba(34,197,94,1)] text-[rgb(10,15,20)] border-[rgba(34,197,94,1)] hover:bg-[rgba(34,197,94,0.88)] hover:border-[rgba(34,197,94,0.88)] cursor-pointer",
                            )}
                          >
                            Add custom
                          </button>

                          <button
                            type="button"
                            onClick={vm.confirmAddMuscles}
                            disabled={vm.tempSelected.length === 0}
                            className={clsx(
                              "inline-flex min-h-10 items-center justify-center gap-1 rounded-full px-5 py-2 text-sm font-semibold transition border-2",
                              vm.tempSelected.length === 0
                                ? "bg-bgHighlight/50 text-textMuted/50 border-borderSoft/40 cursor-not-allowed"
                                : "bg-[rgba(34,197,94,1)] text-[rgb(10,15,20)] border-[rgba(34,197,94,1)] hover:bg-[rgba(34,197,94,0.88)] hover:border-[rgba(34,197,94,0.88)] cursor-pointer",
                            )}
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              <Field
                label="Schedule"
                hint="Choose when this training takes place"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      type="date"
                      className={clsx(
                        inputClass,
                        vm.errors.date && inputErrorClass,
                      )}
                      value={vm.date}
                      onChange={(e) => vm.setDate(e.target.value)}
                    />
                    <AnimatePresence>
                      {vm.errors.date && (
                        <motion.p
                          key="date-error"
                          className={errorHintClass}
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.14 }}
                        >
                          {vm.errors.date}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <input
                      type="time"
                      className={clsx(
                        inputClass,
                        vm.errors.time && inputErrorClass,
                      )}
                      value={vm.time}
                      onChange={(e) => vm.setTime(e.target.value)}
                    />
                    <AnimatePresence>
                      {vm.errors.time && (
                        <motion.p
                          key="time-error"
                          className={errorHintClass}
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.14 }}
                        >
                          {vm.errors.time}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Field>

              {isEditMode && (
                <Field
                  label="Completion"
                  hint="Optionally mark this training as completed"
                >
                  <label className="inline-flex items-center gap-3 text-sm text-textPrimary">
                    <input
                      type="checkbox"
                      checked={vm.isCompleted}
                      onChange={(e) => vm.setIsCompleted(e.target.checked)}
                      className="h-4 w-4 rounded border-borderSoft bg-bgCard text-accent"
                    />
                    Mark this training as completed
                  </label>

                  <AnimatePresence initial={false}>
                    {vm.isCompleted && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14 }}
                        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
                      >
                        <div>
                          <input
                            type="date"
                            className={clsx(
                              inputClass,
                              vm.errors.completedDate && inputErrorClass,
                            )}
                            value={vm.completedDate}
                            onChange={(e) =>
                              vm.setCompletedDate(e.target.value)
                            }
                          />
                          <AnimatePresence>
                            {vm.errors.completedDate && (
                              <motion.p
                                key="completed-date-error"
                                className={errorHintClass}
                                initial={{ opacity: 0, y: -3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                transition={{ duration: 0.14 }}
                              >
                                {vm.errors.completedDate}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <input
                            type="time"
                            className={clsx(
                              inputClass,
                              vm.errors.completedTime && inputErrorClass,
                            )}
                            value={vm.completedTime}
                            onChange={(e) =>
                              vm.setCompletedTime(e.target.value)
                            }
                          />
                          <AnimatePresence>
                            {vm.errors.completedTime && (
                              <motion.p
                                key="completed-time-error"
                                className={errorHintClass}
                                initial={{ opacity: 0, y: -3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                transition={{ duration: 0.14 }}
                              >
                                {vm.errors.completedTime}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Field>
              )}

              <Field label="Exercises" hint="Add one or more exercises">
                <div className="space-y-5">
                  {vm.exercises.map((ex, index) => {
                    const fieldErrors = vm.errors.exerciseFields?.[ex.id];

                    return (
                      <div
                        key={ex.id}
                        className="
                          rounded-xl
                          border border-borderSoft/70
                          bg-bgHighlight/20
                          p-4 space-y-4
                        "
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-textSecondary">
                            Exercise {index + 1}
                          </p>
                          <IconButton
                            onClick={() => vm.removeExercise(ex.id)}
                            danger
                          >
                            <X size={14} />
                          </IconButton>
                        </div>

                        <div className="space-y-1">
                          <SmallLabel>Name</SmallLabel>
                          <input
                            className={clsx(
                              exerciseNameInputClass,
                              fieldErrors?.name && inputErrorClass,
                              "py-2 text-sm",
                            )}
                            value={ex.name}
                            onChange={(e) =>
                              vm.updateExercise(ex.id, { name: e.target.value })
                            }
                          />
                          <AnimatePresence>
                            {fieldErrors?.name && (
                              <motion.p
                                key={`exercise-name-error-${ex.id}`}
                                className={errorHintClass}
                                initial={{ opacity: 0, y: -3 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -3 }}
                                transition={{ duration: 0.14 }}
                              >
                                {fieldErrors.name}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div
                          className="
                          grid items-center gap-3
                          grid-cols-2 sm:[grid-template-columns:115px_20px_115px_20px_115px_115px]
                        "
                        >
                          <div className="space-y-1">
                            <SmallLabel>Sets*</SmallLabel>
                            <input
                              className={clsx(
                                inlineInputClass,
                                fieldErrors?.sets && inputErrorClass,
                              )}
                              value={ex.sets || ""}
                              onChange={(e) =>
                                vm.updateExercise(ex.id, {
                                  sets:
                                    Number(
                                      e.target.value.replace(/[^\d]/g, ""),
                                    ) || 0,
                                })
                              }
                            />
                            <AnimatePresence>
                              {fieldErrors?.sets && (
                                <motion.p
                                  key={`exercise-sets-error-${ex.id}`}
                                  className={errorHintClass}
                                  initial={{ opacity: 0, y: -3 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -3 }}
                                  transition={{ duration: 0.14 }}
                                >
                                  {fieldErrors.sets}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>

                          <span className="hidden items-center justify-center pt-[24px] text-sm text-textMuted sm:flex">
                            x
                          </span>

                          <div className="space-y-1">
                            <SmallLabel>Reps*</SmallLabel>
                            <input
                              className={clsx(
                                inlineInputClass,
                                fieldErrors?.reps && inputErrorClass,
                              )}
                              value={ex.reps || ""}
                              onChange={(e) =>
                                vm.updateExercise(ex.id, {
                                  reps:
                                    Number(
                                      e.target.value.replace(/[^\d]/g, ""),
                                    ) || 0,
                                })
                              }
                            />
                            <AnimatePresence>
                              {fieldErrors?.reps && (
                                <motion.p
                                  key={`exercise-reps-error-${ex.id}`}
                                  className={errorHintClass}
                                  initial={{ opacity: 0, y: -3 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -3 }}
                                  transition={{ duration: 0.14 }}
                                >
                                  {fieldErrors.reps}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>

                          <span className="hidden items-center justify-center pt-[24px] text-sm text-textMuted sm:flex">
                            @
                          </span>

                          <div className="space-y-1">
                            <SmallLabel>Weight (kg)</SmallLabel>
                            <input
                              className={inlineInputClass}
                              value={ex.weight ?? ""}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d]/g, "");
                                vm.updateExercise(ex.id, {
                                  weight: v ? Number(v) : undefined,
                                });
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                            <SmallLabel>Rest (s)</SmallLabel>
                            <input
                              className={inlineInputClass}
                              value={ex.restTimeSec ?? ""}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^\d]/g, "");
                                vm.updateExercise(ex.id, {
                                  restTimeSec: v ? Number(v) : undefined,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={vm.addExercise}
                    className={clsx(
                      `
      inline-flex min-h-11 w-full items-center justify-center gap-2 sm:w-auto
      rounded-full
      px-4 py-2 text-sm font-medium

      border border-[rgba(34,197,94,0.35)]
      text-accent
      bg-[rgba(34,197,94,0.10)]

      hover:bg-[rgba(34,197,94,0.18)]
      hover:border-[rgba(34,197,94,0.55)]

      active:scale-[0.98]
      transition
    `,
                    )}
                  >
                    <Plus size={16} />
                    Add exercise
                  </button>

                  <AnimatePresence>
                    {vm.errors.exercises && (
                      <motion.p
                        key="exercises-error"
                        className={errorHintClass}
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.14 }}
                      >
                        {vm.errors.exercises}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </Field>
            </div>

            <AnimatePresence>
              {vm.showToast && (
                <motion.div
                  key="toast"
                  variants={toast}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="fixed left-4 right-4 top-[calc(1rem+env(safe-area-inset-top))] z-[10000] rounded-xl border border-borderSoft bg-bgHighlight px-5 py-2 text-center text-sm text-textPrimary shadow-lg sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
                >
                  Please complete all required fields
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="
    flex flex-col-reverse gap-3 border-t border-borderSoft px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:gap-4 sm:px-8 sm:py-5
    bg-[linear-gradient(180deg,rgba(19,23,27,0.35),rgba(19,23,27,0.75))]
  "
            >
              <button
                type="button"
                onClick={onClose}
                className="
  min-h-11 w-full rounded-full px-5 py-2 text-sm font-semibold sm:w-auto
  border border-borderSoft
  bg-bgCard/80
  text-textSecondary
  hover:text-textPrimary
  hover:bg-bgCard-elevated
  hover:border-borderStrong
  transition
"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={vm.createOrUpdateWorkout}
                className="
  min-h-11 w-full rounded-full px-6 py-2 text-sm font-semibold sm:w-auto
  text-bgMain
  bg-[linear-gradient(180deg,#22c55e,#16a34a)]
  shadow-[0_10px_30px_rgba(34,197,94,0.22)]
  hover:shadow-[0_14px_45px_rgba(34,197,94,0.32)]
  hover:brightness-95
  active:scale-[0.99]
  transition
"
              >
                {isEditMode ? "Save changes" : "Create training"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
