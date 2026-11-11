import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
} from "../api/workspaces.js";
import { getProjects, createProject } from "../api/projects.js";

function WorkspacePage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState("");

  useEffect(() => {
    async function loadWorkspace() {
      setLoading(true);
      setError("");

      try {
        const [workspaceData, membersData, projectsData] = await Promise.all([
          getWorkspace(workspaceId),
          getWorkspaceMembers(workspaceId),
          getProjects(workspaceId),
        ]);
        setWorkspace(workspaceData);
        setMembers(membersData);
        setProjects(projectsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [workspaceId]);

  async function handleAddMember(event) {
    event.preventDefault();
    setAddError("");
    setAdding(true);

    try {
      await addWorkspaceMember(workspaceId, memberEmail, memberRole);
      const membersData = await getWorkspaceMembers(workspaceId);
      setMembers(membersData);
      setMemberEmail("");
      setMemberRole("member");
    } catch (error) {
      setAddError(error.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setCreateProjectError("");
    setCreatingProject(true);

    try {
      const project = await createProject(
        workspaceId,
        projectName,
        projectDescription
      );
      setProjects((currentProjects) => [project, ...currentProjects]);
      setProjectName("");
      setProjectDescription("");
    } catch (error) {
      setCreateProjectError(error.message);
    } finally {
      setCreatingProject(false);
    }
  }

  if (loading) {
    return <p>Loading workspace...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <Link to="/">Back to my workspaces</Link>
      </div>
    );
  }

  const currentMember = members.find((member) => member.id === user.id);
  const canManageMembers =
    currentMember && ["owner", "admin"].includes(currentMember.role);
  const canCreateProjects =
    currentMember && ["owner", "admin", "member"].includes(currentMember.role);

  return (
    <div>
      <Link to="/">Back to my workspaces</Link>

      <h1>{workspace.name}</h1>

      <section>
        <h2>Projects</h2>

        {projects.length === 0 && <p>No projects yet.</p>}

        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={`/workspaces/${workspaceId}/projects/${project.id}`}>
                {project.name}
              </Link>{" "}
              ({project.status})
              {project.description && <p>{project.description}</p>}
            </li>
          ))}
        </ul>
      </section>

      {canCreateProjects && (
        <section>
          <h2>Create a project</h2>

          <form onSubmit={handleCreateProject}>
            <label htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              maxLength={150}
              required
            />

            <label htmlFor="project-description">Description (optional)</label>
            <textarea
              id="project-description"
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.target.value)}
            />

            <button type="submit" disabled={creatingProject}>
              {creatingProject ? "Creating..." : "Create project"}
            </button>
          </form>

          {createProjectError && <p>{createProjectError}</p>}
        </section>
      )}

      <section>
        <h2>Members</h2>

        <ul>
          {members.map((member) => (
            <li key={member.id}>
              {member.name} ({member.email}) - {member.role}
            </li>
          ))}
        </ul>
      </section>

      {canManageMembers && (
        <section>
          <h2>Add a member</h2>

          <form onSubmit={handleAddMember}>
            <label htmlFor="member-email">Email</label>
            <input
              id="member-email"
              type="email"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              required
            />

            <label htmlFor="member-role">Role</label>
            <select
              id="member-role"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>

            <button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add member"}
            </button>
          </form>

          {addError && <p>{addError}</p>}
        </section>
      )}
    </div>
  );
}

export default WorkspacePage;
