import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import schemas from "./schemas";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        "postgresql://myuser:mypassword@localhost:5432/mydatabase",
});

const db = drizzle(pool, { casing: "snake_case", schema: schemas });

export default db;
