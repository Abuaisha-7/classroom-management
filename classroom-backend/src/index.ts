import express, { Request, Response } from "express";

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
