import { useState, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import { resetPassword } from "../api/auth.js";

gsap.registerPlugin(useGSAP, SplitText);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ResetPasswordPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  useGSAP(
    () => {
      if (!successMessage || prefersReducedMotion()) {
        return;
      }

      gsap
        .timeline()
        .from(".success-card", {
          opacity: 0,
          y: 30,
          scale: 0.95,
          duration: 0.6,
          ease: "back.out(1.6)",
          clearProps: "all",
        })
        .from(
          ".success-icon",
          { scale: 0, rotate: -20, duration: 0.5, ease: "back.out(3)", clearProps: "all" },
          "<0.2"
        );
    },
    { scope: pageRef, dependencies: [successMessage] }
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }

    setSubmitting(true);

    try {
      const message = await resetPassword(token, password);
      setSuccessMessage(message);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderCard() {
    if (!token) {
      return (
        <div className="auth-card space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <p className="text-sm text-slate-600">
            This reset link is missing its token. Please open the link from
            your email again, or request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Request a new link
          </Link>
        </div>
      );
    }

    if (successMessage) {
      return (
        <div className="success-card space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <span className="success-icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✅
          </span>
          <h2 className="text-lg font-semibold text-slate-900">
            Password changed
          </h2>
          <p className="text-sm text-slate-500">{successMessage}</p>
          <Link
            to="/login"
            className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Go to login
          </Link>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="auth-card space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
      >
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            New password
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

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          />
        </div>

        {error && (
          <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{error}</p>
            {error.includes("invalid or has expired") && (
              <Link
                to="/forgot-password"
                className="font-semibold text-red-800 underline hover:text-red-900"
              >
                Request a new link
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Change password"}
        </button>
      </form>
    );
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
            Choose a new password
          </h1>
          <p className="auth-subtitle mt-1 text-sm text-slate-500">
            Pick something you haven't used before
          </p>
        </div>

        {renderCard()}

        <p className="auth-footer mt-6 text-center text-sm text-slate-500">
          Back to{" "}
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

export default ResetPasswordPage;
