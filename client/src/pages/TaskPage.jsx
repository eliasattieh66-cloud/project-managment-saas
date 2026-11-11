import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWorkspaceMembers } from "../api/workspaces.js";
import { getTask, updateTask } from "../api/tasks.js";

const STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

function TaskPage() {
  const { workspaceId, projectId, taskId } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      setError("");

      try {
        const [taskData, membersData] = await Promise.all([
          getTask(workspaceId, projectId, taskId),
          getWorkspaceMembers(workspaceId),
        ]);
        setTask(taskData);
        setMembers(membersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [workspaceId, projectId, taskId]);

  function getMemberName(userId) {
    const member = members.find((member) => member.id === userId);
    return member ? member.name : "Unknown user";
  }

  function startEditing() {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
    setEditError("");
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setEditError("");
    setSaving(true);

    try {
      const updatedTask = await updateTask(workspaceId, projectId, taskId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate || null,
      });
      setTask(updatedTask);
      setEditing(false);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const projectUrl = `/workspaces/${workspaceId}/projects/${projectId}`;

  if (loading) {
    return <p>Loading task...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link to={projectUrl}>Back to project</Link>
      </div>
    );
  }

  const currentMember = members.find((member) => member.id === user.id);
  const canEditTask =
    currentMember && ["owner", "admin", "member"].includes(currentMember.role);

  return (
    <div>
      <Link to={projectUrl}>Back to project</Link>

      {editing ? (
        <form onSubmit={handleSave}>
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            maxLength={200}
            required
          />

          <label htmlFor="edit-description">Description (optional)</label>
          <textarea
            id="edit-description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
          />

          <label htmlFor="edit-priority">Priority</label>
          <select
            id="edit-priority"
            value={editPriority}
            onChange={(event) => setEditPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="edit-due-date">Due date (optional)</label>
          <input
            id="edit-due-date"
            type="date"
            value={editDueDate}
            onChange={(event) => setEditDueDate(event.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            Cancel
          </button>

          {editError && <p>{editError}</p>}
        </form>
      ) : (
        <div>
          <h1>{task.title}</h1>

          <p>Status: {STATUS_LABELS[task.status]}</p>
          <p>Priority: {task.priority}</p>
          <p>
            Assigned to:{" "}
            {task.assigned_to ? getMemberName(task.assigned_to) : "Unassigned"}
          </p>
          <p>Created by: {getMemberName(task.created_by)}</p>
          <p>
            Due date:{" "}
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString()
              : "No due date"}
          </p>

          {task.description ? (
            <p>{task.description}</p>
          ) : (
            <p>No description.</p>
          )}

          {canEditTask && (
            <button type="button" onClick={startEditing}>
              Edit task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskPage;
