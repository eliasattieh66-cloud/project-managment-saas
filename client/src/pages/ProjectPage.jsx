import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
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
  { status: "todo", label: "To do", dotClass: "bg-slate-400" },
  { status: "in_progress", label: "In progress", dotClass: "bg-amber-400" },
  { status: "done", label: "Done", dotClass: "bg-emerald-500" },
];

const PROJECT_STATUS_CLASSES = {
  active: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

const PRIORITY_CLASSES = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const INPUT_CLASSES =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

const LABEL_CLASSES = "mb-1.5 block text-sm font-medium text-slate-700";

gsap.registerPlugin(useGSAP, SplitText, Flip);
gsap.config({ nullTargetWarn: false });

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

  const pageRef = useRef(null);
  const flipStateRef = useRef(null);

  useGSAP(
    () => {
      if (loading || error || prefersReducedMotion()) {
        return;
      }

      const title = SplitText.create(".project-title", {
        type: "words,chars",
        mask: "chars",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => title.revert(),
      });

      timeline
        .from(title.chars, { yPercent: 110, duration: 0.7, stagger: 0.025 })
        .from(
          ".project-header-fade",
          { opacity: 0, y: 12, duration: 0.5, stagger: 0.1, clearProps: "all" },
          "-=0.4"
        )
        .from(
          ".create-task-card",
          { opacity: 0, y: 30, scale: 0.97, duration: 0.6, clearProps: "all" },
          "-=0.3"
        )
        .from(
          ".task-column",
          { opacity: 0, y: 40, duration: 0.6, stagger: 0.12, clearProps: "all" },
          "-=0.3"
        )
        .from(
          ".column-dot",
          {
            scale: 0,
            duration: 0.4,
            ease: "back.out(3)",
            stagger: 0.12,
            clearProps: "all",
          },
          "<0.2"
        )
        .from(
          ".task-card",
          {
            opacity: 0,
            y: -30,
            rotate: () => gsap.utils.random(-6, 6),
            duration: 0.6,
            ease: "back.out(1.8)",
            stagger: 0.06,
            clearProps: "all",
          },
          "-=0.3"
        );
    },
    { scope: pageRef, dependencies: [loading, error] }
  );

  useGSAP(
    () => {
      const state = flipStateRef.current;

      if (!state) {
        return;
      }

      flipStateRef.current = null;

      Flip.from(state, {
        targets: ".task-card",
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }
          ),
      });
    },
    { scope: pageRef, dependencies: [tasks] }
  );

  function captureTaskPositions() {
    if (prefersReducedMotion() || !pageRef.current) {
      return;
    }

    flipStateRef.current = Flip.getState(
      pageRef.current.querySelectorAll(".task-card")
    );
  }

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
      captureTaskPositions();
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
      captureTaskPositions();
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
    return <p className="text-sm text-slate-500">Loading project...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
        <Link
          to={`/workspaces/${workspaceId}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          &larr; Back to workspace
        </Link>
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
    <div ref={pageRef} className="space-y-8">
      <div>
        <Link
          to={`/workspaces/${workspaceId}`}
          className="text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          &larr; Back to workspace
        </Link>

        {editing ? (
          <form
            onSubmit={handleSave}
            className="mt-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label htmlFor="edit-name" className={LABEL_CLASSES}>
                Project name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                maxLength={150}
                required
                className={INPUT_CLASSES}
              />
            </div>

            <div>
              <label htmlFor="edit-description" className={LABEL_CLASSES}>
                Description{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="edit-description"
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                rows={3}
                className={`${INPUT_CLASSES} resize-none`}
              />
            </div>

            {editError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="project-title truncate text-3xl font-bold text-slate-900">
                  {project.name}
                </h1>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${PROJECT_STATUS_CLASSES[project.status]}`}
                >
                  {project.status}
                </span>
              </div>
              <p className="project-header-fade mt-2 max-w-2xl text-slate-500">
                {project.description || "No description."}
              </p>
            </div>

            <div className="project-header-fade flex shrink-0 gap-3">
              {canEditProject && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Edit project
                </button>
              )}

              {canArchiveProject && (
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={archiving}
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {archiving ? "Archiving..." : "Archive"}
                </button>
              )}
            </div>
          </div>
        )}

        {archiveError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {archiveError}
          </p>
        )}
      </div>

      {canEditTasks && (
        <section className="create-task-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Create a task
          </h2>

          <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label htmlFor="task-title" className={LABEL_CLASSES}>
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  maxLength={200}
                  required
                  placeholder="e.g. Design the homepage"
                  className={INPUT_CLASSES}
                />
              </div>

              <div>
                <label htmlFor="task-priority" className={LABEL_CLASSES}>
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={taskPriority}
                  onChange={(event) => setTaskPriority(event.target.value)}
                  className={INPUT_CLASSES}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="task-due-date" className={LABEL_CLASSES}>
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(event) => setTaskDueDate(event.target.value)}
                  className={INPUT_CLASSES}
                />
              </div>
            </div>

            <div>
              <label htmlFor="task-description" className={LABEL_CLASSES}>
                Description{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(event) => setTaskDescription(event.target.value)}
                rows={2}
                className={`${INPUT_CLASSES} resize-none`}
              />
            </div>

            {createTaskError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {createTaskError}
              </p>
            )}

            <button
              type="submit"
              disabled={creatingTask}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingTask ? "Creating..." : "Create task"}
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Tasks</h2>

        {taskActionError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {taskActionError}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {TASK_COLUMNS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.status
            );

            return (
              <div key={column.status} className="task-column rounded-2xl bg-slate-100 p-3">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={`column-dot h-2.5 w-2.5 rounded-full ${column.dotClass}`} />
                  <h3 className="text-sm font-semibold text-slate-700">
                    {column.label}
                  </h3>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
                    {columnTasks.length}
                  </span>
                </div>

                {columnTasks.length === 0 && (
                  <p className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                    No tasks
                  </p>
                )}

                <ul className="space-y-3">
                  {columnTasks.map((task) => (
                    <li
                      key={task.id}
                      data-flip-id={task.id}
                      className="task-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
                          className="font-semibold text-slate-900 hover:text-indigo-700"
                        >
                          {task.title}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_CLASSES[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                          {task.description}
                        </p>
                      )}

                      {task.due_date && (
                        <p className="mt-2 text-xs font-medium text-slate-500">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}

                      {canEditTasks ? (
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                          <div>
                            <label
                              htmlFor={`status-${task.id}`}
                              className="mb-1 block text-xs font-medium text-slate-500"
                            >
                              Status
                            </label>
                            <select
                              id={`status-${task.id}`}
                              value={task.status}
                              onChange={(event) =>
                                handleStatusChange(task.id, event.target.value)
                              }
                              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
                            >
                              {TASK_COLUMNS.map((option) => (
                                <option key={option.status} value={option.status}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor={`assignee-${task.id}`}
                              className="mb-1 block text-xs font-medium text-slate-500"
                            >
                              Assignee
                            </label>
                            <select
                              id={`assignee-${task.id}`}
                              value={task.assigned_to ?? ""}
                              onChange={(event) =>
                                handleAssign(task.id, event.target.value)
                              }
                              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
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
                        </div>
                      ) : (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
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
    </div>
  );
}

export default ProjectPage;
