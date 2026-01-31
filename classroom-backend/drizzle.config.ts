import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  // It's okay if the local .env is empty; this prevents accidental runs without setup
  console.warn(
    "Warning: DATABASE_URL is not set. Fill your .env before running migrations.",
  );
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
