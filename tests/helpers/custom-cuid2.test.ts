import { describe, expect, test } from "bun:test";

import { createId, isValidId } from "../../src/helpers/custom-cuid2";

describe("Custom CUID2 Helper", () => {
  test("createId generates an ID of specified length", () => {
    const length = 10;
    const id = createId(length);

    expect(id).toHaveLength(length);
  });

  test("createId generates a valid ID", () => {
    const id = createId();

    expect(isValidId(id)).toBe(true);
  });

  test("isValidId returns true for valid IDs", () => {
    const id = createId();

    expect(isValidId(id)).toBe(true);
  });

  test("isValidId returns false for invalid IDs", () => {
    const invalidId = "invalid-id";

    expect(isValidId(invalidId)).toBe(false);
  });
});
