import { mockDelay } from "@/mocks/runtime/delay";

describe("mockDelay", () => {
  it("resolves after configured timeout", async () => {
    jest.useFakeTimers();

    const promise = mockDelay(25);

    jest.advanceTimersByTime(24);
    await Promise.resolve();

    let resolved = false;
    promise.then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();

    jest.useRealTimers();
  });
});
