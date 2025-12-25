# SketchRoom

**A real-time collaborative drawing platform built with Next.js, WebSockets, and PostgreSQL.**

🌐 **Live Demo:** [https://sketch-room.netlify.app/](https://sketch-room.netlify.app/)

SketchRoom is an intuitive collaborative drawing platform that allows multiple users to sketch, paint, and create together in real-time. Built with modern web technologies, it provides a seamless experience for teams to collaborate on creative projects from anywhere in the world.

## ✨ Features

- **Real-time Collaboration**: Work together seamlessly with live updates and instant synchronization
- **Professional Drawing Tools**: 
  - Rectangle tool
  - Circle tool
  - Pencil/freehand drawing
  - Text tool
  - Eraser tool
- **Canvas Controls**:
  - Pan and zoom (mouse wheel)
  - Dark/Light theme toggle
  - Infinite canvas
- **User Authentication**: Secure signup and signin with JWT tokens
- **Room Management**: Create, join, and manage drawing rooms
- **Cloud Sync**: Automatic saving of drawings to the database
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

SketchRoom is built as a monorepo using **Turborepo** and **pnpm workspaces**, consisting of:

### Applications

1. **`excalidraw-frontend`** - Next.js 15 frontend application
   - React 19 with TypeScript
   - Tailwind CSS for styling
   - Canvas-based drawing engine
   - WebSocket client for real-time updates

2. **`http-backend`** - Express.js REST API server
   - User authentication (signup/signin)
   - Room management (create, delete, list)
   - Chat message retrieval
   - JWT-based authentication middleware

3. **`ws-backend`** - WebSocket server for real-time collaboration
   - Real-time shape broadcasting
   - Message batching for performance
   - Room-based message routing
   - Erase operation handling

### Packages

1. **`@repo/db`** - Prisma database client
   - PostgreSQL database schema
   - User, Room, and Chat models
   - Database migrations

2. **`@repo/common`** - Shared utilities and types
   - Zod validation schemas
   - JWT secret configuration
   - Common TypeScript types

3. **`@repo/ui`** - Shared UI components
   - Button, Card, Code components
   - Reusable React components

4. **`@repo/eslint-config`** - Shared ESLint configurations
5. **`@repo/typescript-config`** - Shared TypeScript configurations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Canvas API** - Drawing engine
- **WebSocket API** - Real-time communication

### Backend
- **Express.js** - HTTP server
- **WebSocket (ws)** - WebSocket server
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation

### Infrastructure
- **Turborepo** - Monorepo build system
- **pnpm** - Package manager
- **TypeScript** - Type checking across all packages

## 📁 Project Structure

```
draw-app/
├── apps/
│   ├── excalidraw-frontend/     # Next.js frontend app
│   │   ├── app/                  # Next.js app directory
│   │   │   ├── api/              # API routes
│   │   │   ├── canvas/[roomId]/  # Canvas page
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── signin/           # Sign in page
│   │   │   └── signup/           # Sign up page
│   │   ├── components/           # React components
│   │   └── draw/                 # Drawing engine
│   ├── http-backend/             # Express REST API
│   │   └── src/
│   │       ├── index.ts          # Main server file
│   │       └── middleware.ts     # Auth middleware
│   └── ws-backend/               # WebSocket server
│       └── src/
│           └── index.ts          # WebSocket server
├── packages/
│   ├── db/                       # Prisma database package
│   │   └── prisma/
│   │       └── schema.prisma     # Database schema
│   ├── common/                   # Shared utilities
│   ├── ui/                       # Shared UI components
│   ├── eslint-config/           # ESLint configs
│   └── typescript-config/        # TypeScript configs
├── package.json                  # Root package.json
├── turbo.json                    # Turborepo configuration
└── pnpm-workspace.yaml          # pnpm workspace config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9.0.0
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sketchRoom/draw-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sketchroom"

   # JWT Secret (use a strong secret in production)
   JWT_SECRET="your-secret-key-here"

   # Frontend (optional, defaults shown)
   NEXT_PUBLIC_HTTP_BACKEND="http://localhost:3001/"
   NEXT_PUBLIC_WS_URL="ws://localhost:8080/"

   # WebSocket Backend (optional)
   PORT=8080
   NO_DB=0
   FLUSH_MS=10
   MAX_BATCH_SIZE=100
   ```

4. **Set up the database**
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. **Build all packages**
   ```bash
   pnpm build
   ```

### Running the Application

#### Development Mode

Run all services in development mode:
```bash
pnpm dev
```

This will start:
- Frontend on `http://localhost:3020`
- HTTP Backend on `http://localhost:3001`
- WebSocket Backend on `ws://localhost:8080`

#### Run Individual Services

**Frontend only:**
```bash
pnpm --filter excalidraw-frontend dev
```

**HTTP Backend only:**
```bash
cd apps/http-backend
pnpm dev
```

**WebSocket Backend only:**
```bash
cd apps/ws-backend
pnpm dev
```

#### Production Build

```bash
pnpm build
```

Then start each service:
```bash
# Frontend
pnpm --filter excalidraw-frontend start

# HTTP Backend
cd apps/http-backend && pnpm start

# WebSocket Backend
cd apps/ws-backend && pnpm start
```

## 🔧 Configuration

### Environment Variables

#### Frontend (`excalidraw-frontend`)
- `NEXT_PUBLIC_HTTP_BACKEND` - HTTP API endpoint (default: `http://localhost:3001/`)
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL (default: `ws://localhost:8080/`)

#### HTTP Backend (`http-backend`)
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)

#### WebSocket Backend (`ws-backend`)
- `PORT` - WebSocket server port (default: `8080`)
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT tokens (required)
- `NO_DB` - Skip database operations (default: `0`, set to `1` to disable DB)
- `FLUSH_MS` - Message batch flush interval in milliseconds (default: `10`)
- `MAX_BATCH_SIZE` - Maximum messages per batch (default: `100`)

### Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User**: Stores user accounts (email, password, name, photo)
- **Room**: Drawing rooms with unique slugs
- **Chat**: Messages/shapes stored per room

See `packages/db/prisma/schema.prisma` for the complete schema.

## 📡 API Documentation

### HTTP Backend Endpoints

#### Authentication

**POST `/signup`**
- Create a new user account
- Body: `{ username: string, password: string, name: string }`
- Returns: `{ token: string }`

**POST `/signin`**
- Sign in with existing credentials
- Body: `{ username: string, password: string }`
- Returns: `{ token: string }`

#### Rooms

**POST `/room`** (Protected)
- Create a new drawing room
- Headers: `Authorization: Bearer <token>`
- Body: `{ name: string }`
- Returns: `{ roomId: number, room: {...} }`

**GET `/room/:slug`**
- Get room details by slug
- Returns: `{ roomId: number, room: {...} }`

**GET `/userRooms`** (Protected)
- Get all rooms created by the authenticated user
- Headers: `Authorization: Bearer <token>`
- Returns: `Room[]`

**GET `/delete-room/:roomId`** (Protected)
- Delete a room (admin only)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ message: string }`

#### Chat

**GET `/chats/:roomId`**
- Get chat messages for a room
- Returns: `{ messages: Chat[] }`

### WebSocket Protocol

**Connection:**
```
ws://localhost:8080/?token=<jwt_token>
```

**Message Types:**

1. **Join Room**
   ```json
   {
     "type": "join_room",
     "roomId": 1
   }
   ```

2. **Leave Room**
   ```json
   {
     "type": "leave_room",
     "roomId": 1
   }
   ```

3. **Send Shape (Chat)**
   ```json
   {
     "type": "chat",
     "roomId": 1,
     "message": "{\"shape\": {...}}"
   }
   ```

4. **Erase Shape**
   ```json
   {
     "type": "erase",
     "roomId": 1,
     "message": "{\"shapeId\": \"abc123\", \"eraseAt\": {\"x\": 100, \"y\": 200}}"
   }
   ```

**Server Responses:**

- **Batch Update**
   ```json
   {
     "type": "batch",
     "messages": [...]
   }
   ```

- **Join Confirmation**
   ```json
   {
     "type": "joined",
     "roomId": 1
   }
   ```

## 🎨 Drawing Engine

The drawing engine (`draw/Game.ts`) supports:

- **Shapes**: Rectangle, Circle, Pencil strokes, Text
- **Transformations**: Pan (middle mouse button), Zoom (mouse wheel)
- **Themes**: Dark and light mode
- **Real-time Sync**: All shapes are synchronized via WebSocket

### Shape Types

```typescript
type Shape =
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number }
  | { id: string; type: "circle"; centerX: number; centerY: number; radius: number }
  | { id: string; type: "pencil"; points: { x: number; y: number }[] }
  | { id: string; type: "text"; text: string; x: number; y: number }
```

## 🧪 Development

### Code Quality

**Linting:**
```bash
pnpm lint
```

**Type Checking:**
```bash
pnpm check-types
```

**Formatting:**
```bash
pnpm format
```

### Database Migrations

**Create a new migration:**
```bash
cd packages/db
pnpm prisma migrate dev --name migration_name
```

**Reset database:**
```bash
cd packages/db
pnpm prisma migrate reset
```

**View database:**
```bash
cd packages/db
pnpm prisma studio
```

## 🚢 Deployment

### Frontend (Netlify/Vercel)

1. Build the frontend:
   ```bash
   pnpm --filter excalidraw-frontend build
   ```

2. Set environment variables:
   - `NEXT_PUBLIC_HTTP_BACKEND`
   - `NEXT_PUBLIC_WS_URL`

3. Deploy to Netlify or Vercel

### Backend Services

**HTTP Backend:**
- Deploy to services like Render, Railway, or Heroku
- Set `DATABASE_URL` and `JWT_SECRET` environment variables

**WebSocket Backend:**
- Requires a service that supports WebSocket connections
- Set all required environment variables
- Ensure the port is accessible

**Database:**
- Use a managed PostgreSQL service (e.g., Supabase, Neon, Railway)
- Update `DATABASE_URL` in all services

## 📊 Performance

The WebSocket backend uses message batching to optimize performance:

- Messages are batched and flushed every `FLUSH_MS` milliseconds
- Maximum batch size is `MAX_BATCH_SIZE` messages
- This reduces network overhead and improves real-time performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Turborepo](https://turborepo.org/)
- Database managed with [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Made with ❤️ for collaborative creativity**
