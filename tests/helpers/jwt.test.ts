import { describe, expect, it } from "bun:test";

import { Unauthorized } from "@/helpers/HttpError";
import { createJwt, JwtPayload, verifyJwt } from "@/helpers/jwt";

describe("JWT Helper", () => {
  const payload: JwtPayload = {
    userId: "12345",
    email: "test@example.com",
    iat: Math.floor(Date.now() / 1000),
  };

  describe("createJwt", () => {
    it("should create a valid JWT", async () => {
      const token = await createJwt(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should create a JWT with the correct payload", async () => {
      const token = await createJwt(payload);
      const decodedPayload = await verifyJwt(token);

      expect(decodedPayload.userId).toBe(payload.userId);
      expect(decodedPayload.email).toBe(payload.email);
    });

    it("should create a JWT with the correct expiration time", async () => {
      const token = await createJwt(payload, "1h");
      const decodedPayload = await verifyJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);

      expect(decodedPayload.exp).toBeGreaterThan(currentTime);
    });
  });

  describe("verifyJwt", () => {
    it("should verify a valid JWT", async () => {
      const token = await createJwt(payload);
      const decodedPayload = await verifyJwt(token);

      expect(decodedPayload.userId).toBe(payload.userId);
      expect(decodedPayload.email).toBe(payload.email);
    });

    it("should throw an Unauthorized error for an invalid JWT", async () => {
      const invalidToken = "invalid.token.here";

      expect(verifyJwt(invalidToken)).rejects.toThrow(Unauthorized);
    });

    it("should throw an Unauthorized error for an expired JWT", async () => {
      const expiredPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) - 60,
      };
      const expiredToken = await createJwt(expiredPayload, "-1s");

      expect(verifyJwt(expiredToken)).rejects.toThrow(Unauthorized);
    });
  });
});
