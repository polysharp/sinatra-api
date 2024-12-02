import { type JWTPayload, jwtVerify, SignJWT } from "jose";

import config from "@/config";

import { Unauthorized } from "./HttpError";

const SECRET_KEY = new Uint8Array(Buffer.from(config.JWT_SECRET, "utf-8"));

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
}

/**
 * Creates a JSON Web Token (JWT) with the given payload and expiration time.
 * @param payload - The payload to include in the JWT.
 * @param expiresIn - The expiration time of the JWT. Defaults to "30days".
 * @returns A promise that resolves to the signed JWT as a string.
 */
export async function createJwt(
  payload: JwtPayload,
  expiresIn = "30days",
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .setNotBefore("0s")
    .sign(SECRET_KEY);
}

/**
 * Verifies a JSON Web Token (JWT) and returns its payload.
 * @param token - The JWT to verify.
 * @returns A promise that resolves to the payload of the verified JWT.
 * @throws {Unauthorized} If the token is invalid.
 */
export async function verifyJwt(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as JwtPayload;
  } catch (error) {
    throw new Unauthorized("Invalid token");
  }
}
