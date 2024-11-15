import { verifyJwt } from "../helpers/jwt";

export default async function authMiddleware(jwtToken?: string) {
    if (!jwtToken) {
        return undefined;
    }

    const token = jwtToken?.startsWith("Bearer ")
        ? jwtToken.slice(7)
        : jwtToken;

    const payload = await verifyJwt(token);

    if (!payload) {
        return undefined;
    }

    return payload;
}
