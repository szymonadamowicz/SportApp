import { deepClone } from "@/mocks/runtime/clone";

describe("deepClone", () => {
  it("clones nested objects without preserving references", () => {
    const original = {
      id: "x",
      nested: {
        value: 1,
        list: [1, 2, 3],
      },
    };

    const cloned = deepClone(original);
    cloned.nested.value = 99;
    cloned.nested.list.push(4);

    expect(cloned).not.toBe(original);
    expect(cloned.nested).not.toBe(original.nested);
    expect(original.nested.value).toBe(1);
    expect(original.nested.list).toEqual([1, 2, 3]);
  });
});
