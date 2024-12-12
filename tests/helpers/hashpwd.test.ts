import { describe, expect, it } from "bun:test";

import { hashPassword, verifyPassword } from "../../src/helpers/hashpwd";
import { InternalServerError, Unauthorized } from "../../src/helpers/HttpError";

describe("Hash Password Helper", () => {
  const password = "mySecretPassword";

  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });

    it("should throw InternalServerError if hashing fails", async () => {
      const originalHash = Bun.password.hash;

      Bun.password.hash = async () => {
        throw new Error("Hashing error");
      };

      const password = "securePassword123";
      expect(hashPassword(password)).rejects.toThrow(InternalServerError);

      Bun.password.hash = originalHash;
    });
  });

  describe("verifyPassword", () => {
    it("should verify a password successfully", async () => {
      const hashedPassword = await hashPassword(password);

      expect(verifyPassword(password, hashedPassword)).resolves.toBeUndefined();
    });

    it("should throw Unauthorized if the password does not match", async () => {
      const hashedPassword = await hashPassword("differentPassword");

      expect(verifyPassword(password, hashedPassword)).rejects.toThrow(
        Unauthorized,
      );
    });
  });
});
