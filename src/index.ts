import express from "express";
import { initDatabase } from "./db/database";
import routes from "./routes";

const app = express();
const PORT = process.env["PORT"] ?? 3000;

app.use(express.json());
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Kanban API is running" });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });