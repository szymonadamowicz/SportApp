import { readJson, writeJson } from "@/mocks/runtime/storage";

describe("storage runtime helpers", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("returns fallback when key does not exist", () => {
    const fallback = { ok: true };

    const result = readJson("missing-key", fallback);

    expect(result).toEqual(fallback);
  });

  it("returns fallback when stored JSON is invalid", () => {
    localStorage.setItem("invalid", "{broken-json");

    const result = readJson("invalid", { ok: false });

    expect(result).toEqual({ ok: false });
  });

  it("writes and reads JSON payload", () => {
    writeJson("payload", { count: 2, label: "x" });

    const result = readJson("payload", { count: 0, label: "" });

    expect(result).toEqual({ count: 2, label: "x" });
  });

  it("does not throw when localStorage write fails", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation((): void => {
      throw new Error("quota");
    });

    expect(() => writeJson("payload", { count: 1 })).not.toThrow();
  });
});
