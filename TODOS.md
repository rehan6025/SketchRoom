# 🚀 SketchRoom - Feature Implementation Roadmap & TODOs

Comprehensive engineering roadmap to deliver on all features promised across the landing page showcase cards.

---

## 📊 Summary by Phases

| Phase | Focus Area | Est. Time | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Multiplayer & Quick Wins** | **~3 - 4 hrs** | One-click room invite, live presence avatars, real-time peer cursors, ping latency badge |
| **Phase 2** | **Widgets & Time Management** | **~3 - 4 hrs** | Floating countdown timer capsule, telemetry stats, collapsible room agenda drawer |
| **Phase 3** | **Custom Workspaces & Templates**| **~3 - 4 hrs** | Draggable widget dock, workspace folders/tags, layout wireframe presets |
| **Phase 4** | **Task Tracking & Kanban** | **~4 - 5 hrs** | Prisma Task schema, in-canvas Kanban board, visual project milestone timeline |

**Total Estimated Implementation Time:** **~13 - 17 focused engineering hours** (approx. 2 to 3 days).

---

## 🎯 Card 1: Seamless Collaboration

### 1. One-Click Room Invite Link (~20 mins)
- [ ] Add an `Invite` button on the canvas top bar (`apps/excalidraw-frontend/components/Canvas.tsx`).
- [ ] Implement clipboard copy via `navigator.clipboard.writeText(window.location.href)`.
- [ ] Trigger success feedback using `toast.success("Invite link copied to clipboard!")`.
- [ ] Include optional room slug / join code display modal.

### 2. Live Room Presence & Collaborator Avatars (~1 hr)
- [ ] **WS Backend:** Update `apps/ws-backend/src/index.ts` to decode JWT token and store user metadata (`userId`, `name`, `photo`) alongside the connection in `roomMembers`.
- [ ] **WS Protocol:** Broadcast a `{ type: "presence", users: [{ id, name, photo }] }` event whenever a user connects or disconnects.
- [ ] **Frontend State:** Create a `useRoomPresence` hook to maintain the list of active users.
- [ ] **UI Component:** Add an elevated avatar cluster in the canvas header showing active users with green online badges and tooltip names.

### 3. Real-Time Multiplayer Cursors (~1.5 hrs)
- [ ] **Throttled Event Dispatch:** Track `mousemove` on the canvas in world coordinates (`worldX = (clientX - offsetX) / scale`), throttled to 35–45ms.
- [ ] **WS In-Memory Relay:** Send `{ type: "cursor", x, y, name, color }` over WebSocket; relay to peers in the same room without database writes.
- [ ] **Cursor Overlay Component:** Create an SVG overlay layer on the canvas rendering peer pointers with colored name tags (`Alex`, `Sarah`, etc.) smoothly interpolated.
- [ ] **Idle Timeout:** Automatically fade out peer cursors after 3 seconds of inactivity.

### 4. Workspace & Folder Organization for Rooms (~1.5 hrs)
- [ ] **Database Schema:** Add a `folder` or `workspaceId` optional string field to the `Room` model in `packages/db/prisma/schema.prisma`.
- [ ] **HTTP API:** Update `POST /room` and `GET /rooms` in `apps/http-backend/src/index.ts` to accept and filter by `workspace`.
- [ ] **Dashboard UI:** Add workspace/folder filter tabs (`All`, `Marketing`, `Architecture`, `Product`) in `apps/excalidraw-frontend/components/RoomList.tsx`.

---

## ⏱️ Card 2: Time Management Tools

### 1. Live Telemetry & Latency Badge (~30 mins)
- [ ] Implement a lightweight ping/pong heartbeat in `Game.ts`: dispatch `{ type: "ping", sentAt: Date.now() }` every 5 seconds.
- [ ] Compute roundtrip latency in ms (`Date.now() - sentAt`).
- [ ] Display a live micro-badge on the toolbar: `⚡ 18ms Sync • 42 Shapes • 60 FPS`.

### 2. Floating Session / Sprint Timer Widget (~1 hr)
- [ ] Create a standalone `CanvasTimer.tsx` widget inspired by the amber `04:21` pill from the showcase card.
- [ ] Support quick timer presets: `5 min`, `15 min`, `25 min (Pomodoro)`.
- [ ] Controls: Play, Pause, Reset, and sound alert / subtle visual pulse when time expires.
- [ ] *(Optional Sync)*: Broadcast `{ type: "timer_start", duration, startedAt }` so all room members see the timer synced together.

### 3. Room Agenda & Schedule Drawer (~1.5 hrs)
- [ ] Create a collapsible slide-over panel on the right edge of the canvas (`RoomAgendaDrawer.tsx`).
- [ ] Allow meeting leaders to jot down quick agenda items (e.g. `10:00 - Architecture Review`, `10:30 - Wireframes`).
- [ ] Support simple check-off state for completed discussion items.
- [ ] Save agenda state in room metadata or localStorage.

---

## 📌 Card 3: Advanced Task Tracking

### 1. Database Schema for Tasks (~30 mins)
- [ ] Add `Task` model in `packages/db/prisma/schema.prisma`:
  ```prisma
  model Task {
    id          String   @id @default(uuid())
    roomId      Int
    title       String
    status      String   @default("todo") // "todo" | "in_progress" | "done"
    tag         String?
    dueDate     DateTime?
    assigneeId  String?
    createdAt   DateTime @default(now())
    room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  }
  ```
- [ ] Run `npx prisma migrate dev --name add_task_model` in `packages/db`.

### 2. In-Canvas Kanban Board (~3 hrs)
- [ ] **HTTP Endpoints:** Add `GET /tasks/:roomId`, `POST /tasks`, and `PATCH /tasks/:id` in `apps/http-backend/src/index.ts`.
- [ ] **Kanban Panel:** Create a collapsible bottom or side Kanban board component with columns (`To do`, `In progress`, `Done`).
- [ ] **Task Creation:** Quick-add modal with title, tag (`Feedback`, `Marketing`, `Sales`), and due date.
- [ ] **Drag & Drop:** Allow moving tasks across columns using `@hello-pangea/dnd` or native drag events.
- [ ] **WS Broadcast:** Notify peers when a task status changes to keep the board synchronized.

### 3. Visual Project Milestone Timeline Bar (~1.5 hrs)
- [ ] Create `ProjectTimelineBar.tsx` matching the visual showcase.
- [ ] Display horizontal progress tracks with task names, completion percentages (`90%`, `45%`), and assigned avatar clusters.
- [ ] Render timeline hour markers (`11:00`, `11:30`, `12:00`, `12:30`) or date markers.

---

## 🛠️ Card 4: Customizable Workspaces

### 1. Floating & Draggable Widget Dock (~2 hrs)
- [ ] Refactor the static bottom bar in `apps/excalidraw-frontend/components/Canvas.tsx` into a modular floating dock.
- [ ] Support toggling floating modules:
  - [ ] Sticky Notes pad (draggable scratchpad on canvas)
  - [ ] Sprint Timer capsule
  - [ ] Color & Stroke swatch picker
  - [ ] Task Kanban drawer
- [ ] Persist widget visibility and dock position in `localStorage`.

### 2. Canvas Layout Templates & Wireframe Presets (~1.5 hrs)
- [ ] Add a `TemplatePickerModal.tsx` accessible from the canvas header.
- [ ] Presets to include:
  - **System Architecture:** Draws 3 pre-aligned service boxes (`Client`, `API Gateway`, `Database`) with connection arrows.
  - **Sprint Brainstorm:** Drops 3 dashed quadrant zones (`Ideas`, `In Review`, `Next Steps`).
  - **2-Column Split:** Divides the board into Wireframe & Notes sections with clean bounding boxes.
- [ ] Insert template shapes directly into `Game.ts`'s `existingShapes` array and broadcast to peers.

---

## 🏗️ Architecture Touchpoints Reference

| Subsystem | Key Files to Touch |
| :--- | :--- |
| **Canvas Engine** | [`apps/excalidraw-frontend/draw/Game.ts`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/apps/excalidraw-frontend/draw/Game.ts), [`apps/excalidraw-frontend/components/Canvas.tsx`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/apps/excalidraw-frontend/components/Canvas.tsx) |
| **WebSocket Relay** | [`apps/ws-backend/src/index.ts`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/apps/ws-backend/src/index.ts) |
| **REST API** | [`apps/http-backend/src/index.ts`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/apps/http-backend/src/index.ts) |
| **Database Models** | [`packages/db/prisma/schema.prisma`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/packages/db/prisma/schema.prisma) |
| **Shared Types** | `packages/common/src/index.ts` |
| **Showcase UI (Done)** | [`apps/excalidraw-frontend/components/feature-cards/`](file:///e:/backup_coding/Projects/sketchRoom/draw-app/apps/excalidraw-frontend/components/feature-cards) |
