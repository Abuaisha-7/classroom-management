import { and, count, eq, getTableColumns } from "drizzle-orm";
import express from "express";
import { db } from "../db/db.js";
import {
  classes,
  departments,
  enrollments,
  subjects,
  user,
} from "../db/schema";

const router = express.Router();

const getEnrollmentDetails = async (enrollmentId: number) => {
  const [enrollment] = await db
    .select({
      ...getTableColumns(enrollments),
      class: {
        ...getTableColumns(classes),
      },
      subject: {
        ...getTableColumns(subjects),
      },
      department: {
        ...getTableColumns(departments),
      },
      teacher: {
        ...getTableColumns(user),
      },
    })
    .from(enrollments)
    .leftJoin(classes, eq(enrollments.classId, classes.id))
    .leftJoin(subjects, eq(classes.subjectId, subjects.id))
    .leftJoin(departments, eq(subjects.departmentId, departments.id))
    .leftJoin(user, eq(classes.teacherId, user.id))
    .where(eq(enrollments.id, enrollmentId));

  return enrollment;
};

// Create enrollment

router.post("/", async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    if (!classId || !studentId) {
      return res
        .status(400)
        .json({ error: "classId and studentId are required" });
    }

    const [classRecord] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId));

    if (!classRecord) return res.status(404).json({ error: "Class not found" });

    // --- NEW: CAPACITY CHECK ---
    const [enrollmentResult] = await db
      .select({ value: count() })
      .from(enrollments)
      .where(eq(enrollments.classId, classId));

    const currentCount = enrollmentResult?.value ?? 0;

    if (classRecord.capacity !== null && currentCount >= classRecord.capacity) {
      return res
        .status(409)
        .json({ error: "Class has reached maximum capacity" });
    }
    // ---------------------------

    const [student] = await db
      .select()
      .from(user)
      .where(eq(user.id, studentId));

    if (!student) return res.status(404).json({ error: "Student not found" });

    const [existingEnrollment] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.studentId, studentId),
        ),
      );

    if (existingEnrollment)
      return res
        .status(409)
        .json({ error: "Student already enrolled in class" });

    const [createdEnrollment] = await db
      .insert(enrollments)
      .values({ classId, studentId })
      .returning({ id: enrollments.id });

    if (!createdEnrollment)
      return res.status(500).json({ error: "Failed to create enrollment" });

    const enrollment = await getEnrollmentDetails(createdEnrollment.id);

    res.status(201).json({ data: enrollment });
  } catch (error) {
    console.error("POST /enrollments error:", error);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
});

// Join class by invite code
router.post("/join", async (req, res) => {
  try {
    const { inviteCode, studentId } = req.body;

    if (!inviteCode || !studentId) {
      return res
        .status(400)
        .json({ error: "inviteCode and studentId are required" });
    }

    const [classRecord] = await db
      .select()
      .from(classes)
      .where(eq(classes.inviteCode, inviteCode));

    if (!classRecord) return res.status(404).json({ error: "Class not found" });

    // --- NEW: CAPACITY CHECK ---
    const [enrollmentResult] = await db
      .select({ value: count() })
      .from(enrollments)
      .where(eq(enrollments.classId, classRecord.id));

    const currentCount = enrollmentResult?.value ?? 0;

    if (classRecord.capacity !== null && currentCount >= classRecord.capacity) {
      return res
        .status(409)
        .json({ error: "Class has reached maximum capacity" });
    }
    // ---------------------------

    const [student] = await db
      .select()
      .from(user)
      .where(eq(user.id, studentId));

    if (!student) return res.status(404).json({ error: "Student not found" });

    const [existingEnrollment] = await db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classRecord.id),
          eq(enrollments.studentId, studentId),
        ),
      );

    if (existingEnrollment)
      return res
        .status(409)
        .json({ error: "Student already enrolled in class" });

    const [createdEnrollment] = await db
      .insert(enrollments)
      .values({ classId: classRecord.id, studentId })
      .returning({ id: enrollments.id });

    if (!createdEnrollment)
      return res.status(500).json({ error: "Failed to join class" });

    const enrollment = await getEnrollmentDetails(createdEnrollment.id);

    res.status(201).json({ data: enrollment });
  } catch (error) {
    console.error("POST /enrollments/join error:", error);
    res.status(500).json({ error: "Failed to join class" });
  }
});

export default router;
