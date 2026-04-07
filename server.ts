import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // In-memory storage for demo purposes (in a real app, use a database)
  const quizzes: any[] = [];
  const results: any[] = [];

  // API Routes
  app.get("/api/quizzes", (req, res) => {
    res.json(quizzes);
  });

  app.post("/api/quizzes", (req, res) => {
    const quiz = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() };
    quizzes.push(quiz);
    res.json(quiz);
  });

  app.get("/api/quizzes/:id", (req, res) => {
    const quiz = quizzes.find(q => q.id === req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  });

  app.patch("/api/quizzes/:id", (req, res) => {
    const index = quizzes.findIndex(q => q.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Quiz not found" });
    quizzes[index] = { ...quizzes[index], ...req.body };
    res.json(quizzes[index]);
  });

  app.get("/api/results/:quizId", (req, res) => {
    const quizResults = results.filter(r => r.quizId === req.params.quizId);
    res.json(quizResults);
  });

  app.post("/api/results", (req, res) => {
    const result = { ...req.body, id: Math.random().toString(36).substr(2, 9), submittedAt: new Date() };
    results.push(result);
    res.json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
