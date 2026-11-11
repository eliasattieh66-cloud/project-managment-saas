import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getWorkspaces, createWorkspace } from "../api/workspaces.js";

function HomePage() {
  const { user, logout } = useAuth();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const data = await getWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const workspace = await createWorkspace(newWorkspaceName);
      setWorkspaces((currentWorkspaces) => [
        { ...workspace, role: "owner" },
        ...currentWorkspaces,
      ]);
      setNewWorkspaceName("");
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <header>
        <h1>Welcome, {user.name}</h1>
        <p>You are logged in as {user.email}</p>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <section>
        <h2>Create a workspace</h2>

        <form onSubmit={handleCreateWorkspace}>
          <label htmlFor="workspace-name">Workspace name</label>
          <input
            id="workspace-name"
            type="text"
            value={newWorkspaceName}
            onChange={(event) => setNewWorkspaceName(event.target.value)}
            maxLength={100}
            required
          />
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {createError && <p>{createError}</p>}
      </section>

      <section>
        <h2>My workspaces</h2>

        {loading && <p>Loading workspaces...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && workspaces.length === 0 && (
          <p>You don't have any workspaces yet. Create one above.</p>
        )}

        <ul>
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link to={`/workspaces/${workspace.id}`}>{workspace.name}</Link>{" "}
              ({workspace.role})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
