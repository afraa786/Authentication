import express from "express";
import { checkAll, getAll } from "./checker.js";
import { renderDashboard } from "./dashboard.js";

const app = express();
const PORT = process.env.PORT || 3001;

let latest = { checkedAt: new Date().toISOString(), services: [] };

async function refresh() {
  try {
    latest = await checkAll();
    console.log(`[${latest.checkedAt}] checked ${latest.services.length} services`);
  } catch (e) {
    console.error("check failed:", e.message);
  }
}

// HTML dashboard
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(renderDashboard(latest, getAll()));
});

// JSON API — useful for other tools / your Vercel frontend
app.get("/status", (req, res) => {
  res.json({ ...latest, history: getAll() });
});

// Koyeb / Render health probe
app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, async () => {
  console.log(`Status dashboard running on port ${PORT}`);
  await refresh();
  setInterval(refresh, 30_000);
});
