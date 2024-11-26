import { Unauthorized } from "@/helpers/HttpError";

import { verifyJwt } from "../helpers/jwt";

export const authMiddleware = async ({
  headers: { authorization },
}: {
  headers: { authorization?: string };
}) => {
  if (!authorization) {
    throw new Unauthorized("Authorization header is missing");
  }

  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : authorization;

  const payload = await verifyJwt(token);

  return {
    user: {
      id: payload.userId,
      email: payload.email,
    },
  };
};
