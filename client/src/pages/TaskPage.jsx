import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConfirm } from "../context/confirmContext.js";
import { getWorkspaceMembers } from "../api/workspaces.js";
import { getTask, updateTask, deleteTask } from "../api/tasks.js";
import TaskComments from "../components/TaskComments.jsx";
import TaskAttachments from "../components/TaskAttachments.jsx";

const STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_CLASSES = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_CLASSES = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const INPUT_CLASSES =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

const LABEL_CLASSES = "mb-1.5 block text-sm font-medium text-slate-700";

gsap.registerPlugin(useGSAP, SplitText);
gsap.config({ nullTargetWarn: false });

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function TaskPage() {
  const { workspaceId, projectId, taskId } = useParams();
  const { user } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();

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

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (loading || error || prefersReducedMotion()) {
        return;
      }

      if (editing) {
        gsap.from(".edit-form > *", {
          opacity: 0,
          y: 16,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.05,
          clearProps: "all",
        });
        return;
      }

      const title = SplitText.create(".task-title", {
        type: "words,chars",
        mask: "chars",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => title.revert(),
      });

      timeline
        .from(".task-main-card", {
          opacity: 0,
          y: 30,
          duration: 0.6,
          clearProps: "all",
        })
        .from(title.chars, { yPercent: 110, duration: 0.6, stagger: 0.02 }, "<0.15")
        .from(
          ".task-fade",
          { opacity: 0, y: 12, duration: 0.5, stagger: 0.1, clearProps: "all" },
          "-=0.3"
        )
        .from(
          ".task-details-card",
          { opacity: 0, x: 40, duration: 0.6, clearProps: "all" },
          0.1
        )
        .from(
          ".detail-row",
          { opacity: 0, x: 20, duration: 0.4, stagger: 0.07, clearProps: "all" },
          "<0.2"
        )
        .from(
          ".detail-badge",
          {
            scale: 0,
            duration: 0.5,
            ease: "back.out(3)",
            stagger: 0.1,
            clearProps: "all",
          },
          "<0.1"
        );
    },
    { scope: pageRef, dependencies: [loading, error, editing] }
  );

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

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete this task?",
      message: `"${task.title}", its comments and its files will be permanently removed.`,
    });

    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleting(true);

    try {
      await deleteTask(workspaceId, projectId, taskId);
      navigate(projectUrl, { replace: true });
    } catch (error) {
      setDeleteError(error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading task...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
        <Link
          to={projectUrl}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          &larr; Back to project
        </Link>
      </div>
    );
  }

  const currentMember = members.find((member) => member.id === user.id);
  const canEditTask =
    currentMember && ["owner", "admin", "member"].includes(currentMember.role);
  const canManageWorkspace =
    currentMember && ["owner", "admin"].includes(currentMember.role);
  const canDeleteTask =
    canManageWorkspace || (canEditTask && task.created_by === user.id);

  return (
    <div ref={pageRef} className="space-y-6">
      <Link
        to={projectUrl}
        className="text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        &larr; Back to project
      </Link>

      {editing ? (
        <form
          onSubmit={handleSave}
          className="edit-form max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-slate-900">Edit task</h1>

          <div>
            <label htmlFor="edit-title" className={LABEL_CLASSES}>
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              maxLength={200}
              required
              className={INPUT_CLASSES}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-priority" className={LABEL_CLASSES}>
                Priority
              </label>
              <select
                id="edit-priority"
                value={editPriority}
                onChange={(event) => setEditPriority(event.target.value)}
                className={INPUT_CLASSES}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-due-date" className={LABEL_CLASSES}>
                Due date
              </label>
              <input
                id="edit-due-date"
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
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
              rows={5}
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
          <section className="task-main-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h1 className="task-title text-2xl font-bold text-slate-900">
                {task.title}
              </h1>
              <div className="flex shrink-0 gap-2">
                {canEditTask && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Edit task
                  </button>
                )}
                {canDeleteTask && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>

            {deleteError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}

            <h2 className="task-fade mt-6 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h2>
            {task.description ? (
              <p className="task-fade mt-2 whitespace-pre-wrap text-slate-700">
                {task.description}
              </p>
            ) : (
              <p className="task-fade mt-2 italic text-slate-400">No description.</p>
            )}
          </section>

          <TaskAttachments
            workspaceId={workspaceId}
            projectId={projectId}
            taskId={taskId}
            canDeleteAny={canManageWorkspace}
          />

          <TaskComments
            workspaceId={workspaceId}
            projectId={projectId}
            taskId={taskId}
          />
          </div>

          <aside className="task-details-card h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Details
            </h2>

            <dl className="mt-4 space-y-4 text-sm">
              <div className="detail-row flex items-center justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span
                    className={`detail-badge inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </span>
                </dd>
              </div>

              <div className="detail-row flex items-center justify-between gap-4">
                <dt className="text-slate-500">Priority</dt>
                <dd>
                  <span
                    className={`detail-badge inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_CLASSES[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </dd>
              </div>

              <div className="detail-row flex items-center justify-between gap-4">
                <dt className="text-slate-500">Assignee</dt>
                <dd className="font-medium text-slate-900">
                  {task.assigned_to
                    ? getMemberName(task.assigned_to)
                    : "Unassigned"}
                </dd>
              </div>

              <div className="detail-row flex items-center justify-between gap-4">
                <dt className="text-slate-500">Due date</dt>
                <dd className="font-medium text-slate-900">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No due date"}
                </dd>
              </div>

              <div className="detail-row flex items-center justify-between gap-4">
                <dt className="text-slate-500">Created by</dt>
                <dd className="font-medium text-slate-900">
                  {getMemberName(task.created_by)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}

export default TaskPage;
