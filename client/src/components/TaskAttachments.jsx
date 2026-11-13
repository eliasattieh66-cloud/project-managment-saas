import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getAttachments,
  uploadAttachment,
  downloadAttachment,
  deleteAttachment,
} from "../api/attachments.js";

gsap.registerPlugin(useGSAP);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileLabel(fileName) {
  const extension = fileName.split(".").pop().toUpperCase();
  return extension.length > 0 && extension.length <= 4 ? extension : "FILE";
}

function TaskAttachments({ workspaceId, projectId, taskId, canDeleteAny }) {
  const { user } = useAuth();

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [newAttachmentId, setNewAttachmentId] = useState(null);

  const sectionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadAttachments() {
      setLoading(true);
      setError("");

      try {
        const data = await getAttachments(workspaceId, projectId, taskId);
        setAttachments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadAttachments();
  }, [workspaceId, projectId, taskId]);

  useGSAP(
    () => {
      if (loading || prefersReducedMotion()) {
        return;
      }

      gsap.from(".attachment-item", {
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
      if (!newAttachmentId || prefersReducedMotion()) {
        return;
      }

      gsap.from(`[data-attachment-id="${newAttachmentId}"]`, {
        opacity: 0,
        y: -16,
        scale: 0.95,
        duration: 0.5,
        ease: "back.out(1.8)",
        clearProps: "all",
      });
    },
    { scope: sectionRef, dependencies: [newAttachmentId] }
  );

  async function handleUpload(file) {
    if (!file) {
      return;
    }

    setUploadError("");

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("This file is too large. The maximum size is 10 MB.");
      return;
    }

    setUploading(true);

    try {
      const attachment = await uploadAttachment(
        workspaceId,
        projectId,
        taskId,
        file
      );
      setAttachments((currentAttachments) => [
        { ...attachment, uploaded_by_name: user.name },
        ...currentAttachments,
      ]);
      setNewAttachmentId(attachment.id);
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    handleUpload(event.dataTransfer.files[0]);
  }

  async function handleDownload(attachment) {
    setDownloadError("");
    setDownloadingId(attachment.id);

    try {
      await downloadAttachment(workspaceId, projectId, taskId, attachment);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloadingId(null);
    }
  }

  const handleDelete = contextSafe(async (attachment, element) => {
    if (!window.confirm(`Delete "${attachment.file_name}"?`)) {
      return;
    }

    setDeleteError("");
    setDeletingId(attachment.id);

    try {
      await deleteAttachment(workspaceId, projectId, taskId, attachment.id);
    } catch (error) {
      setDeleteError(error.message);
      setDeletingId(null);
      return;
    }

    function removeFromList() {
      setAttachments((currentAttachments) =>
        currentAttachments.filter((item) => item.id !== attachment.id)
      );
      setDeletingId(null);
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
        Attachments{" "}
        {!loading && !error && (
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {attachments.length}
          </span>
        )}
      </h2>

      {!loading && !error && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            dragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            id="attachment-input"
            type="file"
            onChange={(event) => handleUpload(event.target.files[0])}
            disabled={uploading}
            className="sr-only"
          />

          {uploading ? (
            <p className="text-sm font-medium text-indigo-600">Uploading...</p>
          ) : (
            <p className="text-sm text-slate-500">
              Drag a file here, or{" "}
              <label
                htmlFor="attachment-input"
                className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-700"
              >
                browse
              </label>
              <span className="mt-1 block text-xs text-slate-400">
                Up to 10 MB
              </span>
            </p>
          )}
        </div>
      )}

      {loading && (
        <p className="mt-4 text-sm text-slate-500">Loading attachments...</p>
      )}

      {[error, uploadError, downloadError, deleteError].filter(Boolean).map((message) => (
        <p
          key={message}
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {message}
        </p>
      ))}

      {attachments.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              data-attachment-id={attachment.id}
              className="attachment-item flex items-center gap-3 overflow-hidden py-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600">
                {getFileLabel(attachment.file_name)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {attachment.file_name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {formatFileSize(attachment.file_size)} &middot;{" "}
                  {attachment.uploaded_by_name} &middot;{" "}
                  {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(attachment)}
                disabled={downloadingId === attachment.id}
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingId === attachment.id ? "Downloading..." : "Download"}
              </button>

              {(canDeleteAny ||
                String(attachment.uploaded_by) === String(user.id)) && (
                <button
                  type="button"
                  onClick={(event) =>
                    handleDelete(attachment, event.currentTarget.closest("li"))
                  }
                  disabled={deletingId === attachment.id}
                  className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === attachment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskAttachments;
