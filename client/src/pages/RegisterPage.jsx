import { useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";

gsap.registerPlugin(useGSAP, SplitText);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function RegisterPage() {
  const { user, register, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        return;
      }

      gsap.to(".auth-blob", {
        x: "random(-80, 80)",
        y: "random(-60, 60)",
        scale: "random(0.85, 1.2)",
        duration: "random(6, 10)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
      });

      const title = SplitText.create(".auth-title", {
        type: "words,chars",
        mask: "chars",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => title.revert(),
      });

      timeline
        .from(".auth-logo", {
          scale: 0,
          rotate: -180,
          duration: 0.7,
          ease: "back.out(2.5)",
          clearProps: "all",
        })
        .from(title.chars, { yPercent: 110, duration: 0.6, stagger: 0.03 }, "<0.2")
        .from(".auth-subtitle", { opacity: 0, y: 10, duration: 0.5 }, "-=0.3")
        .from(
          ".auth-card",
          { opacity: 0, y: 40, scale: 0.96, duration: 0.7, clearProps: "all" },
          "-=0.4"
        )
        .from(
          ".auth-card > *",
          { opacity: 0, y: 14, duration: 0.4, stagger: 0.07, clearProps: "all" },
          "-=0.45"
        )
        .from(".auth-footer", { opacity: 0, duration: 0.5 }, "-=0.2");
    },
    { scope: pageRef }
  );

  useGSAP(
    () => {
      if (!error || prefersReducedMotion()) {
        return;
      }

      gsap.to(".auth-card", {
        keyframes: { x: [0, -10, 10, -8, 8, -4, 4, 0] },
        duration: 0.5,
        ease: "power1.inOut",
        clearProps: "transform",
      });
    },
    { scope: pageRef, dependencies: [error] }
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(name, email, password);
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-indigo-50 via-white to-sky-50 px-4"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="auth-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="auth-blob absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="auth-blob absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="auth-logo mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-lg shadow-indigo-600/30">
            T
          </span>
          <h1 className="auth-title text-2xl font-bold text-slate-900">
            Create an account
          </h1>
          <p className="auth-subtitle mt-1 text-sm text-slate-500">
            Start organizing your work with TaskFlow
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-card space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              At least 8 characters.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
