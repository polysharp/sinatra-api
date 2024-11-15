import { eq, getTableColumns, SQL } from "drizzle-orm";
import db from "../../database/database";
import schemas from "../../database/schemas";

type WithoutPassword<T> = Omit<T, "password">;

export const getUserWithEmail = async <
    WithPassword extends boolean = false,
>(
    email: string,
    withPassword: WithPassword = false as WithPassword,
): Promise<
    WithPassword extends true ? typeof schemas.user.$inferSelect
        : WithoutPassword<typeof schemas.user.$inferSelect> | null
> => {
    let columns;
    if (!withPassword) {
        const { password, ...rest } = getTableColumns(schemas.user);
        columns = rest;
    } else {
        columns = getTableColumns(schemas.user);
    }

    const [userExists] = await db.select(columns).from(schemas.user).where(
        eq(schemas.user.email, email),
    ).limit(1);

    return userExists ? (userExists as any) : null;
};

// TODO: debug/test route => remove after feature release
export const getUsers = async () => {
    const users = await db.select().from(schemas.user);

    return users;
};
