import { Subject } from "../types";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description:
      "Foundations of programming, algorithms, and problem-solving using Python.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    code: "MATH201",
    name: "Calculus II",
    department: "Mathematics",
    description:
      "Techniques of integration, sequences and series, and applications to engineering.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    code: "ENG301",
    name: "Modern Literature",
    department: "English",
    description:
      "Survey of 20th-century literature with emphasis on analysis and context.",
    createdAt: new Date().toISOString(),
  },
];

export default mockSubjects;
