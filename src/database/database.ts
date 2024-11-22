import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "@/config";

import schemas from "./schemas";

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

const db = drizzle(pool, { casing: "snake_case", schema: schemas });

export default db;
