// bench/ws-bench-multiroom.ts
// Same as ws-bench-patched.ts, but spreads senders/receivers across many rooms
// instead of one, so the old O(N) global-scan code actually gets stressed.
import { WebSocket } from "ws";

type Stat = { latencies: number[]; delivered: number; sent: number };
const WS_URL = (process.env.WS_URL ?? "ws://localhost:8080").trim();
const TOKEN = (process.env.TOKEN ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZDg1NWU2Yy03MDJiLTQwNGYtOTNmZC02ZmJjZGRhMDczZjQiLCJpYXQiOjE3NjIzMzU2MTl9.UOeLxNz89xYYHHxV23J2kiCEtSONNk2DvwqLnjESI6Q").trim();

const NUM_ROOMS = Number(process.env.ROOMS ?? 200);
const RECEIVERS_PER_ROOM = Number(process.env.RECEIVERS_PER_ROOM ?? 3);
const SENDERS_PER_ROOM = Number(process.env.SENDERS_PER_ROOM ?? 1);
const MESSAGES_PER_SENDER = Number(process.env.MESSAGES ?? 50);
const SEND_INTERVAL_MS = Number(process.env.SEND_INTERVAL_MS ?? 20);

// Total connections = NUM_ROOMS * (RECEIVERS_PER_ROOM + SENDERS_PER_ROOM)
// Default: 200 rooms * 4 = 800 total sockets, but each broadcast only
// needs to reach 3 receivers -- this is where old code pays for scanning
// all ~800 users while new code only touches that room's Set.

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function buildUrl() {
  const u = new URL(WS_URL);
  if (TOKEN) u.searchParams.set("token", TOKEN);
  return u.toString();
}

async function connectClient(roomId: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(buildUrl());
    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "join_room", roomId }));
      resolve(ws);
    });
    ws.on("error", reject);
  });
}

async function run() {
  const stats: Stat = { latencies: [], delivered: 0, sent: 0 };
  const allReceivers: { ws: WebSocket; roomId: number }[] = [];
  const allSenders: { ws: WebSocket; roomId: number }[] = [];
  let joinedCount = 0;
  const totalReceivers = NUM_ROOMS * RECEIVERS_PER_ROOM;

  console.log(`Connecting ${NUM_ROOMS} rooms x (${SENDERS_PER_ROOM} senders + ${RECEIVERS_PER_ROOM} receivers)...`);

  for (let r = 0; r < NUM_ROOMS; r++) {
    for (let i = 0; i < RECEIVERS_PER_ROOM; i++) {
      const ws = await connectClient(r);
      ws.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          const now = Date.now();
          const handle = (m: any) => {
            if (m?.type === "chat") {
              const payload = JSON.parse(m.message);
              const ts = payload.ts ?? m.ts ?? msg.ts;
              if (typeof ts === "number") stats.latencies.push(now - ts);
              stats.delivered += 1;
            }
          };
          if (msg.type === "joined") { joinedCount += 1; return; }
          if (msg.type === "batch" && Array.isArray(msg.messages)) {
            for (const m of msg.messages) handle(m);
          } else {
            handle(msg);
          }
        } catch {}
      });
      allReceivers.push({ ws, roomId: r });
    }
    for (let i = 0; i < SENDERS_PER_ROOM; i++) {
      const ws = await connectClient(r);
      allSenders.push({ ws, roomId: r });
    }
  }

  const startWait = Date.now();
  while (joinedCount < totalReceivers && Date.now() - startWait < 20000) {
    await new Promise((res) => setTimeout(res, 50));
  }
  console.log(`Joined: ${joinedCount}/${totalReceivers}`);

  // warmup 2s across all rooms
  await new Promise<void>((resolve) => {
    const endAt = Date.now() + 2000;
    const tids: NodeJS.Timeout[] = [];
    allSenders.forEach((s, idx) => {
      const id = setInterval(() => {
        if (Date.now() >= endAt) { clearInterval(id); return; }
        const payload = JSON.stringify({ shape: { id: `w${idx}`, type: "rect", x: 1, y: 1, width: 10, height: 10 }, ts: Date.now() });
        s.ws.send(JSON.stringify({ type: "chat", roomId: s.roomId, message: payload }));
      }, SEND_INTERVAL_MS);
      tids.push(id);
    });
    setTimeout(() => { tids.forEach((id) => clearInterval(id)); setTimeout(resolve, 250); }, 2000);
  });

  stats.latencies.length = 0;
  stats.delivered = 0;
  stats.sent = 0;
  const measuredStart = Date.now();

  await new Promise<void>((resolve) => {
    let doneCount = 0;
    allSenders.forEach((s, idx) => {
      let sent = 0;
      const id = setInterval(() => {
        if (sent >= MESSAGES_PER_SENDER) {
          clearInterval(id);
          if (++doneCount === allSenders.length) setTimeout(resolve, 1000);
          return;
        }
        const payload = JSON.stringify({ shape: { id: `${idx}-${sent}`, type: "rect", x: 1, y: 1, width: 10, height: 10 }, ts: Date.now() });
        s.ws.send(JSON.stringify({ type: "chat", roomId: s.roomId, message: payload }));
        stats.sent += 1;
        sent += 1;
      }, SEND_INTERVAL_MS);
    });
  });

  const elapsedSeconds = (Date.now() - measuredStart) / 1000;
  [...allReceivers, ...allSenders].forEach((c) => c.ws.close());

  const p50 = percentile(stats.latencies, 50);
  const p95 = percentile(stats.latencies, 95);
  const actualDeliveredPerSec = Math.round((stats.delivered / elapsedSeconds) * 100) / 100;

  console.log(JSON.stringify({
    rooms: NUM_ROOMS,
    totalSockets: NUM_ROOMS * (RECEIVERS_PER_ROOM + SENDERS_PER_ROOM),
    sent: stats.sent,
    delivered: stats.delivered,
    p50ms: p50,
    p95ms: p95,
    elapsedSeconds: Math.round(elapsedSeconds * 100) / 100,
    actualDeliveredPerSec,
  }, null, 2));
}

run().catch((e) => { console.error(e); process.exit(1); });