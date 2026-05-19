# Real-Time Collaborative Editor

A real-time collaborative code editor where multiple users can join and edit the same document simultaneously. Built with **Yjs** CRDT for conflict-free real-time sync and **Monaco Editor** for a VS Code-like editing experience.

## 🔗 Live Demo

[http://docker-aws-alb-984208749.ap-northeast-1.elb.amazonaws.com/](http://docker-aws-alb-984208749.ap-northeast-1.elb.amazonaws.com/)

## ✨ Features

- **Real-Time Collaboration** — Multiple users edit the same document at the same time using Yjs CRDTs synced over Socket.IO.
- **Monaco Editor** — VS Code's editor in the browser with JavaScript syntax highlighting and `vs-dark` theme.
- **User Awareness** — See who's currently connected in the sidebar, powered by Yjs awareness protocol.
- **Room-Based Editing** — Users join by entering a username; all connected users share the same document.

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4, Monaco Editor (`@monaco-editor/react`) |
| Real-Time Sync | Yjs, y-monaco, y-socket.io |
| Backend | Node.js, Express 5, Socket.IO, y-socket.io (server) |
| Deployment | Docker (multi-stage build), AWS ALB |

## 📁 Project Structure

```
├── Frontend/          # React + Vite frontend
│   └── src/
│       └── App.jsx    # Main editor + user join UI
├── backend/
│   └── server.js      # Express + Socket.IO + YSocketIO server
├── dockerfile         # Multi-stage Docker build
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker (for containerized setup)

### Run Locally (without Docker)

1. **Clone the repo**
   ```bash
   git clone https://github.com/manumay1962/Real-Time-Collaborative-Editor.git
   cd Real-Time-Collaborative-Editor
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the frontend** (in a separate terminal)
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

### Run with Docker

```bash
docker build -t realtime-editor .
docker run -p 3000:3000 realtime-editor
```

The app will be available at `http://localhost:3000`.

## 📝 How It Works

1. User opens the app and enters a username to join.
2. A Yjs document is created and synced across all clients via `y-socket.io` over Socket.IO.
3. `y-monaco` binds the shared Yjs text type to the Monaco Editor, so every keystroke is broadcast in real-time.
4. The awareness protocol tracks connected users and displays them in the sidebar.
