# Backend Engineering Implementation Guide for SketchRoom

This guide maps your backend engineering checklist to concrete implementations you can add to SketchRoom. Each section includes what to implement, why it matters, and how to do it.

## 📋 Table of Contents

1. [Operating Systems Concepts](#operating-systems-concepts)
2. [Computer Networks](#computer-networks)
3. [System Design](#system-design)
4. [Database Management](#database-management)
5. [Backend-Specific Technologies](#backend-specific-technologies)
6. [Security](#security)
7. [Observability & Monitoring](#observability--monitoring)
8. [Message Brokers & Real-Time](#message-brokers--real-time)
9. [Reliability & Resilience](#reliability--resilience)
10. [Architectural Patterns](#architectural-patterns)

---

## 🖥️ Operating Systems Concepts

### 1. Process Management & Concurrency

**Current State**: Single-threaded Node.js with async/await

**Implementations:**

#### A. Worker Threads for Heavy Processing

**Why**: Offload CPU-intensive tasks (image processing, shape calculations) to worker threads

**Implementation**:

```typescript
// apps/http-backend/src/workers/shape-processor.ts
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

export function processShapesInWorker(
    shapes: Shape[]
): Promise<ProcessedShape[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: { shapes },
        });

        worker.on("message", resolve);
        worker.on("error", reject);
    });
}
```

**Apply to**: Batch processing of shapes, image compression, analytics calculations

#### B. Connection Pooling

**Why**: Manage database connections efficiently (process/thread concept)

**Implementation**:

```typescript
// packages/db/src/index.ts
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Connection pool configuration
    log: ["query", "error", "warn"],
});

// Configure connection pool size
// In DATABASE_URL: ?connection_limit=10&pool_timeout=20
```

**Apply to**: All database operations

#### C. Mutex for Critical Sections

**Why**: Prevent race conditions in WebSocket message handling

**Implementation**:

```typescript
// apps/ws-backend/src/mutex.ts
class Mutex {
    private locked = false;
    private queue: Array<() => void> = [];

    async lock(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.locked) {
                this.locked = true;
                resolve();
            } else {
                this.queue.push(resolve);
            }
        });
    }

    unlock(): void {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) next();
        } else {
            this.locked = false;
        }
    }
}

// Use in room operations
const roomMutex = new Map<number, Mutex>();

async function safeRoomOperation(
    roomId: number,
    operation: () => Promise<void>
) {
    if (!roomMutex.has(roomId)) {
        roomMutex.set(roomId, new Mutex());
    }
    const mutex = roomMutex.get(roomId)!;
    await mutex.lock();
    try {
        await operation();
    } finally {
        mutex.unlock();
    }
}
```

**Apply to**: Room join/leave operations, shape broadcasting

---

## 🌐 Computer Networks

### 2. HTTP/HTTPS Improvements

**Current State**: Basic Express endpoints, no proper status codes, no caching

**Implementations:**

#### A. Proper HTTP Status Codes & Headers

**Why**: RESTful API design, proper caching, security headers

**Implementation**:

```typescript
// apps/http-backend/src/middleware/response.ts
export function setCacheHeaders(res: Response, maxAge: number = 3600) {
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.setHeader("ETag", generateETag(res.locals.data));
}

export function setSecurityHeaders(res: Response) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
}

// Update endpoints with proper status codes
app.post("/signup", async (req, res) => {
    // ... validation ...
    if (checkUser) {
        return res.status(409).json({
            // Conflict
            error: "USER_EXISTS",
            message: "User already exists",
        });
    }
    // ... create user ...
    return res.status(201).json({
        // Created
        token,
        user: { id: user.id, email: user.email, name: user.name },
    });
});
```

#### B. HTTP/2 Support

**Why**: Multiplexing, header compression, better performance

**Implementation**: Use Node.js `http2` module or deploy behind nginx with HTTP/2

#### C. Request/Response Compression

**Why**: Reduce bandwidth, faster transfers

**Implementation**:

```typescript
import compression from "compression";
app.use(compression());
```

### 3. WebSocket Improvements

**Current State**: Basic WebSocket, no reconnection logic, no heartbeat

**Implementations:**

#### A. WebSocket Heartbeat/Ping-Pong

**Why**: Detect dead connections, keep connections alive

**Implementation**:

```typescript
// apps/ws-backend/src/index.ts
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 60000; // 60 seconds

wss.on("connection", function connection(ws, request) {
    let isAlive = true;
    let lastPong = Date.now();

    ws.on("pong", () => {
        isAlive = true;
        lastPong = Date.now();
    });

    // Send ping every 30 seconds
    const heartbeat = setInterval(() => {
        if (Date.now() - lastPong > CONNECTION_TIMEOUT) {
            ws.terminate();
            clearInterval(heartbeat);
            return;
        }

        if (!isAlive) {
            ws.terminate();
            clearInterval(heartbeat);
            return;
        }

        isAlive = false;
        ws.ping();
    }, HEARTBEAT_INTERVAL);

    ws.on("close", () => {
        clearInterval(heartbeat);
    });
});
```

#### B. WebSocket Reconnection Logic (Frontend)

**Why**: Handle network failures gracefully

**Implementation**:

```typescript
// apps/excalidraw-frontend/draw/websocket-client.ts
class WebSocketClient {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    connect(url: string, token: string) {
        try {
            this.ws = new WebSocket(`${url}?token=${token}`);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                console.log("WebSocket connected");
            };

            this.ws.onclose = () => {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    setTimeout(() => {
                        this.reconnectAttempts++;
                        this.reconnectDelay *= 2; // Exponential backoff
                        this.connect(url, token);
                    }, this.reconnectDelay);
                }
            };

            this.ws.onerror = (error) => {
                console.error("WebSocket error:", error);
            };
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    }
}
```

### 4. DNS & Caching

**Implementation**: Use CDN for static assets, implement DNS prefetching

```typescript
// apps/excalidraw-frontend/app/layout.tsx
<link rel="dns-prefetch" href="https://your-api-domain.com" />
<link rel="preconnect" href="https://your-api-domain.com" />
```

---

## 🏗️ System Design

### 5. Scalability

**Current State**: Single server, no load balancing, no horizontal scaling

**Implementations:**

#### A. Horizontal Scaling with Load Balancer

**Why**: Handle more traffic, high availability

**Implementation**:

- Use nginx or cloud load balancer
- Make services stateless (already done with JWT)
- Use sticky sessions for WebSocket (or Redis for session sharing)

#### B. Stateless Service Architecture

**Current**: Already stateless (JWT-based) ✅
**Enhancement**: Add Redis for shared state if needed

```typescript
// apps/ws-backend/src/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Share room state across instances
async function broadcastToRoom(roomId: number, message: any) {
    // Publish to Redis channel
    await redis.publish(`room:${roomId}`, JSON.stringify(message));
}

// Subscribe in each instance
redis.subscribe("room:*");
redis.on("message", (channel, message) => {
    const roomId = parseInt(channel.split(":")[1]);
    // Broadcast to local WebSocket connections
});
```

### 6. Caching

**Current State**: No caching implemented

**Implementations:**

#### A. Redis Caching Layer

**Why**: Reduce database load, faster responses

**Implementation**:

```typescript
// apps/http-backend/src/cache/redis.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }

    const data = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
}

// Use in endpoints
app.get("/room/:slug", async (req, res) => {
    const room = await getCached(
        `room:${req.params.slug}`,
        async () => {
            return await prismaClient.room.findFirst({
                where: { slug: req.params.slug },
                include: { admin: true, _count: { select: { chats: true } } },
            });
        },
        300 // 5 minutes
    );

    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    res.json({ roomId: room.id, room });
});
```

#### B. Cache Invalidation Strategy

**Implementation**:

```typescript
// Invalidate cache on updates
async function invalidateRoomCache(roomId: number, slug: string) {
    await redis.del(`room:${roomId}`);
    await redis.del(`room:${slug}`);
    await redis.del(`userRooms:*`); // Pattern-based invalidation
}
```

#### C. CDN for Static Assets

**Why**: Faster content delivery globally

**Implementation**: Deploy frontend to Netlify/Vercel (already has CDN), configure cache headers

### 7. Database Scaling

**Current State**: Single PostgreSQL instance

**Implementations:**

#### A. Read Replicas

**Why**: Distribute read load

**Implementation**:

```typescript
// packages/db/src/index.ts
const prismaClient = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // Write
        },
    },
});

const readReplica = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_READ_URL, // Read replica
        },
    },
});

// Use read replica for GET requests
export const prismaRead = readReplica;
export const prismaWrite = prismaClient;
```

#### B. Connection Pooling

**Already mentioned above** - Configure in DATABASE_URL

#### C. Database Indexing

**Why**: Faster queries

**Implementation**:

```prisma
// packages/db/prisma/schema.prisma
model Room {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  createdAt DateTime @default(now())
  adminId   String
  chats     Chat[]
  admin     User     @relation(fields: [adminId], references: [id])

  @@index([adminId]) // Index for userRooms query
  @@index([createdAt]) // Index for sorting
}

model Chat {
  id      Int    @id @default(autoincrement())
  roomId  Int
  message String
  userId  String
  createdAt DateTime @default(now())
  room    Room   @relation(fields: [roomId], references: [id])
  user    User   @relation(fields: [userId], references: [id])

  @@index([roomId, createdAt]) // Composite index for chats query
  @@index([userId])
}
```

#### D. Query Optimization - Fix N+1 Problem

**Current Issue**: Potential N+1 in userRooms endpoint

**Implementation**:

```typescript
// Already optimized with include, but ensure:
app.get("/userRooms", middleware, async (req, res) => {
    const rooms = await prismaClient.room.findMany({
        where: { adminId: req.userId },
        select: {
            id: true,
            slug: true,
            createdAt: true,
            admin: { select: { name: true } }, // Single query with join
            _count: { select: { chats: true } }, // Aggregation in same query
        },
        orderBy: { createdAt: "desc" },
    });
    res.json(rooms);
});
```

### 8. API Design

**Current State**: Basic REST, no versioning, no rate limiting

**Implementations:**

#### A. API Versioning

**Why**: Backward compatibility, gradual migration

**Implementation**:

```typescript
// apps/http-backend/src/routes/v1/auth.ts
import express from "express";
const router = express.Router();

router.post("/signup", async (req, res) => {
    // v1 signup logic
});

// apps/http-backend/src/index.ts
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rooms", roomsRouter);
```

#### B. Rate Limiting

**Why**: Prevent abuse, DDoS protection

**Implementation**:

```typescript
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

app.post("/signup", authLimiter, async (req, res) => {
    // ...
});

app.post("/signin", authLimiter, async (req, res) => {
    // ...
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
});

app.use("/api/", apiLimiter);
```

#### C. OpenAPI/Swagger Documentation

**Why**: API documentation, client generation

**Implementation**:

```typescript
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SketchRoom API",
            version: "1.0.0",
        },
        servers: [{ url: "http://localhost:3001", description: "Development" }],
    },
    apis: ["./src/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## 🗄️ Database Management

### 9. ACID Transactions

**Current State**: No explicit transactions

**Implementations:**

#### A. Transaction for Room Deletion

**Why**: Atomicity - ensure all related data is deleted together

**Implementation**:

```typescript
app.delete("/room/:roomId", middleware, async (req, res) => {
    const roomId = Number(req.params.roomId);
    const userId = req.userId;

    try {
        await prismaClient.$transaction(async (tx) => {
            // Check ownership
            const room = await tx.room.findFirst({
                where: { id: roomId, adminId: userId },
            });

            if (!room) {
                throw new Error("Room not found or unauthorized");
            }

            // Delete chats first (foreign key constraint)
            await tx.chat.deleteMany({
                where: { roomId },
            });

            // Delete room
            await tx.room.delete({
                where: { id: roomId },
            });

            // Invalidate cache
            await invalidateRoomCache(roomId, room.slug);
        });

        res.status(204).send();
    } catch (error) {
        if (error.message === "Room not found or unauthorized") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Error deleting room" });
    }
});
```

#### B. Isolation Levels

**Why**: Control concurrency behavior

**Implementation**:

```typescript
// Use transaction with isolation level
await prismaClient.$transaction(
    async (tx) => {
        // Your operations
    },
    {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
);
```

### 10. Database Migrations

**Current State**: Basic migrations exist

**Enhancement**: Add migration rollback strategy, zero-downtime migrations

**Implementation**:

```typescript
// packages/db/scripts/migrate.ts
import { execSync } from "child_process";

// Always create reversible migrations
// Use prisma migrate dev --create-only to review before applying
```

### 11. Database Monitoring

**Implementation**: Add query logging, slow query detection

```typescript
const prismaClient = new PrismaClient({
    log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
    ],
});

prismaClient.$on("query", (e) => {
    if (e.duration > 1000) {
        // Log slow queries
        console.warn("Slow query detected:", e.query, e.duration);
    }
});
```

---

## 🔒 Security

### 12. Authentication & Authorization

**Current State**: Basic JWT, no refresh tokens, no role-based access

**Implementations:**

#### A. Refresh Tokens

**Why**: Better security, shorter access token lifetime

**Implementation**:

```typescript
// Add to schema
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([expiresAt])
}

// Signin endpoint
app.post("/signin", async (req, res) => {
  // ... validate credentials ...

  const accessToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Store refresh token
  await prismaClient.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes
  });
});

// Refresh endpoint
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const stored = await prismaClient.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

  }
});
```

#### B. OAuth 2.0 Integration

**Why**: Allow users to sign in with Google/GitHub

**Implementation**:

```typescript
// apps/http-backend/src/routes/auth/oauth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: "/api/v1/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            // Find or create user
            let user = await prismaClient.user.findFirst({
                where: { email: profile.emails[0].value },
            });

            if (!user) {
                user = await prismaClient.user.create({
                    data: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        photo: profile.photos[0].value,
                        password: "", // OAuth users don't need password
                    },
                });
            }

            return done(null, user);
        }
    )
);

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user.id }, JWT_SECRET);
        res.redirect(`/dashboard?token=${token}`);
    }
);
```

#### C. Role-Based Access Control (RBAC)

**Why**: Different permissions for admin, member, viewer

**Implementation**:

```typescript
// Add to schema
model RoomMember {
  id        Int      @id @default(autoincrement())
  roomId    Int
  userId    String
  role      RoomRole @default(VIEWER)
  room      Room     @relation(fields: [roomId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([roomId, userId])
  @@index([roomId])
}

enum RoomRole {
  ADMIN
  MEMBER
  VIEWER
}

// Middleware for role checking
export function requireRole(role: RoomRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const roomId = Number(req.params.roomId);
    const userId = req.userId;

    const membership = await prismaClient.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } }
    });

    if (!membership || !hasPermission(membership.role, role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}
```

### 13. Web Security

#### A. Input Validation & Sanitization

**Why**: Prevent XSS, SQL injection, injection attacks

**Implementation**:

```typescript
import validator from "validator";
import { z } from "zod";

// Enhanced validation schemas
export const CreateUserSchema = z.object({
    username: z
        .string()
        .min(3)
        .max(30)
        .refine((val) => validator.isEmail(val), "Must be valid email"),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, "Must contain uppercase")
        .regex(/[a-z]/, "Must contain lowercase")
        .regex(/[0-9]/, "Must contain number"),
    name: z
        .string()
        .min(1)
        .max(50)
        .refine(
            (val) => !validator.contains(val, "<script>"),
            "Invalid characters"
        ),
});

// Sanitize output
export function sanitizeHtml(input: string): string {
    return validator.escape(input);
}
```

#### B. CORS Configuration

**Why**: Control which origins can access your API

**Implementation**:

```typescript
import cors from "cors";

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3020",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

#### C. CSRF Protection

**Why**: Prevent cross-site request forgery

**Implementation**:

```typescript
import csrf from "csurf";
import cookieParser from "cookie-parser";

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// Generate CSRF token endpoint
app.get("/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Protect state-changing endpoints
app.post("/room", csrfProtection, middleware, async (req, res) => {
    // ...
});
```

#### D. Content Security Policy (CSP)

**Why**: Prevent XSS attacks

**Implementation**:

```typescript
import helmet from "helmet";

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    })
);
```

### 14. Hashing & Encryption

#### A. Password Hashing Improvements

**Current**: bcrypt with salt rounds 10
**Enhancement**: Use Argon2 (more secure) or increase bcrypt rounds

**Implementation**:

```typescript
import argon2 from "argon2";

// Better password hashing
const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
});

// Verification
const isValid = await argon2.verify(hashedPassword, plainPassword);
```

#### B. Encrypt Sensitive Data

**Why**: Protect user data at rest

**Implementation**:

```typescript
import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string): {
    encrypted: string;
    iv: string;
    tag: string;
} {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag();

    return {
        encrypted,
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
    };
}
```

---

## 📊 Observability & Monitoring

### 15. Logging

**Current State**: Basic console.log

**Implementations:**

#### A. Structured Logging with Winston

**Why**: Better log management, searchability, levels

**Implementation**:

```typescript
// apps/http-backend/src/utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "http-backend" },
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

// Use in endpoints
app.post("/signup", async (req, res) => {
    logger.info("Signup attempt", { email: req.body.username });
    try {
        // ... signup logic ...
        logger.info("User created", { userId: user.id });
    } catch (error) {
        logger.error("Signup failed", {
            error: error.message,
            stack: error.stack,
        });
    }
});
```

#### B. Request Logging Middleware

**Implementation**:

```typescript
import morgan from "morgan";

app.use(
    morgan("combined", {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);
```

### 16. Metrics & Monitoring

#### A. Prometheus Metrics

**Why**: Track performance, errors, business metrics

**Implementation**:

```typescript
// apps/http-backend/src/metrics.ts
import client from "prom-client";

const register = new client.Registry();

// Default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
});

const activeWebSocketConnections = new client.Gauge({
    name: "websocket_connections_active",
    help: "Number of active WebSocket connections",
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeWebSocketConnections);

// Middleware to track requests
app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status: res.statusCode,
            },
            duration
        );
        httpRequestTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        });
    });

    next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});
```

#### B. Error Tracking with Sentry

**Why**: Track and alert on errors in production

**Implementation**:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());

// Manual error reporting
try {
    // risky operation
} catch (error) {
    Sentry.captureException(error, {
        tags: { component: "room-creation" },
        extra: { roomId, userId },
    });
}
```

### 17. Distributed Tracing

**Implementation**:

```typescript
import { trace, context } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

const tracer = trace.getTracer("sketchroom-backend");

// Trace operations
async function createRoom(data: CreateRoomData) {
    const span = tracer.startSpan("createRoom");

    try {
        span.setAttribute("room.name", data.name);
        const room = await prismaClient.room.create({ data });
        span.setAttribute("room.id", room.id);
        span.end();
        return room;
    } catch (error) {
        span.recordException(error);
        span.end();
        throw error;
    }
}
```

---

## 🔄 Message Brokers & Real-Time

### 18. Redis Pub/Sub for Multi-Instance WebSocket

**Current State**: Single WebSocket server instance

**Implementation**:

```typescript
// apps/ws-backend/src/redis-pubsub.ts
import Redis from "ioredis";

const publisher = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

// Subscribe to room channels
subscriber.psubscribe("room:*");

subscriber.on("pmessage", (pattern, channel, message) => {
    const roomId = parseInt(channel.split(":")[1]);
    const data = JSON.parse(message);

    // Broadcast to local connections
    const members = roomMembers.get(roomId);
    if (members) {
        members.forEach((ws) => {
            try {
                ws.send(JSON.stringify(data));
            } catch (error) {
                console.error("Failed to send to WebSocket:", error);
            }
        });
    }
});

// Publish to Redis when broadcasting
function broadcastToRoom(roomId: number, message: any) {
    // Publish to Redis (all instances will receive)
    publisher.publish(`room:${roomId}`, JSON.stringify(message));
}

// Use in message handlers
if (parsedData.type === "chat") {
    // ... save to DB ...
    broadcastToRoom(roomId, { type: "chat", message, roomId });
}
```

### 19. Message Queue for Async Processing

**Why**: Decouple heavy operations, retry failed operations

**Implementation with Bull (Redis-based)**:

```typescript
// apps/http-backend/src/queue/email-queue.ts
import Queue from "bull";

const emailQueue = new Queue("emails", {
    redis: { host: process.env.REDIS_HOST, port: 6379 },
});

// Add job
emailQueue.add(
    "welcome-email",
    {
        userId: user.id,
        email: user.email,
        name: user.name,
    },
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000,
        },
    }
);

// Process jobs
emailQueue.process("welcome-email", async (job) => {
    await sendWelcomeEmail(job.data.email, job.data.name);
});

// For shape processing
const shapeQueue = new Queue("shapes", {
    redis: { host: process.env.REDIS_HOST },
});

shapeQueue.process("process-shape", async (job) => {
    const { shape, roomId } = job.data;
    // Heavy processing: validation, compression, etc.
    await processShape(shape, roomId);
});
```

---

## 🛡️ Reliability & Resilience

### 20. Circuit Breaker Pattern

**Why**: Prevent cascading failures, graceful degradation

**Implementation**:

```typescript
// apps/http-backend/src/utils/circuit-breaker.ts
class CircuitBreaker {
    private failures = 0;
    private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
    private nextAttempt = Date.now();
    private readonly threshold = 5;
    private readonly timeout = 60000; // 1 minute

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === "OPEN") {
            if (Date.now() < this.nextAttempt) {
                throw new Error("Circuit breaker is OPEN");
            }
            this.state = "HALF_OPEN";
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = "CLOSED";
    }

    private onFailure() {
        this.failures++;
        if (this.failures >= this.threshold) {
            this.state = "OPEN";
            this.nextAttempt = Date.now() + this.timeout;
        }
    }
}

// Use for external services
const dbCircuitBreaker = new CircuitBreaker();

app.get("/room/:slug", async (req, res) => {
    try {
        const room = await dbCircuitBreaker.execute(() =>
            prismaClient.room.findFirst({ where: { slug: req.params.slug } })
        );
        res.json({ room });
    } catch (error) {
        if (error.message === "Circuit breaker is OPEN") {
            // Return cached data or default response
            return res
                .status(503)
                .json({ message: "Service temporarily unavailable" });
        }
        throw error;
    }
});
```

### 21. Retry Logic with Exponential Backoff

**Implementation**:

```typescript
// apps/http-backend/src/utils/retry.ts
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Use for database operations
const room = await retryWithBackoff(() =>
    prismaClient.room.findFirst({ where: { slug } })
);
```

### 22. Graceful Shutdown

**Implementation**:

```typescript
// apps/http-backend/src/index.ts
const server = app.listen(3001, () => {
    logger.info("Server is running on http://localhost:3001");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");

    server.close(() => {
        logger.info("HTTP server closed");
    });

    // Close database connections
    await prismaClient.$disconnect();

    // Close Redis connections
    await redis.quit();

    process.exit(0);
});

// WebSocket graceful shutdown
process.on("SIGTERM", async () => {
    wss.clients.forEach((ws) => {
        ws.close(1001, "Server shutting down");
    });

    wss.close(() => {
        logger.info("WebSocket server closed");
    });
});
```

### 23. Health Checks

**Implementation**:

```typescript
// apps/http-backend/src/routes/health.ts
app.get("/health", async (req, res) => {
    const health = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
            database: "unknown",
            redis: "unknown",
        },
    };

    // Check database
    try {
        await prismaClient.$queryRaw`SELECT 1`;
        health.checks.database = "healthy";
    } catch (error) {
        health.checks.database = "unhealthy";
        health.status = "unhealthy";
    }

    // Check Redis
    try {
        await redis.ping();
        health.checks.redis = "healthy";
    } catch (error) {
        health.checks.redis = "unhealthy";
        health.status = "unhealthy";
    }

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
});

// Readiness probe (for Kubernetes)
app.get("/ready", async (req, res) => {
    // Check if service is ready to accept traffic
    res.status(200).json({ ready: true });
});

// Liveness probe
app.get("/live", (req, res) => {
    res.status(200).json({ alive: true });
});
```

---

## 🏛️ Architectural Patterns

### 24. Repository Pattern

**Why**: Abstract database access, easier testing, better organization

**Implementation**:

```typescript
// apps/http-backend/src/repositories/room.repository.ts
export class RoomRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number) {
    return this.prisma.room.findUnique({
      where: { id },
      include: { admin: true, _count: { select: { chats: true } } }
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.room.findUnique({
      where: { slug },
      include: { admin: true, _count: { select: { chats: true } } }
    });
  }

  async create(data: { slug: string; adminId: string }) {
    return this.prisma.room.create({
      data,
      include: { admin: true, _count: { select: { chats: true } } }
    });
  }

  async delete(id: number) {
    return this.prisma.room.delete({ where: { id } });
  }

  async findByAdminId(adminId: string) {
    return this.prisma.room.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

// Use in routes
const roomRepo = new RoomRepository(prismaClient);

app.get("/room/:slug", async (req, res) => {
  const room = await roomRepo.findBySlug(req.params.slug);


app.get("/room/:slug", async (req, res) => {
  const room = await roomRepo.findBySlug(req.params.slug);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  res.json({ roomId: room.id, room });
});
```

#### B. Service Layer Pattern

**Why**: Business logic separation, reusability

**Implementation**:

```typescript
// apps/http-backend/src/services/room.service.ts
export class RoomService {
    constructor(
        private roomRepo: RoomRepository,
        private cache: CacheService
    ) {}

    async getRoomBySlug(slug: string) {
        return this.cache.get(`room:${slug}`, () =>
            this.roomRepo.findBySlug(slug)
        );
    }

    async createRoom(data: { slug: string; adminId: string }) {
        const room = await this.roomRepo.create(data);
        await this.cache.invalidate(`userRooms:${data.adminId}`);
        return room;
    }
}
```

#### C. Dependency Injection

**Why**: Loose coupling, testability

**Implementation**:

```typescript
// Use constructor injection
class RoomController {
    constructor(
        private roomService: RoomService,
        private authService: AuthService
    ) {}

    async createRoom(req: Request, res: Response) {
        const room = await this.roomService.createRoom({
            slug: req.body.name,
            adminId: req.userId,
        });
        res.status(201).json(room);
    }
}
```

---

## 🎯 OOP & Design Patterns

### 25. SOLID Principles

#### A. Single Responsibility Principle

**Current Issue**: Routes handle validation, business logic, and response formatting

**Implementation**:

```typescript
// Separate concerns
// Validator
class RoomValidator {
    static validateCreate(data: any): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];
        if (!data.name || data.name.length < 3) {
            errors.push("Room name must be at least 3 characters");
        }
        return { valid: errors.length === 0, errors };
    }
}

// Service (business logic)
class RoomService {
    async createRoom(data: CreateRoomDto) {
        // Business logic only
    }
}

// Controller (orchestration)
class RoomController {
    async create(req: Request, res: Response) {
        const validation = RoomValidator.validateCreate(req.body);
        if (!validation.valid) {
            return res.status(400).json({ errors: validation.errors });
        }
        const room = await this.roomService.createRoom(req.body);
        res.status(201).json(room);
    }
}
```

#### B. Open/Closed Principle

**Why**: Extend functionality without modifying existing code

**Implementation**:

```typescript
// Base class
abstract class ShapeProcessor {
    abstract process(shape: Shape): ProcessedShape;
}

// Extend without modifying base
class RectangleProcessor extends ShapeProcessor {
    process(shape: Rectangle): ProcessedShape {
        // Rectangle-specific processing
    }
}

class CircleProcessor extends ShapeProcessor {
    process(shape: Circle): ProcessedShape {
        // Circle-specific processing
    }
}

// Factory pattern
class ShapeProcessorFactory {
    static create(type: string): ShapeProcessor {
        switch (type) {
            case "rect":
                return new RectangleProcessor();
            case "circle":
                return new CircleProcessor();
            default:
                throw new Error("Unknown shape type");
        }
    }
}
```

#### C. Dependency Inversion

**Implementation**: Use interfaces/abstract classes, inject dependencies

```typescript
// Define interface
interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}

// Implement
class PrismaUserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) {}

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }
}

// Use interface, not concrete class
class AuthService {
    constructor(private userRepo: IUserRepository) {}

    async authenticate(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email);
        // ...
    }
}
```

### 26. Design Patterns

#### A. Singleton Pattern (Database Connection)

**Why**: Single database connection pool instance

**Implementation**:

```typescript
// packages/db/src/index.ts
class DatabaseSingleton {
    private static instance: PrismaClient;

    static getInstance(): PrismaClient {
        if (!DatabaseSingleton.instance) {
            DatabaseSingleton.instance = new PrismaClient({
                log: ["query", "error", "warn"],
            });
        }
        return DatabaseSingleton.instance;
    }
}

export const prismaClient = DatabaseSingleton.getInstance();
```

#### B. Factory Pattern (Shape Creation)

**Implementation**:

```typescript
// apps/excalidraw-frontend/draw/shape-factory.ts
class ShapeFactory {
    static create(type: Tool, data: any): Shape {
        switch (type) {
            case "rect":
                return {
                    id: generateId(),
                    type: "rect",
                    x: data.x,
                    y: data.y,
                    width: data.width,
                    height: data.height,
                };
            case "circle":
                return {
                    id: generateId(),
                    type: "circle",
                    centerX: data.centerX,
                    centerY: data.centerY,
                    radius: data.radius,
                };
            case "pencil":
                return {
                    id: generateId(),
                    type: "pencil",
                    points: data.points,
                };
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}
```

#### C. Observer Pattern (Real-time Updates)

**Why**: Decouple shape broadcasting from WebSocket handling

**Implementation**:

```typescript
// apps/ws-backend/src/observers/room-observer.ts
interface RoomObserver {
    onShapeCreated(roomId: number, shape: Shape): void;
    onShapeDeleted(roomId: number, shapeId: string): void;
}

class RoomSubject {
    private observers: RoomObserver[] = [];

    subscribe(observer: RoomObserver) {
        this.observers.push(observer);
    }

    notifyShapeCreated(roomId: number, shape: Shape) {
        this.observers.forEach((obs) => obs.onShapeCreated(roomId, shape));
    }
}

// WebSocket handler implements observer
class WebSocketBroadcaster implements RoomObserver {
    onShapeCreated(roomId: number, shape: Shape) {
        const members = roomMembers.get(roomId);
        members?.forEach((ws) => {
            ws.send(JSON.stringify({ type: "shape", roomId, shape }));
        });
    }
}
```

#### D. Strategy Pattern (Caching Strategies)

**Implementation**:

```typescript
interface CacheStrategy {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
}

class RedisCacheStrategy implements CacheStrategy {
    constructor(private redis: Redis) {}

    async get<T>(key: string): Promise<T | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        await this.redis.setex(key, ttl, JSON.stringify(value));
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }
}

class MemoryCacheStrategy implements CacheStrategy {
    private cache = new Map<string, { value: any; expires: number }>();

    async get<T>(key: string): Promise<T | null> {
        const item = this.cache.get(key);
        if (!item || item.expires < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl * 1000,
        });
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }
}

// Use strategy
class CacheService {
    constructor(private strategy: CacheStrategy) {}

    async get<T>(key: string): Promise<T | null> {
        return this.strategy.get<T>(key);
    }
}
```

---

## 🖥️ Operating Systems - Advanced Concepts

### 27. Memory Management

#### A. Stack vs Heap in Node.js

**Why**: Understand memory allocation, prevent stack overflow

**Implementation**:

```typescript
// Stack: Function calls, local variables
function processShape(shape: Shape) {
    const processed = transformShape(shape); // Stack frame
    return processed;
}

// Heap: Objects, arrays, closures
class ShapeManager {
    private shapes: Shape[] = []; // Heap allocation

    addShape(shape: Shape) {
        this.shapes.push(shape); // Heap memory
    }
}
```

#### B. Memory Leak Prevention

**Why**: Long-running server processes must manage memory

**Implementation**:

```typescript
// apps/ws-backend/src/memory-management.ts
// 1. Clear event listeners
class WebSocketManager {
    private connections = new Map<string, WebSocket>();

    addConnection(id: string, ws: WebSocket) {
        const cleanup = () => {
            this.connections.delete(id);
            ws.removeAllListeners(); // Prevent memory leak
        };

        ws.on("close", cleanup);
        ws.on("error", cleanup);
        this.connections.set(id, ws);
    }
}

// 2. Limit cache size (LRU eviction)
class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private maxSize: number;

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        if (!this.cache.has(key)) return undefined;

        // Move to end (most recently used)
        const value = this.cache.get(key)!;
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}

// 3. WeakMap for garbage collection
const roomMetadata = new WeakMap<Room, RoomMetadata>();
// Automatically cleaned up when Room is garbage collected
```

#### C. Page Replacement Algorithms (LRU Cache)

**Implementation**: Already shown above in LRUCache class

### 28. Concurrency & Synchronization

#### A. Race Condition Prevention

**Why**: Multiple WebSocket connections modifying same room

**Implementation**:

```typescript
// Use mutex (already shown in section 1)
// Additional: Optimistic locking
class RoomService {
  async updateRoom(roomId: number, updates: Partial<Room>) {
    const room = await prismaClient.room.findUnique({
      where: { id: roomId }
    });

    // Optimistic lock: check version
    const updated = await prismaClient.room.updateMany({
      where: {
        id: roomId,
        version: room.version // Only update if version matches
      },
      data: {
        ...updates,
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) {
      throw new Error('Concurrent modification detected');
    }
  }
}

// Add version field to schema
model Room {
  version Int @default(1)
  // ... other fields
}
```

#### B. Deadlock Prevention

**Why**: Multiple resources, multiple locks

**Implementation**:

```typescript
// Always acquire locks in same order
async function safeMultiRoomOperation(
    roomIds: number[],
    operation: () => Promise<void>
) {
    // Sort to ensure consistent lock order
    const sortedIds = [...roomIds].sort((a, b) => a - b);

    const locks = sortedIds.map((id) => {
        if (!roomMutex.has(id)) {
            roomMutex.set(id, new Mutex());
        }
        return roomMutex.get(id)!;
    });

    // Acquire all locks
    await Promise.all(locks.map((lock) => lock.lock()));

    try {
        await operation();
    } finally {
        // Release in reverse order
        locks.reverse().forEach((lock) => lock.unlock());
    }
}
```

#### C. Producer-Consumer Pattern

**Why**: Decouple shape creation from broadcasting

**Implementation**:

```typescript
// apps/ws-backend/src/queue/shape-queue.ts
class ShapeQueue {
    private queue: Array<{ roomId: number; shape: Shape }> = [];
    private processing = false;

    async enqueue(roomId: number, shape: Shape) {
        this.queue.push({ roomId, shape });
        if (!this.processing) {
            this.process();
        }
    }

    private async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            const batch: Array<{ roomId: number; shape: Shape }> = [];

            // Batch up to 100 items
            while (this.queue.length > 0 && batch.length < 100) {
                batch.push(this.queue.shift()!);
            }

            // Process batch
            await this.broadcastBatch(batch);
        }

        this.processing = false;
    }

    private async broadcastBatch(
        batch: Array<{ roomId: number; shape: Shape }>
    ) {
        // Group by room
        const byRoom = new Map<number, Shape[]>();
        batch.forEach(({ roomId, shape }) => {
            if (!byRoom.has(roomId)) {
                byRoom.set(roomId, []);
            }
            byRoom.get(roomId)!.push(shape);
        });

        // Broadcast to each room
        for (const [roomId, shapes] of byRoom) {
            const members = roomMembers.get(roomId);
            if (members) {
                const payload = JSON.stringify({
                    type: "batch",
                    roomId,
                    shapes,
                });
                members.forEach((ws) => {
                    try {
                        ws.send(payload);
                    } catch (e) {
                        // Handle error
                    }
                });
            }
        }
    }
}
```

### 29. CPU Scheduling Concepts

#### A. Task Queue with Priority

**Why**: Process important operations first

**Implementation**:

```typescript
// Priority queue for WebSocket messages
class PriorityQueue<T> {
    private queues: Map<number, T[]> = new Map();

    enqueue(item: T, priority: number) {
        if (!this.queues.has(priority)) {
            this.queues.set(priority, []);
        }
        this.queues.get(priority)!.push(item);
    }

    dequeue(): T | null {
        // Process highest priority first
        const priorities = Array.from(this.queues.keys()).sort((a, b) => b - a);

        for (const priority of priorities) {
            const queue = this.queues.get(priority)!;
            if (queue.length > 0) {
                return queue.shift()!;
            }
        }

        return null;
    }
}

// Use for message processing
const messageQueue = new PriorityQueue<Message>();
messageQueue.enqueue(eraseMessage, 10); // High priority
messageQueue.enqueue(chatMessage, 5); // Medium priority
messageQueue.enqueue(heartbeat, 1); // Low priority
```

### 30. File Systems & IPC

#### A. Inter-Process Communication (Redis Pub/Sub)

**Why**: Share state between multiple WebSocket server instances

**Implementation**:

```typescript
// apps/ws-backend/src/ipc/redis-pubsub.ts
import Redis from "ioredis";

const publisher = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

// Publish messages
async function broadcastToAllInstances(roomId: number, message: any) {
    await publisher.publish(`room:${roomId}`, JSON.stringify(message));
}

// Subscribe to messages
subscriber.psubscribe("room:*");
subscriber.on("pmessage", (pattern, channel, message) => {
    const roomId = parseInt(channel.split(":")[1]);
    const data = JSON.parse(message);

    // Broadcast to local WebSocket connections
    const localMembers = roomMembers.get(roomId);
    if (localMembers) {
        localMembers.forEach((ws) => {
            try {
                ws.send(JSON.stringify(data));
            } catch (e) {
                // Handle error
            }
        });
    }
});
```

#### B. Message Queues (RabbitMQ/Kafka Alternative)

**Why**: Reliable message delivery, persistence

**Implementation**:

```typescript
// Using Redis Streams (simpler than RabbitMQ for this use case)
async function publishShapeEvent(roomId: number, shape: Shape) {
    await publisher.xadd(
        `room:${roomId}:events`,
        "*",
        "type",
        "shape_created",
        "shape",
        JSON.stringify(shape),
        "timestamp",
        Date.now().toString()
    );
}

// Consumer group for processing
async function consumeShapeEvents(roomId: number) {
    const stream = `room:${roomId}:events`;
    const group = "shape-processors";
    const consumer = "processor-1";

    // Create consumer group if not exists
    try {
        await subscriber.xgroup("CREATE", stream, group, "0");
    } catch (e) {
        // Group already exists
    }

    // Read messages
    while (true) {
        const messages = await subscriber.xreadgroup(
            "GROUP",
            group,
            consumer,
            "COUNT",
            10,
            "BLOCK",
            1000,
            "STREAMS",
            stream,
            ">"
        );

        if (messages) {
            for (const [streamName, streamMessages] of messages) {
                for (const [id, fields] of streamMessages) {
                    // Process message
                    await processShapeEvent(roomId, fields);

                    // Acknowledge
                    await subscriber.xack(stream, group, id);
                }
            }
        }
    }
}
```

---

## 🌐 Computer Networks - Deep Dive

### 31. OSI Model & TCP/IP

#### A. Application Layer (HTTP/WebSocket)

**Current**: Already implemented
**Enhancement**: Add proper protocol handling

#### B. Transport Layer (TCP/UDP)

**Why**: Understand WebSocket vs UDP trade-offs

**Implementation Notes**:

- WebSocket uses TCP (reliable, ordered)
- For real-time games, might consider UDP (lower latency, but unreliable)
- Current implementation: TCP via WebSocket is correct for drawing app

#### C. Network Layer

**Implementation**: Configure proper routing, load balancing

### 32. HTTP/HTTPS Deep Dive

#### A. HTTP Methods Implementation

**Current**: Only POST, GET
**Enhancement**: Implement proper RESTful methods

**Implementation**:

```typescript
// apps/http-backend/src/routes/rooms.ts
// GET - Retrieve resource
app.get("/room/:slug", async (req, res) => {
    const room = await getRoomBySlug(req.params.slug);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json({ room });
});

// POST - Create resource
app.post("/room", middleware, async (req, res) => {
    const room = await createRoom(req.body, req.userId);
    res.status(201).json({ room }); // 201 Created
});

// PUT - Full update (idempotent)
app.put("/room/:roomId", middleware, async (req, res) => {
    const room = await updateRoom(
        Number(req.params.roomId),
        req.body,
        req.userId
    );
    res.status(200).json({ room });
});

// PATCH - Partial update (idempotent)
app.patch("/room/:roomId", middleware, async (req, res) => {
    const room = await partialUpdateRoom(
        Number(req.params.roomId),
        req.body,
        req.userId
    );
    res.status(200).json({ room });
});

// DELETE - Remove resource
app.delete("/room/:roomId", middleware, async (req, res) => {
    await deleteRoom(Number(req.params.roomId), req.userId);
    res.status(204).send(); // 204 No Content
});
```

#### B. HTTP Status Codes

**Why**: Proper RESTful API responses

**Implementation**:

```typescript
// Success codes
200 OK - Successful GET, PUT, PATCH
201 Created - Successful POST
204 No Content - Successful DELETE

// Client error codes
400 Bad Request - Invalid input
401 Unauthorized - Missing/invalid auth
403 Forbidden - Authenticated but not authorized
404 Not Found - Resource doesn't exist
409 Conflict - Resource already exists (duplicate)
422 Unprocessable Entity - Validation failed

// Server error codes
500 Internal Server Error - Unexpected error
502 Bad Gateway - Upstream service error
503 Service Unavailable - Temporary unavailability

// Use consistently
app.post("/signup", async (req, res) => {
  const validation = validateSignup(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const existing = await findUserByEmail(req.body.email);
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await createUser(req.body);
  res.status(201).json({ user, token });
});
```

#### C. HTTP Headers

**Why**: Caching, security, content negotiation

**Implementation**:

```typescript
// Security headers middleware
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
    );
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    next();
});

// Cache-Control headers
app.get("/room/:slug", async (req, res) => {
    const room = await getRoomBySlug(req.params.slug);

    // Public cache for 5 minutes
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("ETag", generateETag(room));

    // Check If-None-Match for 304 Not Modified
    const ifNoneMatch = req.headers["if-none-match"];
    if (ifNoneMatch === generateETag(room)) {
        return res.status(304).send();
    }

    res.json({ room });
});

// Content-Type headers
app.post("/room", express.json(), async (req, res) => {
    // Express automatically sets Content-Type: application/json
    res.json({ room });
});

// Authorization header
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Missing or invalid authorization" });
    }
    const token = authHeader.substring(7);
    // Verify token...
    next();
});
```

#### D. HTTP/1.1 vs HTTP/2

**Why**: Performance improvements

**Implementation Notes**:

- HTTP/2: Multiplexing, header compression, server push
- Use HTTP/2 in production (nginx, cloudflare, etc.)
- Current: Works with HTTP/1.1, automatically benefits from HTTP/2 when deployed

#### E. Cookies, Sessions, Tokens

**Current**: JWT tokens only
**Enhancement**: Add cookie-based option

**Implementation**:

```typescript
// Option 1: JWT in Authorization header (current)
app.post("/signin", async (req, res) => {
    const { accessToken, refreshToken } = await authenticate(req.body);
    res.json({ accessToken, refreshToken });
});

// Option 2: HttpOnly cookies (more secure)
app.post("/signin", async (req, res) => {
    const { accessToken, refreshToken } = await authenticate(req.body);

    res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevents XSS
        secure: true, // HTTPS only
        sameSite: "strict", // CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true });
});

// Session-based (alternative)
import session from "express-session";
import RedisStore from "connect-redis";

app.use(
    session({
        store: new RedisStore({ client: redis }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);
```

### 33. TCP vs UDP

#### A. TCP Characteristics (WebSocket)

**Why**: Reliable, ordered delivery for drawing app

**Implementation Notes**:

- WebSocket uses TCP
- Guarantees: Order, delivery, no duplicates
- Trade-off: Higher latency than UDP
- Perfect for: Drawing app (need all shapes in order)

#### B. Three-Way Handshake

**Why**: Understand connection establishment

**Implementation Notes**:

```typescript
// Client (SYN)
// Server (SYN-ACK)
// Client (ACK)
// Connection established

// In WebSocket:
const ws = new WebSocket(url); // Initiates TCP handshake
ws.onopen = () => {
    // Handshake complete, connection ready
};
```

#### C. ACK and Retransmission

**Why**: Reliability in TCP

**Implementation**: Handled by TCP layer automatically

- If packet lost, TCP retransmits
- WebSocket library handles this
- Application doesn't need to implement

### 34. DNS & Real-Time

#### A. DNS Resolution

**Why**: Understand how clients find servers

**Implementation**:

```typescript
// Frontend: DNS prefetching
// apps/excalidraw-frontend/app/layout.tsx
<link rel="dns-prefetch" href="https://api.sketchroom.com" />
<link rel="preconnect" href="https://api.sketchroom.com" />

// DNS record types:
// A record: api.sketchroom.com -> 192.0.2.1
// CNAME: www.sketchroom.com -> sketchroom.com
// MX: mail.sketchroom.com (for email)
```

#### B. WebSocket vs Server-Sent Events (SSE)

**Why**: Choose right real-time technology

**Implementation**:

```typescript
// WebSocket (bidirectional) - Current implementation
const ws = new WebSocket("wss://ws.sketchroom.com");
ws.send(JSON.stringify({ type: "chat", message: "Hello" }));
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
};

// SSE (server to client only) - Alternative
// apps/http-backend/src/routes/sse.ts
app.get("/events/:roomId", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const roomId = Number(req.params.roomId);
    const eventStream = new EventStream(roomId);

    eventStream.on("shape", (shape) => {
        res.write(`data: ${JSON.stringify({ type: "shape", shape })}\n\n`);
    });

    req.on("close", () => {
        eventStream.removeListener("shape", () => {});
    });
});

// Use SSE for: Notifications, live updates (one-way)
// Use WebSocket for: Chat, drawing (bidirectional)
```

### 35. RESTful APIs

#### A. REST Principles

**Why**: Standard API design

**Implementation**:

```typescript
// Stateless: Each request contains all info needed
// No server-side session storage (use JWT)

// Resource-based URLs
GET    /api/v1/rooms           // List rooms
GET    /api/v1/rooms/:id       // Get room
POST   /api/v1/rooms           // Create room
PUT    /api/v1/rooms/:id       // Update room
DELETE /api/v1/rooms/:id       // Delete room

// Nested resources
GET    /api/v1/rooms/:id/chats  // Get chats in room
POST   /api/v1/rooms/:id/chats  // Create chat in room

// Query parameters for filtering
GET    /api/v1/rooms?adminId=123&limit=10&offset=0
```

#### B. Idempotency

**Why**: Safe retries, predictable behavior

**Implementation**:

```typescript
// Idempotent operations (safe to retry)
// GET, PUT, DELETE are idempotent
app.put("/room/:roomId", async (req, res) => {
    // Same request multiple times = same result
    const room = await upsertRoom(req.params.roomId, req.body);
    res.json({ room });
});

// Non-idempotent: POST (creates new resource each time)
// Make POST idempotent with idempotency key
app.post("/room", async (req, res) => {
    const idempotencyKey = req.headers["idempotency-key"];

    if (idempotencyKey) {
        const existing = await findRoomByKey(idempotencyKey);
        if (existing) {
            return res.status(200).json({ room: existing });
        }
    }

    const room = await createRoom(req.body, idempotencyKey);
    res.status(201).json({ room });
});
```

### 36. Security Basics

#### A. SSL/TLS

**Why**: Encrypt data in transit

**Implementation**:

```typescript
// Production: Use HTTPS/WSS
// Development: Can use HTTP/WS
// Deploy behind reverse proxy (nginx) with SSL certificate

// nginx config
server {
  listen 443 ssl http2;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

#### B. OAuth 2.0 Flow

**Why**: Third-party authentication

**Implementation**:

```typescript
// apps/http-backend/src/auth/oauth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            // Find or create user
            let user = await prismaClient.user.findUnique({
                where: { email: profile.emails[0].value },
            });

            if (!user) {
                user = await prismaClient.user.create({
                    data: {
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        photo: profile.photos[0].value,
                    },
                });
            }

            done(null, user);
        }
    )
);

// Routes
app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const token = jwt.sign({ userId: req.user.id }, JWT_SECRET);
        res.redirect(`/dashboard?token=${token}`);
    }
);
```

#### C. CORS, CSRF, XSS Prevention

**Why**: Web security essentials

**Implementation**:

```typescript
// CORS configuration
import cors from "cors";

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3020",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// CSRF protection (for cookie-based auth)
import csrf from "csurf";
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
app.get("/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// XSS prevention
// 1. Sanitize user input
import DOMPurify from "isomorphic-dompurify";

app.post("/room", async (req, res) => {
    const sanitized = {
        name: DOMPurify.sanitize(req.body.name),
        // ... other fields
    };
    // Use sanitized data
});

// 2. Content Security Policy (already in headers)
res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
);

// 3. Output encoding (framework handles this)
// React automatically escapes content
```

---

## 🏗️ System Design - Advanced

### 37. Scalability Patterns

#### A. Horizontal vs Vertical Scaling

**Why**: Handle growth

**Implementation**:

```typescript
// Horizontal: Add more servers (stateless design enables this)
// Current architecture is already stateless (JWT-based)

// Vertical: Increase server resources
// - More CPU cores
// - More RAM
// - Faster storage

// Use horizontal for: Web servers, API servers
// Use vertical for: Database (initially), cache servers
```

#### B. Load Balancing Strategies

**Why**: Distribute traffic

**Implementation**:

```typescript
// Round Robin (default)
// nginx config
upstream backend {
  server api1.sketchroom.com;
  server api2.sketchroom.com;
  server api3.sketchroom.com;
}

// Least Connections
upstream backend {
  least_conn;
  server api1.sketchroom.com;
  server api2.sketchroom.com;
}

// IP Hash (sticky sessions for WebSocket)
upstream backend {
  ip_hash;
  server api1.sketchroom.com;
  server api2.sketchroom.com;
}

// Health checks
upstream backend {
  server api1.sketchroom.com max_fails=3 fail_timeout=30s;
  server api2.sketchroom.com backup; // Use if primary fails
}
```

### 38. Caching Strategies

#### A. Cache Locations

**Why**: Reduce latency at different layers

**Implementation**:

```typescript
// 1. Client-side caching
// Frontend: Service Worker, localStorage
// apps/excalidraw-frontend/public/sw.js
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/room/")) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// 2. CDN caching (Netlify/Vercel handles this)
// Static assets, images

// 3. Server-side caching (Redis)
// Already implemented in section 6

// 4. Database query caching
// Prisma query caching
const room = await prismaClient.room.findUnique({
    where: { slug },
    cacheStrategy: { ttl: 300 },
});
```

#### B. Cache Eviction Policies

**Why**: Manage memory, ensure fresh data

**Implementation**:

```typescript
// LRU (Least Recently Used) - Already implemented
// LFU (Least Frequently Used)
class LFUCache<K, V> {
    private cache = new Map<
        K,
        { value: V; frequency: number; lastUsed: number }
    >();
    private maxSize: number;

    get(key: K): V | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        item.frequency++;
        item.lastUsed = Date.now();
        return item.value;
    }

    set(key: K, value: V): void {
        if (this.cache.size >= this.maxSize) {
            // Remove least frequently used
            let minFreq = Infinity;
            let lfuKey: K | null = null;

            for (const [k, v] of this.cache) {
                if (
                    v.frequency < minFreq ||
                    (v.frequency === minFreq &&
                        v.lastUsed < this.cache.get(lfuKey!)!.lastUsed)
                ) {
                    minFreq = v.frequency;
                    lfuKey = k;
                }
            }

            if (lfuKey) this.cache.delete(lfuKey);
        }

        this.cache.set(key, { value, frequency: 1, lastUsed: Date.now() });
    }
}

// FIFO (First In First Out)
class FIFOCache<K, V> {
    private cache = new Map<K, V>();
    private order: K[] = [];
    private maxSize: number;

    set(key: K, value: V): void {
        if (!this.cache.has(key)) {
            if (this.cache.size >= this.maxSize) {
                const oldest = this.order.shift()!;
                this.cache.delete(oldest);
            }
            this.order.push(key);
        }
        this.cache.set(key, value);
    }
}
```

### 39. Database Scaling

#### A. Sharding Strategies

**Why**: Distribute data across multiple databases

**Implementation**:

```typescript
// Hash-based sharding
function getShard(roomId: number, numShards: number): number {
    return roomId % numShards;
}

async function getRoomFromShard(roomId: number) {
    const shard = getShard(roomId, 3);
    const db = shardConnections[shard];
    return db.room.findUnique({ where: { id: roomId } });
}

// Range-based sharding
const shardRanges = [
    { min: 1, max: 1000, db: db1 },
    { min: 1001, max: 2000, db: db2 },
    { min: 2001, max: 3000, db: db3 },
];

function getShardForRoom(roomId: number) {
    return shardRanges.find(
        (range) => roomId >= range.min && roomId <= range.max
    );
}

// Directory-based sharding (lookup table)
const shardDirectory = new Map<number, PrismaClient>();

async function getRoom(roomId: number) {
    const shard = shardDirectory.get(roomId) || defaultShard;
    return shard.room.findUnique({ where: { id: roomId } });
}
```

#### B. Read Replicas

**Why**: Scale read operations

**Implementation**: Already covered in section 7

### 40. APIs & Messaging

#### A. REST vs GraphQL

**Why**: Choose right API style

**Implementation**:

```typescript
// REST (current) - Good for: Simple CRUD, caching, HTTP caching
app.get("/room/:id", getRoom);
app.get("/room/:id/chats", getChats);

// GraphQL - Good for: Complex queries, mobile apps, reduce over-fetching
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

@Resolver()
class RoomResolver {
    @Query(() => Room)
    async room(@Arg("id") id: number) {
        return prismaClient.room.findUnique({ where: { id } });
    }

    @FieldResolver(() => [Chat])
    async chats(@Root() room: Room) {
        return prismaClient.chat.findMany({ where: { roomId: room.id } });
    }
}

const schema = await buildSchema({ resolvers: [RoomResolver] });
const server = new ApolloServer({ schema });
server.applyMiddleware({ app });
```

#### B. Message Brokers (RabbitMQ/Kafka)

**Why**: Decouple services, reliable messaging

**Implementation**:

```typescript
// RabbitMQ example
import amqp from "amqplib";

const connection = await amqp.connect("amqp://localhost");
const channel = await connection.createChannel();

// Producer
async function publishShapeEvent(roomId: number, shape: Shape) {
    const queue = "shape-events";
    await channel.assertQueue(queue, { durable: true });

    channel.sendToQueue(
        queue,
        Buffer.from(
            JSON.stringify({
                roomId,
                shape,
                timestamp: Date.now(),
            })
        ),
        {
            persistent: true, // Survive broker restart
        }
    );
}

// Consumer
async function consumeShapeEvents() {
    const queue = "shape-events";
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
        if (msg) {
            const event = JSON.parse(msg.content.toString());
            await processShapeEvent(event);
            channel.ack(msg); // Acknowledge processing
        }
    });
}

// Kafka example (for high throughput)
import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "sketchroom-backend",
    brokers: ["kafka1:9092", "kafka2:9092"],
});

const producer = kafka.producer();
await producer.connect();

async function publishToKafka(topic: string, message: any) {
    await producer.send({
        topic,
        messages: [
            {
                key: message.roomId.toString(),
                value: JSON.stringify(message),
            },
        ],
    });
}

const consumer = kafka.consumer({ groupId: "shape-processors" });
await consumer.subscribe({ topic: "shape-events" });

await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value!.toString());
        await processShapeEvent(event);
    },
});
```

### 41. Architecture Patterns

#### A. Microservices vs Monolith

**Why**: Choose right architecture

**Current**: Monolith (HTTP + WS in separate apps but same repo)
**Migration Path**:

```typescript
// Current: Monolith
// - HTTP backend
// - WS backend
// - Shared database

// Microservices approach:
// 1. Auth Service (handles signup/signin)
// 2. Room Service (manages rooms)
// 3. Drawing Service (WebSocket, shape processing)
// 4. Notification Service (alerts, emails)

// Service communication
// - REST APIs
// - Message queues
// - Service mesh (Istio, Linkerd)
```

#### B. Event Sourcing & CQRS

**Why**: Audit trail, scalability

**Implementation**:

```typescript
// Event Sourcing: Store events, not current state
interface ShapeCreatedEvent {
    type: "SHAPE_CREATED";
    roomId: number;
    shape: Shape;
    userId: string;
    timestamp: Date;
}

interface ShapeDeletedEvent {
    type: "SHAPE_DELETED";
    roomId: number;
    shapeId: string;
    timestamp: Date;
}

// Event store
class EventStore {
    async append(roomId: number, event: Event) {
        await prismaClient.event.create({
            data: {
                roomId,
                type: event.type,
                payload: JSON.stringify(event),
                timestamp: new Date(),
            },
        });
    }

    async getEvents(roomId: number): Promise<Event[]> {
        const events = await prismaClient.event.findMany({
            where: { roomId },
            orderBy: { timestamp: "asc" },
        });
        return events.map((e) => JSON.parse(e.payload));
    }

    // Rebuild state from events
    async rebuildRoomState(roomId: number): Promise<Shape[]> {
        const events = await this.getEvents(roomId);
        const shapes: Shape[] = [];

        for (const event of events) {
            if (event.type === "SHAPE_CREATED") {
                shapes.push(event.shape);
            } else if (event.type === "SHAPE_DELETED") {
                const index = shapes.findIndex((s) => s.id === event.shapeId);
                if (index !== -1) shapes.splice(index, 1);
            }
        }

        return shapes;
    }
}

// CQRS: Separate read and write models
// Write model (commands)
class RoomCommandService {
    async createShape(roomId: number, shape: Shape, userId: string) {
        // 1. Validate
        // 2. Store event
        await eventStore.append(roomId, {
            type: "SHAPE_CREATED",
            roomId,
            shape,
            userId,
            timestamp: new Date(),
        });
        // 3. Publish to message queue
        await publishShapeEvent(roomId, shape);
    }
}

// Read model (queries)
class RoomQueryService {
    async getRoomShapes(roomId: number): Promise<Shape[]> {
        // Read from optimized read database
        return await readDb.roomShape.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" },
        });
    }
}
```

---

## 🗄️ Database Management - Advanced

### 42. SQL Fundamentals

#### A. Advanced Queries

**Why**: Efficient data retrieval

**Implementation**:

```typescript
// Window functions
// Get room with most recent chat per user
const roomsWithLatestChat = await prismaClient.$queryRaw`
  SELECT DISTINCT ON (r.id)
    r.*,
    c.message as latest_message,
    c.created_at as latest_message_time
  FROM "Room" r
  LEFT JOIN "Chat" c ON c."roomId" = r.id
  WHERE r."adminId" = ${userId}
  ORDER BY r.id, c.created_at DESC
`;

// Using Prisma (if supported) or raw SQL
// Aggregate functions
const roomStats = await prismaClient.chat.groupBy({
    by: ["roomId"],
    _count: { id: true },
    _max: { createdAt: true },
    _min: { createdAt: true },
});

// Subqueries
const roomsWithChatCount = await prismaClient.room.findMany({
    where: {
        adminId: userId,
        chats: {
            some: {}, // Has at least one chat
        },
    },
    include: {
        _count: {
            select: { chats: true },
        },
    },
});

// UNION vs UNION ALL
// UNION: Removes duplicates
// UNION ALL: Keeps duplicates (faster)
const allRooms = await prismaClient.$queryRaw`
  SELECT id, slug, "createdAt" FROM "Room" WHERE "adminId" = ${userId1}
  UNION
  SELECT id, slug, "createdAt" FROM "Room" WHERE "adminId" = ${userId2}
`;
```

#### B. JOINs

**Why**: Combine data from multiple tables

**Implementation**:

```typescript
// Inner JOIN (default in Prisma include)
const roomWithAdmin = await prismaClient.room.findUnique({
    where: { id: roomId },
    include: {
        admin: true, // INNER JOIN User
    },
});

// Left JOIN
const roomsWithOptionalChats = await prismaClient.room.findMany({
    include: {
        chats: {
            take: 10,
            orderBy: { createdAt: "desc" },
        },
    },
});

// Right JOIN (rare, use left join with reversed tables)
// Full OUTER JOIN (PostgreSQL specific)
const allData = await prismaClient.$queryRaw`
  SELECT * FROM "Room" r
  FULL OUTER JOIN "Chat" c ON c."roomId" = r.id
`;
```

### 43. Database Design

#### A. Normalization

**Why**: Reduce redundancy, maintain data integrity

**Implementation**:

```prisma
// 1NF: Atomic values, no repeating groups
// ✅ Current schema is 1NF

// 2NF: 1NF + no partial dependencies
// ✅ Current schema is 2NF (all non-key attributes depend on full key)

// 3NF: 2NF + no transitive dependencies
// ✅ Current schema is 3NF

// When to denormalize (for performance):
model Room {
  id        Int      @id
  slug      String   @unique
  adminId   String
  adminName String   // Denormalized: Avoid join for common queries
  chatCount Int      @default(0) // Denormalized: Avoid COUNT query
  // ...
}
```

#### B. Composite Keys & Indexes

**Why**: Optimize queries

**Implementation**:

```prisma
model RoomMember {
  roomId Int
  userId String
  joinedAt DateTime @default(now())

  @@id([roomId, userId]) // Composite primary key
  @@index([userId, joinedAt]) // Composite index for user's rooms query
}
```

### 44. Transactions & ACID

#### A. Isolation Levels

**Why**: Control concurrency behavior

**Implementation**:

```typescript
// Read Uncommitted (lowest isolation, fastest)
await prismaClient.$transaction(
    async (tx) => {
        // Operations
    },
    {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadUncommitted,
    }
);

// Read Committed (default in PostgreSQL)
// Prevents dirty reads

// Repeatable Read
// Prevents non-repeatable reads

// Serializable (highest isolation, slowest)
// Prevents phantom reads
await prismaClient.$transaction(
    async (tx) => {
        const room = await tx.room.findUnique({ where: { id: roomId } });
        // ... operations that depend on room state ...
    },
    {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
);
```

#### B. Savepoints

**Why**: Partial rollback within transaction

**Implementation**:

```typescript
await prismaClient.$transaction(async (tx) => {
  // Create savepoint
  await tx.$executeRaw`SAVEPOINT sp1`;

  try {
    await tx.room.create({ data: { ... } });
    await tx.chat.create({ data: { ... } });
  } catch (error) {
    // Rollback to savepoint
    await tx.$executeRaw`ROLLBACK TO SAVEPOINT sp1`;
    // Continue with alternative logic
  }
});
```

### 45. Concurrency Control

#### A. Optimistic vs Pessimistic Locking

**Why**: Handle concurrent updates

**Implementation**:

```typescript
// Optimistic locking (version field)
model Room {
  id      Int   @id
  slug    String
  version Int   @default(1) // Version field
}

async function updateRoomOptimistic(roomId: number, updates: any) {
  const room = await prismaClient.room.findUnique({ where: { id: roomId } });

  const result = await prismaClient.room.updateMany({
    where: {
      id: roomId,
      version: room.version // Only update if version matches
    },
    data: {
      ...updates,
      version: { increment: 1 }
    }
  });

  if (result.count === 0) {
    throw new Error('Concurrent modification detected');
  }
}

// Pessimistic locking (SELECT FOR UPDATE)
async function updateRoomPessimistic(roomId: number, updates: any) {
  await prismaClient.$transaction(async (tx) => {
    // Lock row until transaction completes
    const room = await tx.$queryRaw`
      SELECT * FROM "Room" WHERE id = ${roomId} FOR UPDATE
    `;

    // Perform update
    await tx.room.update({
      where: { id: roomId },
      data: updates
    });
  });
}
```

### 46. SQL vs NoSQL

#### A. When to Use Which

**Why**: Choose right database type

**Implementation**:

```typescript
// SQL (PostgreSQL) - Current choice ✅
// Use for: Structured data, relationships, ACID transactions
// Good for: User accounts, rooms, chats (relational data)

// NoSQL options for specific use cases:

// Document DB (MongoDB) - Alternative for flexible schemas
// Use for: User preferences, shape metadata (flexible structure)

// Key-Value (Redis) - Already using for cache
// Use for: Session storage, real-time presence, rate limiting

// Graph DB (Neo4j) - For complex relationships
// Use for: User collaboration networks, recommendations

// Time Series (InfluxDB) - For metrics
// Use for: Analytics, performance metrics, usage statistics
```

#### B. CAP Theorem

**Why**: Understand trade-offs

**Implementation Notes**:

- **Consistency**: All nodes see same data
- **Availability**: System remains operational
- **Partition tolerance**: System works despite network failures

**Current Setup**:

- PostgreSQL: CP (Consistency + Partition tolerance)
- Redis: AP (Availability + Partition tolerance)
- WebSocket: CP (Consistency + Partition tolerance)

---

## 🛠️ Essential Tools

### 47. Docker & Containerization

#### A. Dockerfile

**Why**: Consistent deployments

**Implementation**:

```dockerfile
# apps/http-backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY . .
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build --filter http-backend

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/http-backend/dist ./dist
COPY --from=builder /app/apps/http-backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

#### B. Docker Compose

**Why**: Local development environment

**Implementation**:

```yaml
# docker-compose.yml
version: "3.8"

services:
    postgres:
        image: postgres:15
        environment:
            POSTGRES_DB: sketchroom
            POSTGRES_USER: user
            POSTGRES_PASSWORD: password
        ports:
            - "5432:5432"
        volumes:
            - postgres_data:/var/lib/postgresql/data

    redis:
        image: redis:7-alpine
        ports:
            - "6379:6379"

    http-backend:
        build:
            context: .
            dockerfile: apps/http-backend/Dockerfile
        ports:
            - "3001:3001"
        environment:
            DATABASE_URL: postgresql://user:password@postgres:5432/sketchroom
            REDIS_URL: redis://redis:6379
            JWT_SECRET: ${JWT_SECRET}
        depends_on:
            - postgres
            - redis

    ws-backend:
        build:
            context: .
            dockerfile: apps/ws-backend/Dockerfile
        ports:
            - "8080:8080"
        environment:
            DATABASE_URL: postgresql://user:password@postgres:5432/sketchroom
            REDIS_URL: redis://redis:6379
            JWT_SECRET: ${JWT_SECRET}
        depends_on:
            - postgres
            - redis

volumes:
    postgres_data:
```

### 48. CI/CD

#### A. GitHub Actions Pipeline

**Why**: Automated testing and deployment

**Implementation**:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: "18"

            - name: Setup pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 9

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Run linter
              run: pnpm lint

            - name: Type check
              run: pnpm check-types

            - name: Run tests
              run: pnpm test

            - name: Build
              run: pnpm build

    deploy:
        needs: test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'
        steps:
            - uses: actions/checkout@v3

            - name: Deploy to production
              run: |
                  # Deployment commands
                  echo "Deploying to production..."
```

#### B. Test-Driven Development

**Why**: Reliable code

**Implementation**:

```typescript
// apps/http-backend/src/__tests__/auth.test.ts
import request from "supertest";
import app from "../index";

describe("Authentication", () => {
    it("should sign up a new user", async () => {
        const response = await request(app).post("/signup").send({
            username: "test@example.com",
            password: "password123",
            name: "Test User",
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
    });

    it("should reject duplicate email", async () => {
        await request(app).post("/signup").send({
            username: "test@example.com",
            password: "password123",
            name: "Test User",
        });

        const response = await request(app).post("/signup").send({
            username: "test@example.com",
            password: "password123",
            name: "Test User",
        });

        expect(response.status).toBe(409);
    });
});
```

### 49. Web Servers (Nginx)

#### A. Reverse Proxy Configuration

**Why**: Load balancing, SSL termination

**Implementation**:

```nginx
# /etc/nginx/sites-available/sketchroom
upstream http_backend {
  least_conn;
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

upstream ws_backend {
  ip_hash; # Sticky sessions for WebSocket
  server localhost:8080;
  server localhost:8081;
}

server {
  listen 80;
  server_name api.sketchroom.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.sketchroom.com;

  ssl_certificate /etc/ssl/certs/sketchroom.crt;
  ssl_certificate_key /etc/ssl/private/sketchroom.key;

  # HTTP API
  location /api/ {
    proxy_pass http://http_backend;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # WebSocket
  location /ws/ {
    proxy_pass http://ws_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400; # 24 hours
  }
}
```

---

## 🔒 Security - Advanced

### 50. Hashing & Encryption

#### A. Password Hashing

**Why**: Secure password storage

**Implementation**:

```typescript
// Current: bcrypt ✅
// Alternatives for comparison:

// bcrypt (current) - Good balance
const hash = await bcrypt.hash(password, 10); // 10 rounds

// Argon2 (most secure, slower)
import argon2 from "argon2";
const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
});

// scrypt (good alternative)
import scrypt from "scrypt-js";
const hash = await scrypt.scrypt(
    Buffer.from(password),
    salt,
    16384, // N
    8, // r
    1, // p
    64 // dkLen
);
```

#### B. Encryption at Rest

**Why**: Protect sensitive data

**Implementation**:

```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Use for sensitive fields
model User {
  encryptedEmail String // Encrypted email
  // ...
}
```

### 51. OWASP Top 10

#### A. SQL Injection Prevention

**Why**: Critical security issue

**Implementation**:

```typescript
// ✅ Prisma prevents SQL injection (parameterized queries)
// ❌ Never do this:
// const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Always use Prisma:
const user = await prismaClient.user.findUnique({
    where: { email }, // Safe, parameterized
});

// ✅ Or raw queries with parameters:
await prismaClient.$queryRaw`
  SELECT * FROM "User" WHERE email = ${email}
`;
```

#### B. Input Validation

**Why**: Prevent malicious input

**Implementation**:

```typescript
// Already using Zod ✅
import { z } from "zod";

const CreateRoomSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(20, "Name must be at most 20 characters")
        .regex(
            /^[a-zA-Z0-9-_]+$/,
            "Name can only contain letters, numbers, hyphens, and underscores"
        )
        .refine(async (name) => {
            // Check for reserved names
            const reserved = ["admin", "api", "www"];
            return !reserved.includes(name.toLowerCase());
        }),
});

// Sanitize HTML
import DOMPurify from "isomorphic-dompurify";

app.post("/room", async (req, res) => {
    const sanitized = DOMPurify.sanitize(req.body.name);
    // Use sanitized
});
```

---

## 📊 Observability & Monitoring

### 52. Logging & Tracing

#### A. Structured Logging

**Why**: Better debugging, log aggregation

**Implementation**:

```typescript
import winston from "winston";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

// Use in code
logger.info("User signed in", {
    userId: user.id,
    email: user.email,
    timestamp: new Date(),
});

logger.error("Failed to create room", {
    error: error.message,
    stack: error.stack,
    userId: req.userId,
});
```

#### B. Distributed Tracing

**Why**: Track requests across services

**Implementation**:

```typescript
// Using OpenTelemetry
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const provider = new NodeTracerProvider();
provider.addSpanProcessor(
    new BatchSpanProcessor(
        new JaegerExporter({
            endpoint: "http://localhost:14268/api/traces",
        })
    )
);

provider.register();

// Instrument Express
import { trace } from "@opentelemetry/api";

app.use((req, res, next) => {
    const tracer = trace.getTracer("sketchroom-backend");
    const span = tracer.startSpan("http_request", {
        attributes: {
            "http.method": req.method,
            "http.url": req.url,
        },
    });

    res.on("finish", () => {
        span.setAttribute("http.status_code", res.statusCode);
        span.end();
    });

    next();
});
```

### 53. Metrics & Monitoring

#### A. Prometheus Metrics

**Why**: Monitor system health

**Implementation**:

```typescript
import client from "prom-client";

// Create metrics
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
});

const websocketConnections = new client.Gauge({
    name: "websocket_connections_total",
    help: "Number of active WebSocket connections",
});

const databaseQueryDuration = new client.Histogram({
    name: "database_query_duration_seconds",
    help: "Duration of database queries in seconds",
    labelNames: ["operation", "table"],
});

// Use in code
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status: res.statusCode,
            },
            duration
        );
    });
    next();
});

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});
```

---

## 🚀 Reliability & Resilience

### 54. Resilience Patterns

#### A. Circuit Breaker

**Why**: Prevent cascade failures

**Implementation**:

```typescript
class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: "closed" | "open" | "half-open" = "closed";

    constructor(
        private threshold: number = 5,
        private timeout: number = 60000
    ) {}

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === "open") {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = "half-open";
            } else {
                throw new Error("Circuit breaker is open");
            }
        }

        try {
            const result = await fn();
            if (this.state === "half-open") {
                this.state = "closed";
                this.failures = 0;
            }
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();

            if (this.failures >= this.threshold) {
                this.state = "open";
            }

            throw error;
        }
    }
}

// Use for external services
const dbCircuitBreaker = new CircuitBreaker();

app.get("/room/:slug", async (req, res) => {
    try {
        const room = await dbCircuitBreaker.execute(() =>
            prismaClient.room.findUnique({ where: { slug: req.params.slug } })
        );
        res.json({ room });
    } catch (error) {
        if (error.message === "Circuit breaker is open") {
            // Return cached data or error
            return res
                .status(503)
                .json({ message: "Service temporarily unavailable" });
        }
        throw error;
    }
});
```

#### B. Retry with Exponential Backoff

**Why**: Handle transient failures

**Implementation**:

```typescript
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

// Use for database operations
const room = await retryWithBackoff(() =>
    prismaClient.room.findUnique({ where: { id: roomId } })
);
```

#### C. Graceful Degradation

**Why**: Maintain service during partial failures

**Implementation**:

```typescript
app.get("/room/:slug", async (req, res) => {
    try {
        // Try primary source
        const room = await prismaClient.room.findUnique({
            where: { slug: req.params.slug },
        });

        if (room) {
            return res.json({ room });
        }
    } catch (error) {
        // Fallback to cache
        const cached = await redis.get(`room:${req.params.slug}`);
        if (cached) {
            return res.json({ room: JSON.parse(cached), fromCache: true });
        }

        // Fallback to error
        return res.status(503).json({
            message: "Service temporarily unavailable",
            retryAfter: 60,
        });
    }
});
```

---

## 📚 Summary & Learning Path

### Implementation Priority

**Phase 1 (Essential)**:

1. Error handling & logging
2. Input validation & security headers
3. Rate limiting
4. Database indexing
5. Connection pooling

**Phase 2 (Performance)**: 6. Redis caching 7. Read replicas 8. Query optimization 9. CDN setup 10. Compression

**Phase 3 (Scalability)**: 11. Load balancing 12. Horizontal scaling 13. Message queues 14. Monitoring & metrics 15. Circuit breakers

**Phase 4 (Advanced)**: 16. Microservices migration 17. Event sourcing 18. GraphQL API 19. Advanced caching strategies 20. Distributed tracing

### Learning Resources

- **System Design**: "Designing Data-Intensive Applications" by Martin Kleppmann
- **Database**: PostgreSQL documentation, Prisma guides
- **Networking**: "High Performance Browser Networking" by Ilya Grigorik
- **Security**: OWASP Top 10, security best practices
- **Monitoring**: Prometheus, Grafana tutorials

---

**This guide covers all major backend engineering concepts applicable to SketchRoom. Implement incrementally, test thoroughly, and measure impact!**
