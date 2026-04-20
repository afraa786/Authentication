import { SERVICES } from "./services.js";

const TIMEOUT_MS = 8000;
const HISTORY_SIZE = 20;

const history = new Map(SERVICES.map((s) => [s.name, []]));

async function checkOne(service) {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(service.url, { signal: controller.signal });
    clearTimeout(timer);
    const ms = Date.now() - start;
    return { name: service.name, tag: service.tag, note: service.note, url: service.url, status: "up", code: res.status, ms };
  } catch (err) {
    clearTimeout(timer);
    const ms = Date.now() - start;
    const reason = err.name === "AbortError" ? "timeout" : err.message;
    return { name: service.name, tag: service.tag, note: service.note, url: service.url, status: "down", code: null, ms, reason };
  }
}

export async function checkAll() {
  const results = await Promise.all(SERVICES.map(checkOne));
  const now = new Date().toISOString();

  for (const r of results) {
    const h = history.get(r.name);
    h.push({ status: r.status, ms: r.ms, at: now });
    if (h.length > HISTORY_SIZE) h.shift();
  }

  return { checkedAt: now, services: results };
}

export function getHistory(name) {
  return history.get(name) || [];
}

export function getAll() {
  return SERVICES.map((s) => ({
    name: s.name,
    tag: s.tag,
    note: s.note,
    history: history.get(s.name),
  }));
}
