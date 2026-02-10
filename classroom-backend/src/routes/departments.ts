import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/db.js";
import { departments, subjects } from "../db/schema/index.js";

const router = express.Router();

// route to get all departments with optional search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.max(
      1,
      Math.min(100, parseInt(String(limit), 10) || 10),
    );

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions: any[] = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(departments.name, `%${search}%`),
          ilike(departments.code, `%${search}%`),
        ),
      );
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count query with required join to subjects and identical where clause
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(departments)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    // Fetch paginated departments
    const departmentsList = await db
      .select({
        ...getTableColumns(departments),
        totalSubjects: sql<number>`count(${subjects.id})`,
      })
      .from(departments)
      .leftJoin(subjects, eq(departments.id, subjects.departmentId))
      .where(whereClause)
      .groupBy(departments.id)
      .orderBy(desc(departments.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: departmentsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error("GET / departments error:", e);
    res.status(500).json({ error: "Failed to get departments." });
  }
});

// route to create a new department
router.post("/", async (req, res) => {
  try {
    const [createdDept] = await db
      .insert(departments)
      .values({ ...req.body })
      .returning({ id: departments.id });

    if (!createdDept) throw Error;

    res.status(201).json({ data: createdDept });
  } catch (e) {
    console.error("POST /departments failed:", e);
    res.status(500).json({ error: "Failed to create department." });
  }
});

export default router;
