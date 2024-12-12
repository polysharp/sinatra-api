import { describe, expect, it } from "bun:test";

import { decrypt, encrypt } from "@/helpers/crypto";

describe("Crypto Helper", () => {
  const testString = "Hello, World!";

  it("should encrypt a string", () => {
    const encrypted = encrypt(testString);

    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.split(":").length).toBe(2);
  });

  it("should decrypt an encrypted string", () => {
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(testString);
  });

  it("should throw an error if decryption fails", () => {
    const invalidEncryptedString = "invalid:encrypted:string";

    expect(() => decrypt(invalidEncryptedString)).toThrow();
  });
});
