import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Make DATABASE_URL optional if we only want to use MongoDB
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set. PostgreSql features will be disabled.");
}

export const pool = connectionString ? new Pool({ connectionString }) : null;
export const db = pool ? drizzle(pool, { schema }) : ({} as any);

// Add a helper to check if PostgreSql is available
export const isDbConnected = !!pool;

// Exporting schema for use in storage
export * as schema from "@shared/schema";
