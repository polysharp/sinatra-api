import { z } from "zod";

const combinedEnv = {
  ...process.env,
  ...((typeof Bun !== "undefined" && Bun.env) || {}),
};

const configSchema = z.object({
  HOST: z.string().default("0.0.0.0"),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a number")
    .transform(Number)
    .default("3000"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Config = z.infer<typeof configSchema>;

export const parseConfig = (env = combinedEnv): Config => {
  const parsed = configSchema.safeParse(env);

  if (!parsed.success) {
    console.error(
      `Invalid configuration:\n${JSON.stringify(parsed.error.format(), null, 2)}`,
    );
    process.exit(1);
  }

  return Object.freeze(parsed.data);
};

export default { ...parseConfig() } as const;
