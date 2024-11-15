import { createSecretKey } from "crypto";
import { type JWTPayload, jwtVerify, SignJWT } from "jose";

const SECRET_KEY = createSecretKey(
    Buffer.from(Bun.env.JWT_SECRET!, "utf-8"),
);

export interface JwtPayload extends JWTPayload {
    userId: number;
    email: string;
}

export async function createJwt(
    payload: JwtPayload,
    expiresIn = "1day",
): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(expiresIn)
        .setIssuedAt()
        .setNotBefore("0s")
        .sign(SECRET_KEY);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as JwtPayload;
    } catch (error) {
        return null;
    }
}
