import AgentAPI from "apminsight";
AgentAPI.config();

import cors from "cors";
import "dotenv/config";
import express from "express";
import subjectsRouter from "./routes/subjects";
import securityMiddleware from "./middleware/security";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const app = express();
const PORT = 3000;

const FRONTEND_URL = process.env.FRONTEND_URL;

if (!FRONTEND_URL) {
  console.warn("Warning: FRONTEND_URL is not set. CORS may block requests.");
}

app.use(
  cors({
    origin: FRONTEND_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all('/api/auth/{*splat}', toNodeHandler(auth));

app.use(express.json());

app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
  res.send("Hello, welcome to the Classroom API!");
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
