import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import { getWorkspaces, createWorkspace } from "../api/workspaces.js";

const ROLE_BADGE_CLASSES = {
  owner: "bg-indigo-100 text-indigo-700",
  admin: "bg-sky-100 text-sky-700",
  member: "bg-emerald-100 text-emerald-700",
  viewer: "bg-slate-100 text-slate-600",
};

gsap.registerPlugin(useGSAP, SplitText);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HomePage() {
  const { user } = useAuth();

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

  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        return;
      }

      const title = SplitText.create(".welcome-title", {
        type: "words,chars",
        mask: "chars",
      });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(title.chars, {
          yPercent: 110,
          duration: 0.7,
          stagger: 0.025,
        })
        .from(
          ".welcome-subtitle",
          { opacity: 0, y: 12, duration: 0.5 },
          "-=0.4"
        )
        .from(
          ".create-card",
          { opacity: 0, y: 30, scale: 0.97, duration: 0.6, clearProps: "all" },
          "-=0.3"
        );
    },
    { scope: pageRef }
  );

  const { contextSafe } = useGSAP(
    () => {
      if (loading || prefersReducedMotion()) {
        return;
      }

      const timeline = gsap.timeline({ delay: 0.3 });

      timeline
        .from(".workspace-card", {
          opacity: 0,
          y: 60,
          rotateX: -50,
          scale: 0.9,
          transformPerspective: 800,
          transformOrigin: "50% 0%",
          duration: 0.8,
          ease: "back.out(1.6)",
          stagger: 0.09,
          clearProps: "all",
        })
        .from(
          ".workspace-avatar",
          {
            scale: 0,
            rotate: -180,
            duration: 0.6,
            ease: "back.out(2.5)",
            stagger: 0.09,
            clearProps: "all",
          },
          "<0.25"
        );
    },
    { scope: pageRef, dependencies: [loading] }
  );

  const handleCardMove = contextSafe((event) => {
    if (prefersReducedMotion()) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateY: x * 14,
      rotateX: -y * 14,
      transformPerspective: 700,
      duration: 0.4,
      ease: "power2.out",
    });
  });

  const handleCardLeave = contextSafe((event) => {
    gsap.to(event.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)",
    });
  });

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
    <div ref={pageRef} className="space-y-10">
      <div>
        <h1 className="welcome-title text-3xl font-bold text-slate-900">
          Welcome, {user.name}
        </h1>
        <p className="welcome-subtitle mt-1 text-slate-500">
          Pick a workspace to continue, or create a new one.
        </p>
      </div>

      <section className="create-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Create a workspace
        </h2>

        <form
          onSubmit={handleCreateWorkspace}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="workspace-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Workspace name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              maxLength={100}
              required
              placeholder="e.g. Marketing team"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {createError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {createError}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          My workspaces
        </h2>

        {loading && <p className="text-sm text-slate-500">Loading workspaces...</p>}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
            <p className="font-medium text-slate-700">No workspaces yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first workspace above to get started.
            </p>
          </div>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <li key={workspace.id} className="workspace-card">
              <Link
                to={`/workspaces/${workspace.id}`}
                onMouseMove={handleCardMove}
                onMouseLeave={handleCardLeave}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[translate,box-shadow,border-color] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100"
              >
                <span className="workspace-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white shadow-md shadow-indigo-500/30">
                  {workspace.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">
                    {workspace.name}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE_CLASSES[workspace.role]}`}
                  >
                    {workspace.role}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
