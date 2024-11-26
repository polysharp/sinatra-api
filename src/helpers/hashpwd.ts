import { InternalServerError, Unauthorized } from "./HttpError";

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

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<void> {
  const isValid = await Bun.password.verify(password, hashedPassword, "bcrypt");

  if (!isValid) {
    throw new Unauthorized("Invalid credentials");
  }
}
