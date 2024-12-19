import { z } from "zod";

import logger from "./helpers/logger";

const configSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a number")
    .transform(Number)
    .default("3000"),
  API_PREFIX: z.string().default("/sinatra-api"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  API_KEY_CIPHER_SECRET: z
    .string()
    .min(32, "API_KEY_CIPHER_SECRET must be exactly 32 characters")
    .max(32, "API_KEY_CIPHER_SECRET must be exactly 32 characters"),
  NODE_ENV: z.enum(["development", "production", "test"]),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SECRET: z.string().min(1),
  COOKIE_DOMAIN: z.string().default("sinatra.polysharp.fr"),
});

const parseConfig = (env = Bun.env): Config => {
  const parsed = configSchema.safeParse(env);

  if (!parsed.success) {
    logger.fatal("Invalid configuration:", parsed.error.format());
    process.exit(1);
  }

  return Object.freeze(parsed.data);
};

export type Config = z.infer<typeof configSchema>;

export default { ...parseConfig() } as const;
