import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../api/comments.js";

gsap.registerPlugin(useGSAP);

const TEXTAREA_CLASSES =
  "w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TaskComments({ workspaceId, projectId, taskId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [actionError, setActionError] = useState("");
  const [newCommentId, setNewCommentId] = useState(null);

  const sectionRef = useRef(null);

  useEffect(() => {
    async function loadComments() {
      setLoading(true);
      setError("");

      try {
        const data = await getComments(workspaceId, projectId, taskId);
        setComments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [workspaceId, projectId, taskId]);

  useGSAP(
    () => {
      if (loading || prefersReducedMotion()) {
        return;
      }

      gsap.from(".comment-item", {
        opacity: 0,
        y: 16,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.06,
        clearProps: "all",
      });
    },
    { scope: sectionRef, dependencies: [loading] }
  );

  const { contextSafe } = useGSAP(
    () => {
      if (!newCommentId || prefersReducedMotion()) {
        return;
      }

      gsap.from(`[data-comment-id="${newCommentId}"]`, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.5,
        ease: "back.out(1.8)",
        clearProps: "all",
      });
    },
    { scope: sectionRef, dependencies: [newCommentId] }
  );

  async function handleAdd(event) {
    event.preventDefault();
    setPostError("");
    setPosting(true);

    try {
      const comment = await addComment(
        workspaceId,
        projectId,
        taskId,
        newContent
      );
      setComments((currentComments) => [
        ...currentComments,
        { ...comment, author_name: user.name },
      ]);
      setNewCommentId(comment.id);
      setNewContent("");
    } catch (error) {
      setPostError(error.message);
    } finally {
      setPosting(false);
    }
  }

  function startEditing(comment) {
    setActionError("");
    setEditingId(comment.id);
    setEditContent(comment.content);
  }

  async function handleSaveEdit(event, comment) {
    event.preventDefault();
    setActionError("");
    setSavingEdit(true);

    try {
      const updatedComment = await updateComment(
        workspaceId,
        projectId,
        taskId,
        comment.id,
        editContent
      );
      setComments((currentComments) =>
        currentComments.map((item) =>
          item.id === comment.id
            ? { ...updatedComment, author_name: item.author_name }
            : item
        )
      );
      setEditingId(null);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const handleDelete = contextSafe(async (comment, element) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    setActionError("");

    try {
      await deleteComment(workspaceId, projectId, taskId, comment.id);
    } catch (error) {
      setActionError(error.message);
      return;
    }

    function removeFromList() {
      setComments((currentComments) =>
        currentComments.filter((item) => item.id !== comment.id)
      );
    }

    if (prefersReducedMotion()) {
      removeFromList();
      return;
    }

    gsap.to(element, {
      opacity: 0,
      x: 40,
      height: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: removeFromList,
    });
  });

  return (
    <section
      ref={sectionRef}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Comments{" "}
        {!loading && !error && (
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {comments.length}
          </span>
        )}
      </h2>

      {loading && (
        <p className="mt-4 text-sm text-slate-500">Loading comments...</p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {actionError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <p className="mt-4 text-sm italic text-slate-400">
          No comments yet. Start the discussion below.
        </p>
      )}

      <ul className="mt-2 divide-y divide-slate-100">
        {comments.map((comment) => {
          const isOwn = comment.user_id === user.id;
          const isEdited = comment.updated_at !== comment.created_at;

          return (
            <li
              key={comment.id}
              data-comment-id={comment.id}
              className="comment-item flex gap-3 overflow-hidden py-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                {comment.author_name.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {comment.author_name}
                    {isOwn && (
                      <span className="font-normal text-slate-400"> (you)</span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(comment.created_at)}
                    {isEdited && " · edited"}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <form
                    onSubmit={(event) => handleSaveEdit(event, comment)}
                    className="mt-2 space-y-2"
                  >
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={3}
                      required
                      aria-label="Edit comment"
                      className={TEXTAREA_CLASSES}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingEdit ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={savingEdit}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {comment.content}
                  </p>
                )}

                {isOwn && editingId !== comment.id && (
                  <div className="mt-2 flex gap-3 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => startEditing(comment)}
                      className="text-slate-500 transition-colors hover:text-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(event) =>
                        handleDelete(comment, event.currentTarget.closest("li"))
                      }
                      className="text-slate-500 transition-colors hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!loading && !error && (
        <form onSubmit={handleAdd} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <label htmlFor="new-comment" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="new-comment"
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            rows={3}
            required
            placeholder="Write a comment..."
            className={TEXTAREA_CLASSES}
          />

          {postError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {postError}
            </p>
          )}

          <button
            type="submit"
            disabled={posting || newContent.trim().length === 0}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {posting ? "Posting..." : "Post comment"}
          </button>
        </form>
      )}
    </section>
  );
}

export default TaskComments;
