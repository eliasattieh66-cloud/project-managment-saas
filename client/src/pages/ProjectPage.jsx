import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWorkspaceMembers } from "../api/workspaces.js";
import { getProject, updateProject, archiveProject } from "../api/projects.js";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  assignTask,
} from "../api/tasks.js";

const TASK_COLUMNS = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
];

function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");

  const [tasks, setTasks] = useState([]);
  const [taskActionError, setTaskActionError] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState("");

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError("");

      try {
        const [projectData, membersData, tasksData] = await Promise.all([
          getProject(workspaceId, projectId),
          getWorkspaceMembers(workspaceId),
          getTasks(workspaceId, projectId),
        ]);
        setProject(projectData);
        setMembers(membersData);
        setTasks(tasksData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [workspaceId, projectId]);

  function startEditing() {
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditError("");
    setEditing(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setEditError("");
    setSaving(true);

    try {
      const updatedProject = await updateProject(workspaceId, projectId, {
        name: editName,
        description: editDescription,
      });
      setProject(updatedProject);
      setEditing(false);
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${project.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setArchiveError("");
    setArchiving(true);

    try {
      const archivedProject = await archiveProject(workspaceId, projectId);
      setProject(archivedProject);
    } catch (error) {
      setArchiveError(error.message);
    } finally {
      setArchiving(false);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    setCreateTaskError("");
    setCreatingTask(true);

    try {
      const task = await createTask(workspaceId, projectId, {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate || null,
      });
      setTasks((currentTasks) => [task, ...currentTasks]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDueDate("");
    } catch (error) {
      setCreateTaskError(error.message);
    } finally {
      setCreatingTask(false);
    }
  }

  function replaceTask(updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }

  async function handleStatusChange(taskId, status) {
    setTaskActionError("");

    try {
      const updatedTask = await updateTaskStatus(
        workspaceId,
        projectId,
        taskId,
        status
      );
      replaceTask(updatedTask);
    } catch (error) {
      setTaskActionError(error.message);
    }
  }

  async function handleAssign(taskId, userId) {
    setTaskActionError("");

    try {
      const updatedTask = await assignTask(
        workspaceId,
        projectId,
        taskId,
        userId
      );
      replaceTask(updatedTask);
    } catch (error) {
      setTaskActionError(error.message);
    }
  }

  function getMemberName(userId) {
    const member = members.find((member) => member.id === userId);
    return member ? member.name : "Unknown user";
  }

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link to={`/workspaces/${workspaceId}`}>Back to workspace</Link>
      </div>
    );
  }

  const currentMember = members.find((member) => member.id === user.id);
  const canEditProject =
    currentMember && ["owner", "admin", "member"].includes(currentMember.role);
  const canArchiveProject =
    currentMember &&
    ["owner", "admin"].includes(currentMember.role) &&
    project.status !== "archived";
  const canEditTasks = canEditProject;

  return (
    <div>
      <Link to={`/workspaces/${workspaceId}`}>Back to workspace</Link>

      {editing ? (
        <form onSubmit={handleSave}>
          <label htmlFor="edit-name">Project name</label>
          <input
            id="edit-name"
            type="text"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            maxLength={150}
            required
          />

          <label htmlFor="edit-description">Description (optional)</label>
          <textarea
            id="edit-description"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
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
          <h1>{project.name}</h1>
          <p>Status: {project.status}</p>
          {project.description ? (
            <p>{project.description}</p>
          ) : (
            <p>No description.</p>
          )}

          {canEditProject && (
            <button type="button" onClick={startEditing}>
              Edit project
            </button>
          )}

          {canArchiveProject && (
            <button type="button" onClick={handleArchive} disabled={archiving}>
              {archiving ? "Archiving..." : "Archive project"}
            </button>
          )}

          {archiveError && <p>{archiveError}</p>}
        </div>
      )}

      <section>
        <h2>Tasks</h2>

        {taskActionError && <p>{taskActionError}</p>}

        <div>
          {TASK_COLUMNS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status
            );

            return (
              <div key={column.status}>
                <h3>
                  {column.label} ({columnTasks.length})
                </h3>

                {columnTasks.length === 0 && <p>No tasks.</p>}

                <ul>
                  {columnTasks.map((task) => (
                    <li key={task.id}>
                      <Link
                        to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
                      >
                        <strong>{task.title}</strong>
                      </Link>
                      <p>Priority: {task.priority}</p>
                      {task.due_date && (
                        <p>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                      {task.description && <p>{task.description}</p>}

                      {canEditTasks ? (
                        <div>
                          <label htmlFor={`status-${task.id}`}>Status</label>
                          <select
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(event) =>
                              handleStatusChange(task.id, event.target.value)
                            }
                          >
                            {TASK_COLUMNS.map((option) => (
                              <option key={option.status} value={option.status}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <label htmlFor={`assignee-${task.id}`}>
                            Assigned to
                          </label>
                          <select
                            id={`assignee-${task.id}`}
                            value={task.assigned_to ?? ""}
                            onChange={(event) =>
                              handleAssign(task.id, event.target.value)
                            }
                          >
                            <option value="" disabled>
                              Unassigned
                            </option>
                            {members.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p>
                          Assigned to:{" "}
                          {task.assigned_to
                            ? getMemberName(task.assigned_to)
                            : "Unassigned"}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {canEditTasks && (
        <section>
          <h2>Create a task</h2>

          <form onSubmit={handleCreateTask}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              maxLength={200}
              required
            />

            <label htmlFor="task-description">Description (optional)</label>
            <textarea
              id="task-description"
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
            />

            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={taskPriority}
              onChange={(event) => setTaskPriority(event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label htmlFor="task-due-date">Due date (optional)</label>
            <input
              id="task-due-date"
              type="date"
              value={taskDueDate}
              onChange={(event) => setTaskDueDate(event.target.value)}
            />

            <button type="submit" disabled={creatingTask}>
              {creatingTask ? "Creating..." : "Create task"}
            </button>
          </form>

          {createTaskError && <p>{createTaskError}</p>}
        </section>
      )}
    </div>
  );
}

export default ProjectPage;
