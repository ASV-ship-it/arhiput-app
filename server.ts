import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // In-memory "database"
  const db_mock = {
    users: [] as any[],
    archetypeProfiles: [] as any[],
    yearThemes: [] as any[],
    quarterObjectives: [] as any[],
    monthGoals: [] as any[],
    weekFocuses: [] as any[],
    dailySteps: [] as any[],
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/user", (req, res) => {
    const user = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db_mock.users.push(user);
    res.json(user);
  });

  app.get("/api/user/:id", (req, res) => {
    const user = db_mock.users.find(u => u.id === req.params.id);
    res.json(user || null);
  });

  app.patch("/api/user/:id", (req, res) => {
    const user = db_mock.users.find(u => u.id === req.params.id);
    if (user) {
      Object.assign(user, req.body);
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/data/init", (req, res) => {
    const { archetypeProfile, yearTheme, quarterObjectives, monthGoals, weekFocuses, dailySteps } = req.body;
    
    db_mock.archetypeProfiles.push(archetypeProfile);
    db_mock.yearThemes.push(yearTheme);
    db_mock.quarterObjectives.push(...quarterObjectives);
    db_mock.monthGoals.push(...monthGoals);
    db_mock.weekFocuses.push(...weekFocuses);
    db_mock.dailySteps.push(...dailySteps);

    res.json({ success: true });
  });

  app.get("/api/data/:userId", (req, res) => {
    const userId = req.params.userId;
    res.json({
      archetypeProfile: db_mock.archetypeProfiles.find(p => p.userId === userId),
      yearTheme: db_mock.yearThemes.find(t => t.userId === userId),
      quarterObjectives: db_mock.quarterObjectives.filter(o => o.userId === userId),
      monthGoals: db_mock.monthGoals.filter(g => g.userId === userId),
      weekFocuses: db_mock.weekFocuses.filter(f => f.userId === userId),
      dailySteps: db_mock.dailySteps.filter(s => s.userId === userId),
    });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const task = db_mock.dailySteps.find(s => s.id === req.params.id);
    if (task) {
      Object.assign(task, req.body);
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
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
