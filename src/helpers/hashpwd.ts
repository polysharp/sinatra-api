export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10,
    });
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    const isValid = await Bun.password.verify(
      password,
      hashedPassword,
      "bcrypt",
    );
    return isValid;
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
