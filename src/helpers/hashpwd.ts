import { InternalServerError, Unauthorized } from "./HttpError";

/**
 * Hashes a given password using the bcrypt algorithm.
 * @param password - The plain text password to be hashed.
 * @returns A promise that resolves to the hashed password string.
 * @throws {InternalServerError} if hashing fails.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    return hashedPassword;
  } catch (error) {
    throw new InternalServerError();
  }
}

/**
 * Verifies if the provided password matches the hashed password using bcrypt.
 * @param password - The plain text password to verify.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves if the password is valid, otherwise it throws an Unauthorized error.
 * @throws {Unauthorized} If the password does not match the hashed password.
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<void> {
  const isValid = await Bun.password.verify(password, hashedPassword, "bcrypt");

  if (!isValid) {
    throw new Unauthorized("Invalid credentials");
  }
}
