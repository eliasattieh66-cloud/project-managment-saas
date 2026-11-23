import { useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import { forgotPassword } from "../api/auth.js";

gsap.registerPlugin(useGSAP, SplitText);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ForgotPasswordPage() {
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

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
      if (!sentMessage || prefersReducedMotion()) {
        return;
      }

      gsap
        .timeline()
        .from(".inbox-card", {
          opacity: 0,
          y: 30,
          scale: 0.95,
          duration: 0.6,
          ease: "back.out(1.6)",
          clearProps: "all",
        })
        .from(
          ".inbox-icon",
          { scale: 0, rotate: -20, duration: 0.5, ease: "back.out(3)", clearProps: "all" },
          "<0.2"
        );
    },
    { scope: pageRef, dependencies: [sentMessage] }
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const message = await forgotPassword(email);
      setSentMessage(message);
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
            Forgot your password?
          </h1>
          <p className="auth-subtitle mt-1 text-sm text-slate-500">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sentMessage ? (
          <div className="inbox-card space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <span className="inbox-icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl">
              ✉️
            </span>
            <h2 className="text-lg font-semibold text-slate-900">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-500">{sentMessage}</p>
            <p className="text-xs text-slate-400">
              The link expires in 1 hour. Can't find it? Check your spam
              folder.
            </p>

            <button
              type="button"
              onClick={() => setSentMessage("")}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Use a different email
            </button>

            <Link
              to="/login"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="auth-card space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
          >
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
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="auth-footer mt-6 text-center text-sm text-slate-500">
          Remembered it?{" "}
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

export default ForgotPasswordPage;
