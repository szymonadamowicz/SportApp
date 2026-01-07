import {
  inputClass,
  inputErrorClass,
  errorHintClass,
  inlineInputClass,
  exerciseNameInputClass,
} from "@/helpers/ui/workoutCreateStyles";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { CreateModalProps } from "@/types/pages/workoutPage";
import clsx from "clsx";
import { Dumbbell, X, Plus } from "lucide-react";
import { useCreateWorkoutVM } from "../WorkoutCreateVM";
import { Field } from "./WorkoutCreateField";
import { IconButton } from "./WorkoutCreateIconButton";
import { SmallLabel } from "./WorkoutCreateSmallLabel";

export function CreateWorkoutModal({ open, onClose }: CreateModalProps) {
  useLockBodyScroll(open);
  const vm = useCreateWorkoutVM();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl md:max-w-2xl rounded-3xl bg-bgMain border border-borderSoft shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-borderSoft">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-textPrimary">
              Create new training
            </h2>
          </div>

          <IconButton onClick={onClose}>
            <X size={14} />
          </IconButton>
        </div>

        <div className="px-8 py-6 space-y-8 max-h-[65vh] overflow-y-auto">
          <Field
            label="Training name"
            hint="Give your workout a clear, recognizable name"
          >
            <input
              className={clsx(inputClass, vm.errors.title && inputErrorClass)}
              placeholder="e.g. Push Day"
              value={vm.title}
              onChange={(e) => vm.setTitle(e.target.value)}
            />
            {vm.errors.title && (
              <p className={errorHintClass}>{vm.errors.title}</p>
            )}
          </Field>

          <Field
            label="Muscle groups"
            hint="Select one or more muscle groups involved"
          >
            <div ref={vm.dropdownRef} className="relative">
              {vm.selectedMuscles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {vm.selectedMuscles.map((m) => (
                    <button
                      key={m}
                      onClick={() => vm.removeMuscle(m)}
                      className="
                        flex items-center gap-1
                        rounded-full
                        bg-accent/15 text-accent
                        px-3 py-1 text-sm
                        hover:bg-accent/25
                      "
                    >
                      {m}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              )}

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

              {vm.dropdownOpen && (
                <div
                  className="
                    absolute left-0 top-full mt-2
                    w-full
                    z-50
                    rounded-2xl
                    border border-borderSoft
                    bg-bgMain
                    shadow-xl
                  "
                >
                  <div className="max-h-52 overflow-y-auto py-1">
                    {vm.filteredMuscles.map((m) => (
                      <button
                        key={m}
                        onClick={() => vm.toggleTemp(m)}
                        className={clsx(
                          "w-full px-4 py-2 text-left text-sm",
                          vm.tempSelected.includes(m)
                            ? "bg-accent/15 text-accent"
                            : "hover:bg-bgHighlight"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-borderSoft px-3 py-2">
                    <span className="text-xs text-textMuted">
                      {vm.tempSelected.length} selected
                    </span>
                    <button
                      onClick={vm.confirmAddMuscles}
                      className="
                        inline-flex items-center gap-1
                        rounded-full bg-accent
                        px-4 py-1.5
                        text-xs font-medium text-bgMain
                        hover:bg-accentHover
                      "
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Field>

          <Field label="Schedule" hint="Choose when this training takes place">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  className={clsx(
                    inputClass,
                    vm.errors.date && inputErrorClass
                  )}
                  onChange={(e) => vm.setDate(e.target.value)}
                />
                {vm.errors.date && (
                  <p className={errorHintClass}>{vm.errors.date}</p>
                )}
              </div>

              <div>
                <input
                  type="time"
                  className={clsx(
                    inputClass,
                    vm.errors.time && inputErrorClass
                  )}
                  onChange={(e) => vm.setTime(e.target.value)}
                />
                {vm.errors.time && (
                  <p className={errorHintClass}>{vm.errors.time}</p>
                )}
              </div>
            </div>
          </Field>

          <Field label="Exercises" hint="Add one or more exercises">
            <div className="space-y-5">
              {vm.exercises.map((ex, index) => (
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
                    <IconButton onClick={() => vm.removeExercise(ex.id)} danger>
                      <X size={14} />
                    </IconButton>
                  </div>

                  <div className="space-y-1">
                    <SmallLabel>Name</SmallLabel>
                    <input
                      className={clsx(exerciseNameInputClass, "py-2 text-sm")}
                      value={ex.name}
                      onChange={(e) =>
                        vm.updateExercise(ex.id, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    className="
                      grid items-center gap-3
                      [grid-template-columns:115px_20px_115px_20px_115px_115px]
                    "
                  >
                    <div className="space-y-1">
                      <SmallLabel>Sets</SmallLabel>
                      <input
                        className={inlineInputClass}
                        value={ex.sets || ""}
                        onChange={(e) =>
                          vm.updateExercise(ex.id, {
                            sets:
                              Number(e.target.value.replace(/[^\d]/g, "")) || 0,
                          })
                        }
                      />
                    </div>

                    <span className="flex items-center justify-center text-textMuted text-sm pt-[24px]">
                      ×
                    </span>

                    <div className="space-y-1">
                      <SmallLabel>Reps</SmallLabel>
                      <input
                        className={inlineInputClass}
                        value={ex.reps || ""}
                        onChange={(e) =>
                          vm.updateExercise(ex.id, {
                            reps:
                              Number(e.target.value.replace(/[^\d]/g, "")) || 0,
                          })
                        }
                      />
                    </div>

                    <span className="flex items-center justify-center text-textMuted text-sm pt-[24px]">
                      @
                    </span>

                    <div className="space-y-1">
                      <SmallLabel>Weight</SmallLabel>
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
              ))}

              <button
                onClick={vm.addExercise}
                className="
                  inline-flex items-center gap-2
                  rounded-full bg-accent/15
                  px-4 py-2 text-sm text-accent
                  hover:bg-accent/25
                "
              >
                <Plus size={16} />
                Add exercise
              </button>
            </div>
          </Field>
        </div>

        {vm.showToast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-bgHighlight px-5 py-2 text-sm text-textPrimary shadow-lg">
            Please complete all required fields
          </div>
        )}

        <div className="flex justify-end gap-4 px-8 py-5 border-t border-borderSoft">
          <button
            onClick={onClose}
            className="
              rounded-full bg-bgHighlight/60
              px-4 py-2 text-sm
              text-textSecondary
              hover:bg-bgHighlight
              hover:text-textPrimary
            "
          >
            Cancel
          </button>

          <button
            onClick={vm.createWorkout}
            className="
              rounded-full bg-accent
              px-6 py-2 text-sm font-semibold
              text-bgMain
              hover:bg-accentHover
            "
          >
            Create training
          </button>
        </div>
      </div>
    </div>
  );
}
