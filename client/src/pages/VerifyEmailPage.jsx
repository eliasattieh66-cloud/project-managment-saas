import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { verifyEmail } from "../api/auth.js";

gsap.registerPlugin(useGSAP);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This verification link is missing its token."
  );

  const pageRef = useRef(null);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token || hasVerifiedRef.current) {
      return;
    }

    hasVerifiedRef.current = true;

    async function runVerification() {
      try {
        const successMessage = await verifyEmail(token);
        setMessage(successMessage);
        setStatus("success");
      } catch (error) {
        setMessage(error.message);
        setStatus("error");
      }
    }

    runVerification();
  }, [token]);

  useGSAP(
    () => {
      if (status === "verifying" || prefersReducedMotion()) {
        return;
      }

      gsap
        .timeline()
        .from(".verify-card", {
          opacity: 0,
          y: 30,
          scale: 0.95,
          duration: 0.6,
          ease: "back.out(1.6)",
          clearProps: "all",
        })
        .from(
          ".verify-icon",
          { scale: 0, rotate: -90, duration: 0.6, ease: "back.out(3)", clearProps: "all" },
          "<0.15"
        )
        .from(
          ".verify-card > *:not(.verify-icon)",
          { opacity: 0, y: 12, duration: 0.4, stagger: 0.08, clearProps: "all" },
          "<0.1"
        );
    },
    { scope: pageRef, dependencies: [status] }
  );

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-indigo-50 via-white to-sky-50 px-4"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-sky-300/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-medium text-slate-600">
              Verifying your email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="verify-card space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <span className="verify-icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
              ✓
            </span>
            <h1 className="text-lg font-semibold text-slate-900">
              Email verified!
            </h1>
            <p className="text-sm text-slate-500">{message}</p>
            <Link
              to="/login"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="verify-card space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
            <span className="verify-icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </span>
            <h1 className="text-lg font-semibold text-slate-900">
              Verification failed
            </h1>
            <p className="text-sm text-slate-500">{message}</p>
            <p className="text-xs text-slate-400">
              Already verified? Just log in. Otherwise, log in to request a new
              link.
            </p>
            <Link
              to="/login"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
