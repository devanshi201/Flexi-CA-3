import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Circle,
  ClipboardList,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Zap
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

const initialForm = {
  title: "",
  description: "",
  category: "College",
  priority: "Medium",
  dueDate: ""
};

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load tasks.");
      setTasks(data);
    } catch {
      setError("Backend se connect nahi ho raha. Check karo ki backend aur MongoDB dono running hain.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length
  }), [tasks]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && !task.completed) ||
        (filter === "Completed" && task.completed);
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || "").toLowerCase().includes(query) ||
        (task.category || "").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function addTask(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save task.");

      setTasks((current) => [data, ...current]);
      setForm(initialForm);
      setSuccess("Task saved to MongoDB successfully.");
    } catch (err) {
      setError(err.message || "Could not save task. Check the backend.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed })
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.message || "Could not update task.");
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this task permanently?")) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete task.");
      setTasks((current) => current.filter((task) => task._id !== id));
      setSuccess("Task deleted.");
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="FLEXI home">
          <span className="brand-icon"><Zap size={21} fill="currentColor" /></span>
          <span>FLEXI<span className="brand-dot">.</span></span>
        </a>

        <div className="side-label">WORKSPACE</div>
        <button className="side-link active" type="button">
          <ClipboardList size={18} /> My tasks
        </button>
        <div className="sidebar-note">
          <div className="note-icon"><Clock3 size={18} /></div>
          <strong>One step at a time.</strong>
          <p>Keep your work organised and make room for what matters.</p>
        </div>
        <div className="sidebar-footer">
          <span className="status-dot" /> Local workspace
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> My tasks</div>
          <div className="profile-chip"><span>JS</span><div><strong>Student</strong><small>My workspace</small></div></div>
        </header>

        <section className="welcome-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL WORKSPACE</div>
            <h1>Make today <span>count.</span></h1>
            <p className="subtitle">A little progress each day adds up to big results.</p>
          </div>
          <div className="date-pill"><Clock3 size={16} /> Stay on track</div>
        </section>

        <section className="stats-grid" aria-label="Task statistics">
          <div className="stat-card">
            <div className="stat-top"><span>Total tasks</span><span className="stat-icon purple"><ClipboardList size={18} /></span></div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-foot">Across your workspace</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Pending</span><span className="stat-icon orange"><Clock3 size={18} /></span></div>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-foot">Ready for your attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Completed</span><span className="stat-icon green"><Check size={18} /></span></div>
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-foot">Look how far you've come</div>
          </div>
        </section>

        {(error || success) && (
          <div className={`notice ${error ? "notice-error" : "notice-success"}`} role="status">
            {error || success}
            <button type="button" onClick={() => { setError(""); setSuccess(""); }} aria-label="Dismiss message"><X size={16} /></button>
          </div>
        )}

        <div className="content-grid">
          <section className="panel task-panel">
            <div className="panel-heading">
              <div><h2>Your tasks</h2><p>Everything you need to get done.</p></div>
              <button className="icon-button" onClick={loadTasks} type="button" title="Refresh tasks" aria-label="Refresh tasks"><RefreshCw size={17} /></button>
            </div>

            <div className="task-toolbar">
              <div className="filter-tabs">
                {["All", "Pending", "Completed"].map((item) => (
                  <button key={item} type="button" className={filter === item ? "filter-tab selected" : "filter-tab"} onClick={() => setFilter(item)}>
                    {item}
                    {item === "All" && <span>{stats.total}</span>}
                  </button>
                ))}
              </div>
              <label className="search-box">
                <Search size={16} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" />
              </label>
            </div>

            {loading ? (
              <div className="empty-state"><RefreshCw className="spin" size={25} /><p>Loading your tasks...</p></div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><ClipboardList size={25} /></div>
                <h3>{search || filter !== "All" ? "No matching tasks" : "Your list is a blank canvas"}</h3>
                <p>{search || filter !== "All" ? "Try another search or filter." : "Add your first task using the form. It will be saved in MongoDB."}</p>
              </div>
            ) : (
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <article className={`task-item ${task.completed ? "task-completed" : ""}`} key={task._id}>
                    <button className={`complete-button ${task.completed ? "is-complete" : ""}`} type="button" onClick={() => toggleTask(task)} aria-label={task.completed ? "Mark as pending" : "Mark as completed"} title={task.completed ? "Mark pending" : "Mark complete"}>
                      {task.completed ? <Check size={15} /> : <Circle size={18} />}
                    </button>
                    <div className="task-details">
                      <div className="task-title-row">
                        <h3>{task.title}</h3>
                        <span className={`priority priority-${(task.priority || "Medium").toLowerCase()}`}>{task.priority}</span>
                      </div>
                      {task.description && <p className="task-description">{task.description}</p>}
                      <div className="task-meta">
                        <span className="category-tag">{task.category || "Personal"}</span>
                        <span><Clock3 size={13} /> {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <button className="delete-button" type="button" onClick={() => deleteTask(task._id)} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={16} /></button>
                  </article>
                ))}
              </div>
            )}
            <div className="panel-bottom"><span>{visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"} shown</span><span><span className="status-dot" /> Synced with database</span></div>
          </section>

          <section className="panel add-panel">
            <div className="panel-heading">
              <div><h2>Add a task</h2><p>Get it out of your head.</p></div>
              <span className="add-heading-icon"><Plus size={19} /></span>
            </div>

            <form onSubmit={addTask} className="task-form">
              <label>Task title <span>*</span>
                <input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Finish project report" maxLength={120} required />
              </label>
              <label>Description
                <textarea name="description" value={form.description} onChange={updateForm} placeholder="Add a few details..." rows={3} maxLength={1000} />
              </label>
              <div className="form-row">
                <label>Category
                  <select name="category" value={form.category} onChange={updateForm}>
                    <option>College</option><option>Personal</option><option>Project</option><option>Work</option><option>Other</option>
                  </select>
                </label>
                <label>Priority
                  <select name="priority" value={form.priority} onChange={updateForm}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </label>
              </div>
              <label>Due date
                <input type="date" name="dueDate" value={form.dueDate} onChange={updateForm} />
              </label>
              <button className="submit-button" type="submit" disabled={saving}>
                {saving ? <><RefreshCw size={17} className="spin" /> Saving...</> : <><Plus size={18} /> Add task to workspace</>}
              </button>
              <p className="form-footnote"><Check size={14} /> Your task is stored in your local MongoDB database.</p>
            </form>
          </section>
        </div>
        <footer className="page-footer">FLEXI <span>·</span> Built to help you focus on what matters.</footer>
      </main>
    </div>
  );
}
