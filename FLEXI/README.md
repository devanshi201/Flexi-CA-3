# FLEXI — Student Task & Deadline Manager

A beginner-friendly full-stack web application built with:
- Frontend: React + Vite, HTML/CSS/JavaScript
- Backend: Node.js + Express
- Database: MongoDB (view records using MongoDB Compass)

## Features
- Add tasks with title, description, category, priority, due date
- View all tasks
- Filter tasks by All / Pending / Completed
- Mark a task completed or pending
- Delete tasks
- Data is stored in MongoDB, so it remains after refreshing the page

## Requirements
Install Node.js LTS, MongoDB Community Server, and optionally MongoDB Compass.

## 1. Start MongoDB
Make sure the MongoDB Community Server service is running.
Open MongoDB Compass and connect to:
`mongodb://127.0.0.1:27017`

## 2. Configure and start the backend
Open a terminal in VS Code:

```bash
cd backend
```

Create a `.env` file by copying `.env.example`, or create it manually with:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flexi_tasks
```

Then run:

```bash
npm install
npm run dev
```

You should see `MongoDB connected` and `FLEXI API running at http://localhost:5000`.

Check the API in a browser at `http://localhost:5000/api/health`.

## 3. Start the frontend
Open a SECOND terminal in VS Code:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed in the terminal, usually `http://localhost:5173`.

## MongoDB Compass
After adding a task in the website, refresh Compass and open:
- Database: `flexi_tasks`
- Collection: `tasks`

MongoDB creates the database and collection automatically after the first task is added.

## Project structure
```text
FLEXI/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
└── backend/
    ├── package.json
    ├── .env.example
    └── server.js
```

## Common errors
- **MongoDB connection error:** start the MongoDB service and check `MONGO_URI`.
- **Failed to fetch:** make sure the backend is running on port 5000.
- **npm not recognized:** install Node.js LTS and restart VS Code.
- **Port already in use:** close the other server process or change the port in `.env` and update the frontend API URL.

This is a local development starter. Before public deployment, add authentication, stricter validation, and production security settings.
