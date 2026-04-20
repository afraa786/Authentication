const TAG_COLORS = {
  backend: "#6366f1",
  database: "#0ea5e9",
  frontend: "#10b981",
  infrastructure: "#f59e0b",
};

const TAG_ICONS = {
  backend: "⚙️",
  database: "🗄️",
  frontend: "🌐",
  infrastructure: "🖥️",
};

function uptime(history) {
  if (!history.length) return "—";
  const up = history.filter((h) => h.status === "up").length;
  return Math.round((up / history.length) * 100) + "%";
}

function avgMs(history) {
  const up = history.filter((h) => h.status === "up");
  if (!up.length) return "—";
  return Math.round(up.reduce((s, h) => s + h.ms, 0) / up.length) + "ms";
}

function sparkline(history) {
  return history
    .slice(-15)
    .map((h) => `<span class="dot ${h.status}" title="${h.ms}ms at ${h.at}"></span>`)
    .join("");
}

function serviceCard(s, result) {
  const color = TAG_COLORS[s.tag] || "#888";
  const icon = TAG_ICONS[s.tag] || "•";
  const isUp = result.status === "up";
  const statusClass = isUp ? "up" : "down";
  const statusLabel = isUp ? "Operational" : "Down";

  return `
    <div class="card ${statusClass}">
      <div class="card-header">
        <span class="tag" style="background:${color}">${icon} ${s.tag}</span>
        <span class="status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <h3>${s.name}</h3>
      ${s.note ? `<p class="note">${s.note}</p>` : ""}
      <div class="metrics">
        <div><span class="label">Response</span><span class="val">${isUp ? result.ms + "ms" : result.reason || "—"}</span></div>
        <div><span class="label">Uptime</span><span class="val">${uptime(s.history)}</span></div>
        <div><span class="label">Avg</span><span class="val">${avgMs(s.history)}</span></div>
      </div>
      <div class="sparkline">${sparkline(s.history)}</div>
    </div>`;
}

export function renderDashboard(latest, allHistory) {
  const resultMap = Object.fromEntries(latest.services.map((s) => [s.name, s]));
  const allUp = latest.services.every((s) => s.status === "up");
  const upCount = latest.services.filter((s) => s.status === "up").length;
  const total = latest.services.length;

  const cards = allHistory
    .map((s) => serviceCard(s, resultMap[s.name] || { status: "down", reason: "no data" }))
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="30">
<title>Auth System Status</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
  header { padding: 2rem; border-bottom: 1px solid #1e293b; }
  header h1 { font-size: 1.5rem; font-weight: 700; }
  header p { color: #94a3b8; font-size: 0.875rem; margin-top: 0.25rem; }
  .global { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
  .globe { width: 12px; height: 12px; border-radius: 50%; }
  .globe.up { background: #10b981; box-shadow: 0 0 8px #10b981; }
  .globe.down { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
  .globe-label { font-weight: 600; font-size: 1rem; }
  .sub { color: #64748b; font-size: 0.8rem; }
  main { padding: 2rem; max-width: 1100px; margin: 0 auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .card { background: #1e293b; border-radius: 12px; padding: 1.25rem; border: 1px solid #334155; transition: border-color .2s; }
  .card.down { border-color: #ef4444; }
  .card.up:hover { border-color: #4f46e5; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .tag { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 99px; color: #fff; text-transform: uppercase; }
  .status-badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; }
  .status-badge.up { background: #052e16; color: #10b981; }
  .status-badge.down { background: #450a0a; color: #ef4444; }
  h3 { font-size: 0.95rem; font-weight: 600; color: #f1f5f9; margin-bottom: 0.25rem; }
  .note { font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem; }
  .metrics { display: flex; gap: 1rem; margin: 0.75rem 0; }
  .metrics div { display: flex; flex-direction: column; }
  .label { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
  .val { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }
  .sparkline { display: flex; gap: 3px; align-items: flex-end; margin-top: 0.5rem; }
  .dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .dot.up { background: #10b981; }
  .dot.down { background: #ef4444; }
  footer { text-align: center; padding: 2rem; color: #334155; font-size: 0.75rem; }
  .refresh-note { color: #475569; font-size: 0.75rem; margin-top: 0.5rem; }
</style>
</head>
<body>
<header>
  <h1>🔐 Auth System — Status Dashboard</h1>
  <p>Multi-cloud deployment monitor · Last checked: ${new Date(latest.checkedAt).toLocaleString()}</p>
  <div class="global">
    <div class="globe ${allUp ? "up" : "down"}"></div>
    <span class="globe-label">${allUp ? "All Systems Operational" : `${upCount}/${total} Services Up`}</span>
  </div>
  <p class="refresh-note">Auto-refreshes every 30 seconds</p>
</header>
<main>
  <div class="grid">${cards}</div>
</main>
<footer>Built with Node.js · Hosted on Koyeb · Monitors Render · Neon · Vercel · Netlify · OCI</footer>
</body>
</html>`;
}
