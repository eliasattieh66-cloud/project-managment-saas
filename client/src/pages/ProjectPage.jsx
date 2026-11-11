import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWorkspaceMembers } from "../api/workspaces.js";
import { getProject, updateProject, archiveProject } from "../api/projects.js";

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

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError("");

      try {
        const [projectData, membersData] = await Promise.all([
          getProject(workspaceId, projectId),
          getWorkspaceMembers(workspaceId),
        ]);
        setProject(projectData);
        setMembers(membersData);
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
    </div>
  );
}

export default ProjectPage;
