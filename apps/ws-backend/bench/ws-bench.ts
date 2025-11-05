// bench/ws-bench.ts
import { WebSocket } from "ws";

type Stat = { latencies: number[]; delivered: number; sent: number };
const WS_URL = (process.env.WS_URL ?? "ws://localhost:8080").trim();
const TOKEN = (
  process.env.TOKEN ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZDg1NWU2Yy03MDJiLTQwNGYtOTNmZC02ZmJjZGRhMDczZjQiLCJpYXQiOjE3NjIzMzU2MTl9.UOeLxNz89xYYHHxV23J2kiCEtSONNk2DvwqLnjESI6Q"
).trim();
const ROOM_ID = Number(process.env.ROOM_ID ?? 1);

const NUM_RECEIVERS = Number(process.env.RECEIVERS ?? 50);
const NUM_SENDERS = Number(process.env.SENDERS ?? 5);
const MESSAGES_PER_SENDER = Number(process.env.MESSAGES ?? 200);
const SEND_INTERVAL_MS = Number(process.env.SEND_INTERVAL_MS ?? 20);

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

async function connectClient(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(buildUrl());
    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "join_room", roomId: ROOM_ID }));
      resolve(ws);
    });
    ws.on("error", reject);
  });
}

async function run() {
  const receivers: WebSocket[] = [];
  const senders: WebSocket[] = [];
  const stats: Stat = { latencies: [], delivered: 0, sent: 0 };

  // receivers
  let joinedCount = 0;
  for (let i = 0; i < NUM_RECEIVERS; i++) {
    const ws = await connectClient();
    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const now = Date.now();

        if (msg.type === "joined" && Number(msg.roomId) === ROOM_ID) {
          joinedCount += 1;
          return;
        }

        const handle = (m: any) => {
          if (m?.type === "chat") {
            const payload = JSON.parse(m.message);
            const ts = payload.ts ?? m.ts ?? msg.ts;
            if (typeof ts === "number") {
              stats.latencies.push(now - ts);
            }
            stats.delivered += 1;
          }
        };

        if (msg.type === "batch" && Array.isArray(msg.messages)) {
          for (const m of msg.messages) handle(m);
        } else {
          handle(msg);
        }
      } catch {}
    });
    receivers.push(ws);
  }

  // senders
  for (let i = 0; i < NUM_SENDERS; i++) {
    const ws = await connectClient();
    senders.push(ws);
  }

  // wait for all receivers to join
  const startWait = Date.now();
  while (joinedCount < NUM_RECEIVERS && Date.now() - startWait < 10000) {
    await new Promise((r) => setTimeout(r, 50));
  }

  // warmup 2s
  await new Promise<void>((resolve) => {
    const endAt = Date.now() + 2000;
    const tids: NodeJS.Timeout[] = [];
    senders.forEach((ws, idx) => {
      const id = setInterval(() => {
        if (Date.now() >= endAt) {
          clearInterval(id);
          if (tids.every((t) => t.hasRef && !t.hasRef())) {
            // no-op
          }
          return;
        }
        const payload = JSON.stringify({
          shape: {
            id: `w${idx}-warm`,
            type: "rect",
            x: 1,
            y: 1,
            width: 10,
            height: 10,
          },
          ts: Date.now(),
        });
        ws.send(
          JSON.stringify({ type: "chat", roomId: ROOM_ID, message: payload })
        );
      }, SEND_INTERVAL_MS);
      tids.push(id);
    });
    setTimeout(() => {
      tids.forEach((id) => clearInterval(id));
      setTimeout(resolve, 250);
    }, 2000);
  });

  // send loop (measured)
  await new Promise<void>((resolve) => {
    let sentByAll = 0;
    senders.forEach((ws, idx) => {
      let sent = 0;
      const id = setInterval(() => {
        if (sent >= MESSAGES_PER_SENDER) {
          clearInterval(id);
          if (++sentByAll === senders.length) {
            setTimeout(resolve, 1000); // drain
          }
          return;
        }
        const payload = JSON.stringify({
          shape: {
            id: `${idx}-${sent}`,
            type: "rect",
            x: 1,
            y: 1,
            width: 10,
            height: 10,
          },
          ts: Date.now(),
        });
        ws.send(
          JSON.stringify({
            type: "chat",
            roomId: ROOM_ID,
            message: payload,
          })
        );
        stats.sent += 1;
        sent += 1;
      }, SEND_INTERVAL_MS);
    });
  });

  // close
  [...receivers, ...senders].forEach((ws) => ws.close());

  // report
  const p50 = percentile(stats.latencies, 50);
  const p95 = percentile(stats.latencies, 95);
  const deliveredPerSec =
    Math.round(
      (stats.delivered /
        ((MESSAGES_PER_SENDER * NUM_SENDERS * SEND_INTERVAL_MS) / 1000)) *
        100
    ) / 100;

  console.log(
    JSON.stringify(
      {
        receivers: NUM_RECEIVERS,
        senders: NUM_SENDERS,
        messagesPerSender: MESSAGES_PER_SENDER,
        intervalMs: SEND_INTERVAL_MS,
        sent: stats.sent,
        delivered: stats.delivered,
        p50ms: p50,
        p95ms: p95,
        deliveredPerSec,
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
