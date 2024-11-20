import { type JWTPayload, jwtVerify, SignJWT } from "jose";

const JWT_SECRET = Bun.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing");
}

const SECRET_KEY = new Uint8Array(Buffer.from(Bun.env.JWT_SECRET!, "utf-8"));

export interface JwtPayload extends JWTPayload {
    userId: string;
    email: string;
}

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

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as JwtPayload;
    } catch (error) {
        return null;
    }
}
