const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"]
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description must be 1000 characters or fewer"]
    },
    category: {
      type: String,
      trim: true,
      default: "Personal"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    dueDate: {
      type: String,
      default: ""
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FLEXI API is running" });
});

// Get all tasks, newest first
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve tasks." });
  }
});

// Create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Please enter a task title." });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      category: category || "Personal",
      priority: priority || "Medium",
      dueDate: dueDate || ""
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not create task." });
  }
});

// Update task fields or completion status
app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const allowedFields = ["title", "description", "category", "priority", "dueDate", "completed"];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not update task." });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid task ID." });
  }
});

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/flexi_tasks"
    );
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`FLEXI API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB.");
    console.error("Make sure MongoDB Community Server is running and MONGO_URI is correct.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
