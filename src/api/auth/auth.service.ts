import db from "../../database/database";
import schemas from "../../database/schemas";
import { hashPassword, verifyPassword } from "../../helpers/hashpwd";
import { createJwt } from "../../helpers/jwt";

export const signUpService = async (email: string, password: string) => {
    const hashedPassword = await hashPassword(password);

    const [userCreated] = await db.insert(schemas.user).values({
        email,
        password: hashedPassword,
    }).returning({ id: schemas.user.id, email: schemas.user.email });

    const token = await createJwt({
        userId: userCreated.id,
        email: userCreated.email,
    });

    return { user: userCreated, token };
};

export const signInService = async (
    userFromDb: typeof schemas.user.$inferSelect,
    password: string,
) => {
    const passwordVerified = await verifyPassword(
        password,
        userFromDb.password,
    );

    if (!passwordVerified) {
        return { user: null, token: null };
    }

    const token = await createJwt({
        userId: userFromDb.id,
        email: userFromDb.email,
    });

    const { password: _, ...userWithoutPwd } = userFromDb;

    return { user: userWithoutPwd, token };
};
