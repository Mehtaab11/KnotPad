# KnotPad 📝

A high-performance, real-time collaborative workspace engineered to allow multiple users to edit rich-text documents simultaneously. KnotPad bridges the gap between stateless REST APIs and stateful WebSockets to deliver a seamless, Google Docs-style editing experience.

## 🧠 System Architecture

KnotPad utilizes a "Dual-Channel" architecture, splitting traffic between traditional HTTP protocols and persistent WebSocket connections to optimize both security and speed.

### 1. The Real-Time Sync Engine (WebSockets)
Instead of overwriting the database on every keystroke, KnotPad uses **Operational Transformation (OT)** via Quill.js Deltas. 
* When User A types, the client generates a mathematical Delta (e.g., *insert 'x' at index 42*).
* The Socket.io server instantly routes this Delta exclusively to the secure "Room" for that specific document.
* Collaborator clients intercept the Delta and inject it into their local UI, creating the illusion of zero-latency simultaneous typing.
* A silent background chron-job batches the final state and pushes it to MongoDB every 2 seconds to ensure data persistence without network bottlenecking.

### 2. The Presence & Cursor System (In-Memory State)
To handle real-time user avatars and flying cursors, the backend maintains a lightweight, server-side memory ledger.
* **Presence:** When a user connects, the Node server queries MongoDB for their identity, generates an avatar profile, and adds them to an `activeRooms` array stored in RAM. This array is broadcasted to the room, updating the UI instantly when users join or drop off.
* **Cursors:** Keystrokes and mouse clicks trigger indexing events. The server broadcasts the exact coordinate index of a user's cursor, allowing the frontend to render a floating HTML flag over the text in real-time.

### 3. Security & Authorization (REST API)
* Standard operations (Authentication, Dashboard loading, Title updating) are handled via a stateless Express REST API.
* Routes are protected by **JSON Web Tokens (JWT)**.
* Custom WebSocket Middleware intercepts incoming socket connections, decodes the JWT, and verifies the user's ID against the document's `owner` and `collaborators` arrays in MongoDB before granting them access to the live room.

## ✨ Core Features

* **Multiplayer Editing:** Sub-millisecond text syncing using WebSockets and mathematical Deltas.
* **Live Remote Cursors:** See exactly where your collaborators are clicking and typing in real-time with color-coded, named flags.
* **Dynamic Presence Avatars:** The header UI dynamically updates to show colored initials of exactly who is currently viewing the document.
* **Auto-Save & Status Indicators:** Visual UI feedback confirms when changes transition from local memory to the cloud database.
* **Smart Dashboard Routing:** Automatically organizes user workspaces into isolated "My Documents" and "Shared with Me" data views based on DB arrays.

## 🛠️ Tech Stack

**Frontend**
* **React.js** (Vite)
* **TailwindCSS** (Styling)
* **Quill.js** (Vanilla JS Rich-Text Engine)
* **Quill-Cursors** (Coordinate mapping module)
* **Socket.io-client** (Event listening and broadcasting)

**Backend**
* **Node.js & Express.js** (RESTful API)
* **Socket.io** (WebSocket Server & Room Routing)
* **MongoDB Atlas & Mongoose** (Database)
* **Bcrypt & JWT** (Password hashing and secure stateless sessions)
