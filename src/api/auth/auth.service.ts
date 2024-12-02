import db from "@/database/database";
import schemas from "@/database/schemas";
import { hashPassword, verifyPassword } from "@/helpers/hashpwd";
import { createJwt } from "@/helpers/jwt";

export default abstract class AuthService {
  /**
   * Handles user sign-up.
   * @param email {string} - The user's email address.
   * @param password {string} - The user's password.
   * @returns The newly created user and JWT token.
   * @throws {InternalServerError} If hashing fails.
   */
  static async signUp(email: string, password: string) {
    const hashedPassword = await hashPassword(password);

    const [userCreated] = await db
      .insert(schemas.user)
      .values({
        email,
        password: hashedPassword,
      })
      .returning({
        id: schemas.user.id,
        email: schemas.user.email,
        createdAt: schemas.user.createdAt,
        updatedAt: schemas.user.updatedAt,
      });

    const token = await createJwt({
      userId: userCreated.id,
      email: userCreated.email,
    });

    return { user: userCreated, token };
  }

  /**
   * Handles user sign-in.
   * @param userFromDb {typeof schemas.user.$inferSelect} - The user record from the database.
   * @param password {string} - The provided password.
   * @returns The authenticated user (without password) and JWT token.
   * @throws {Unauthorized} If the password does not match the hashed password.
   */
  static async signIn(
    userFromDb: typeof schemas.user.$inferSelect,
    password: string,
  ) {
    await verifyPassword(password, userFromDb.password);

    const token = await createJwt({
      userId: userFromDb.id,
      email: userFromDb.email,
    });

    const { password: _, ...userWithoutPwd } = userFromDb;

    return { user: userWithoutPwd, token };
  }
}
