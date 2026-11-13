import { useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ConfirmContext } from "../context/confirmContext.js";

gsap.registerPlugin(useGSAP);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);
  const closingRef = useRef(false);
  const dialogRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      closingRef.current = false;
      setDialog({
        title: options.title ?? "Are you sure?",
        message: options.message ?? "",
        confirmLabel: options.confirmLabel ?? "Delete",
      });
    });
  }, []);

  const { contextSafe } = useGSAP(
    () => {
      if (!dialog || prefersReducedMotion()) {
        return;
      }

      gsap
        .timeline()
        .from(".confirm-overlay", { opacity: 0, duration: 0.2 })
        .from(
          ".confirm-card",
          {
            opacity: 0,
            scale: 0.9,
            y: 20,
            duration: 0.35,
            ease: "back.out(1.8)",
          },
          "<"
        )
        .from(
          ".confirm-icon",
          { scale: 0, rotate: -90, duration: 0.4, ease: "back.out(3)" },
          "<0.1"
        );
    },
    { scope: dialogRef, dependencies: [dialog] }
  );

  const animateOut = contextSafe((onComplete) => {
    gsap
      .timeline({ onComplete })
      .to(".confirm-card", {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
      })
      .to(".confirm-overlay", { opacity: 0, duration: 0.2 }, "<");
  });

  function close(result) {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;

    function finish() {
      setDialog(null);
      resolverRef.current?.(result);
      resolverRef.current = null;
    }

    if (prefersReducedMotion()) {
      finish();
    } else {
      animateOut(finish);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      close(false);
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div
          ref={dialogRef}
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="confirm-overlay absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => close(false)}
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="confirm-card relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <span className="confirm-icon mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
              !
            </span>

            <h2
              id="confirm-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              {dialog.title}
            </h2>

            {dialog.message && (
              <p id="confirm-message" className="mt-2 text-sm text-slate-500">
                {dialog.message}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => close(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
