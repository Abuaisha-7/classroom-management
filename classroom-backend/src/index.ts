import { eq } from "drizzle-orm";
import express, { Request, Response } from "express";
import { db } from "./db/db";
import { demoUsers } from "./db/schema";

async function main() {
  try {
    console.log("Performing CRUD operations...");

    // CREATE
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: "Admin User", email: "admin@example.com" })
      .returning();

    if (!newUser) throw new Error("Failed to create user");
    console.log("✅ CREATE: New user created:", newUser);

    // READ
    const found = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("✅ READ: Found user:", found[0]);

    // UPDATE
    const [updated] = await db
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updated) throw new Error("Failed to update user");
    console.log("✅ UPDATE: User updated:", updated);

    // DELETE
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("✅ DELETE: User deleted.");

    console.log("\nCRUD operations completed successfully.");
  } catch (err) {
    console.error("❌ Error performing CRUD operations:", err);
    process.exitCode = 1;
  }
}

void main();

const app = express();
const PORT = 8000;

// JSON middleware
app.use(express.json());

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from classroom-backend!" });
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/`);
});
