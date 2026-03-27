import { progressMock } from "@/api/apiMock/progress/progress.mock";
import { mockProgressService } from "@/mocks/services/mockProgress.service";
import { ProgressDto } from "@/types/progress/progressDTO";

jest.mock("@/mocks/services/mockProgress.service", () => ({
  mockProgressService: {
    fetchProgress: jest.fn(),
  },
}));

const mockProgressServiceMock = mockProgressService as jest.Mocked<
  typeof mockProgressService
>;

const progressResult: ProgressDto = {
  streak: {
    current: 2,
    longest: 4,
    lastWorkoutDate: "2026-04-03T00:00:00.000Z",
  },
  stats: {
    totalWorkouts: 5,
    totalReps: 100,
    totalVolume: 10000,
    maxWeight: 140,
  },
  prs: [{ exerciseName: "Squat", maxWeight: 140 }],
};

describe("progressMock adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates fetchProgress with explicit scope", async () => {
    mockProgressServiceMock.fetchProgress.mockResolvedValue(progressResult);

    const result = await progressMock.fetchProgress("week");

    expect(mockProgressServiceMock.fetchProgress).toHaveBeenCalledWith("week");
    expect(result.stats.totalWorkouts).toBe(5);
  });

  it("uses default scope all", async () => {
    mockProgressServiceMock.fetchProgress.mockResolvedValue(progressResult);

    await progressMock.fetchProgress();

    expect(mockProgressServiceMock.fetchProgress).toHaveBeenCalledWith("all");
  });
});
