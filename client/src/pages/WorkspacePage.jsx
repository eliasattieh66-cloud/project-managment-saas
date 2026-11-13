import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import { useConfirm } from "../context/confirmContext.js";
import {
  getWorkspace,
  getWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
  updateMemberRole,
  renameWorkspace,
} from "../api/workspaces.js";
import { getProjects, createProject } from "../api/projects.js";

const ROLE_BADGE_CLASSES = {
  owner: "bg-indigo-100 text-indigo-700",
  admin: "bg-sky-100 text-sky-700",
  member: "bg-emerald-100 text-emerald-700",
  viewer: "bg-slate-100 text-slate-600",
};

const PROJECT_STATUS_CLASSES = {
  active: "bg-emerald-100 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
};

gsap.registerPlugin(useGSAP, SplitText);
gsap.config({ nullTargetWarn: false });

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function WorkspacePage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const confirm = useConfirm();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const [changingRoleId, setChangingRoleId] = useState(null);
  const [roleError, setRoleError] = useState("");

  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [renameCount, setRenameCount] = useState(0);

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

  const pageRef = useRef(null);

  const { contextSafe } = useGSAP(
    () => {
      if (loading || error || prefersReducedMotion()) {
        return;
      }

      const title = SplitText.create(".workspace-title", {
        type: "words,chars",
        mask: "chars",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => title.revert(),
      });

      timeline
        .from(".workspace-header-avatar", {
          scale: 0,
          rotate: -180,
          duration: 0.6,
          ease: "back.out(2.5)",
          clearProps: "all",
        })
        .from(title.chars, { yPercent: 110, duration: 0.7, stagger: 0.025 }, "<0.1")
        .from(".workspace-summary", { opacity: 0, y: 10, duration: 0.5 }, "-=0.4")
        .from(
          ".project-card",
          {
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
          },
          "-=0.3"
        )
        .from(
          ".side-card",
          {
            opacity: 0,
            x: 40,
            duration: 0.6,
            stagger: 0.15,
            clearProps: "all",
          },
          "<"
        )
        .from(
          ".member-row",
          {
            opacity: 0,
            x: 30,
            duration: 0.5,
            stagger: 0.07,
            clearProps: "all",
          },
          "<0.2"
        )
        .from(
          ".member-avatar",
          {
            scale: 0,
            duration: 0.5,
            ease: "back.out(2.5)",
            stagger: 0.07,
            clearProps: "all",
          },
          "<0.1"
        )
        .from(
          ".create-project-card",
          { opacity: 0, y: 30, scale: 0.97, duration: 0.6, clearProps: "all" },
          "-=0.6"
        );
    },
    { scope: pageRef, dependencies: [loading, error] }
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

  const flashRow = contextSafe((element) => {
    if (prefersReducedMotion()) {
      return;
    }

    gsap.fromTo(
      element,
      { backgroundColor: "#eef2ff" },
      { backgroundColor: "rgba(238, 242, 255, 0)", duration: 1.2, ease: "power2.out", clearProps: "backgroundColor" }
    );
  });

  useGSAP(
    () => {
      if (renameCount === 0 || prefersReducedMotion()) {
        return;
      }

      const title = SplitText.create(".workspace-title", {
        type: "words,chars",
        mask: "chars",
      });

      gsap
        .timeline({ onComplete: () => title.revert() })
        .from(title.chars, {
          yPercent: 110,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.025,
        })
        .from(
          ".workspace-header-avatar",
          { rotate: -180, scale: 0.5, duration: 0.6, ease: "back.out(2.5)", clearProps: "all" },
          "<"
        );
    },
    { scope: pageRef, dependencies: [renameCount] }
  );

  function startRenaming() {
    setNameDraft(workspace.name);
    setRenameError("");
    setRenaming(true);
  }

  async function handleRename(event) {
    event.preventDefault();
    setRenameError("");
    setSavingName(true);

    try {
      const updatedWorkspace = await renameWorkspace(workspaceId, nameDraft);
      setWorkspace(updatedWorkspace);
      setRenaming(false);
      setRenameCount((count) => count + 1);
    } catch (error) {
      setRenameError(error.message);
    } finally {
      setSavingName(false);
    }
  }

  async function handleRoleChange(member, newRole, element) {
    if (newRole === member.role) {
      return;
    }

    if (newRole === "admin") {
      const confirmed = await confirm({
        title: `Make ${member.name} an admin?`,
        message: "Admins can add and remove members and manage everything in this workspace.",
        confirmLabel: "Make admin",
      });

      if (!confirmed) {
        return;
      }
    }

    setRoleError("");
    setChangingRoleId(member.id);

    try {
      const updatedMember = await updateMemberRole(workspaceId, member.id, newRole);
      setMembers((currentMembers) =>
        currentMembers.map((item) =>
          item.id === member.id ? { ...item, role: updatedMember.role } : item
        )
      );
      flashRow(element);
    } catch (error) {
      setRoleError(error.message);
    } finally {
      setChangingRoleId(null);
    }
  }

  const handleRemoveMember = contextSafe(async (member, element) => {
    const confirmed = await confirm({
      title: `Remove ${member.name}?`,
      message: `${member.name} will lose access to this workspace, and their tasks here will be unassigned.`,
      confirmLabel: "Remove",
    });

    if (!confirmed) {
      return;
    }

    setRemoveError("");
    setRemovingId(member.id);

    try {
      await removeWorkspaceMember(workspaceId, member.id);
    } catch (error) {
      setRemoveError(error.message);
      setRemovingId(null);
      return;
    }

    function removeFromList() {
      setMembers((currentMembers) =>
        currentMembers.filter((item) => item.id !== member.id)
      );
      setRemovingId(null);
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
    return <p className="text-sm text-slate-500">Loading workspace...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          &larr; Back to my workspaces
        </Link>
      </div>
    );
  }

  const currentMember = members.find((member) => member.id === user.id);
  const canManageMembers =
    currentMember && ["owner", "admin"].includes(currentMember.role);

  function canRemoveMember(member) {
    if (!canManageMembers || member.id === user.id || member.role === "owner") {
      return false;
    }

    if (member.role === "admin") {
      return currentMember.role === "owner";
    }

    return true;
  }
  const canCreateProjects =
    currentMember && ["owner", "admin", "member"].includes(currentMember.role);

  return (
    <div ref={pageRef} className="space-y-8">
      <div>
        <Link
          to="/"
          className="text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          &larr; My workspaces
        </Link>

        <div className="mt-3 flex items-center gap-4">
          <span className="workspace-header-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-md shadow-indigo-500/30">
            {workspace.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            {renaming ? (
              <form
                onSubmit={handleRename}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  aria-label="Workspace name"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  maxLength={100}
                  required
                  autoFocus
                  className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xl font-bold text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenaming(false)}
                    disabled={savingName}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="workspace-title truncate text-3xl font-bold text-slate-900">
                  {workspace.name}
                </h1>
                {canManageMembers && (
                  <button
                    type="button"
                    onClick={startRenaming}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  >
                    Rename
                  </button>
                )}
              </div>
            )}

            {renameError && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {renameError}
              </p>
            )}

            <p className="workspace-summary text-sm text-slate-500">
              {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
              &middot; {members.length}{" "}
              {members.length === 1 ? "member" : "members"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Projects
            </h2>

            {projects.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center">
                <p className="font-medium text-slate-700">No projects yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Projects you create will appear here.
                </p>
              </div>
            )}

            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id} className="project-card">
                  <Link
                    to={`/workspaces/${workspaceId}/projects/${project.id}`}
                    onMouseMove={handleCardMove}
                    onMouseLeave={handleCardLeave}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-[translate,box-shadow,border-color] hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">
                        {project.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PROJECT_STATUS_CLASSES[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {project.description || "No description."}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {canCreateProjects && (
            <section className="create-project-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Create a project
              </h2>

              <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="project-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Project name
                  </label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(event) => setProjectName(event.target.value)}
                    maxLength={150}
                    required
                    placeholder="e.g. Website redesign"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description{" "}
                    <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="project-description"
                    value={projectDescription}
                    onChange={(event) =>
                      setProjectDescription(event.target.value)
                    }
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>

                {createProjectError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createProjectError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={creatingProject}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingProject ? "Creating..." : "Create project"}
                </button>
              </form>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="side-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>

            {[removeError, roleError].filter(Boolean).map((message) => (
              <p
                key={message}
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {message}
              </p>
            ))}

            <ul className="mt-4 divide-y divide-slate-100">
              {members.map((member) => (
                <li key={member.id} className="member-row flex items-center gap-3 overflow-hidden py-3">
                  <span className="member-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {member.name}
                      {member.id === user.id && (
                        <span className="font-normal text-slate-400"> (you)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                    {canRemoveMember(member) && (
                      <button
                        type="button"
                        onClick={(event) =>
                          handleRemoveMember(member, event.currentTarget.closest("li"))
                        }
                        disabled={removingId === member.id}
                        className="mt-1 text-xs font-medium text-slate-400 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removingId === member.id ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                  {canRemoveMember(member) ? (
                    <select
                      aria-label={`Role of ${member.name}`}
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(
                          member,
                          event.target.value,
                          event.currentTarget.closest("li")
                        )
                      }
                      disabled={changingRoleId === member.id}
                      className={`shrink-0 cursor-pointer rounded-full border-0 px-2 py-0.5 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-wait disabled:opacity-60 ${ROLE_BADGE_CLASSES[member.role]}`}
                    >
                      {currentMember.role === "owner" && (
                        <option value="admin">Admin</option>
                      )}
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE_CLASSES[member.role]}`}
                    >
                      {member.role}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {canManageMembers && (
            <section className="side-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Add a member
              </h2>

              <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="member-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="member-email"
                    type="email"
                    value={memberEmail}
                    onChange={(event) => setMemberEmail(event.target.value)}
                    required
                    placeholder="teammate@example.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="member-role"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Role
                  </label>
                  <select
                    id="member-role"
                    value={memberRole}
                    onChange={(event) => setMemberRole(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {addError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding ? "Adding..." : "Add member"}
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default WorkspacePage;
