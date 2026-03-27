import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutHistorySection } from "@/components/pagesComponents/WorkoutPage/WorkoutHistory/sections/WorkoutHistorySection";

describe("WorkoutHistorySection", () => {
  it("shows action button in empty state when outerButton is provided", () => {
    const onToggle = jest.fn();

    render(
      <WorkoutHistorySection
        title="Missed trainings"
        items={[]}
        outerButton={{ label: "Show all", onClick: onToggle }}
        empty={{
          icon: "x",
          title: "No missed trainings",
          description: "All good",
        }}
        onSelect={jest.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Show all" });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
