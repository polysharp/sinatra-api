import { error } from "elysia";

import { verifyJwt } from "../helpers/jwt";

export const authMiddleware = async (
    { headers: { authorization } }: { headers: { authorization?: string } },
) => {
    if (!authorization) {
        throw error("Unauthorized");
    }

    const token = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;

    const payload = await verifyJwt(token);

    if (!payload) {
        throw error("Unauthorized");
    }

    return {
        user: {
            id: payload.userId,
            email: payload.email,
        },
    };
};
