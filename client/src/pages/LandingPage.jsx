import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext.jsx";
import HeroScene from "../components/HeroScene.jsx";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const FEATURES = [
  {
    title: "Workspaces",
    description: "Give every team its own space and invite people in seconds.",
    icon: "◆",
  },
  {
    title: "Projects",
    description: "Group work into projects, edit them anytime, archive when done.",
    icon: "▣",
  },
  {
    title: "Task board",
    description: "Move tasks from To do to Done on a clear three-column board.",
    icon: "▤",
  },
  {
    title: "Assign tasks",
    description: "Everyone knows who owns what. No more lost responsibilities.",
    icon: "◉",
  },
  {
    title: "Roles & permissions",
    description: "Owners, admins, members and viewers each see the right actions.",
    icon: "⬢",
  },
  {
    title: "Priorities & due dates",
    description: "Spot what matters first with priorities and deadlines.",
    icon: "◷",
  },
];

const STEPS = [
  {
    title: "Create a workspace",
    description: "Start a home for your team and invite your teammates by email.",
  },
  {
    title: "Plan your projects",
    description: "Break your work into projects and fill them with tasks.",
  },
  {
    title: "Ship together",
    description: "Assign tasks, track progress on the board and get things done.",
  },
];

const PREVIEW_COLUMNS = [
  { label: "To do", dot: "bg-slate-400", tasks: ["Design homepage", "Write copy"] },
  { label: "In progress", dot: "bg-amber-400", tasks: ["Build API"] },
  { label: "Done", dot: "bg-emerald-500", tasks: ["Set up database", "Plan sprint"] },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function LandingPage() {
  const { user } = useAuth();
  const pageRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        return;
      }

      const headline = SplitText.create(".hero-title", {
        type: "words,chars",
        mask: "chars",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-badge", { opacity: 0, y: 20, duration: 0.6 })
        .from(headline.chars, { yPercent: 110, duration: 0.8, stagger: 0.02 }, "-=0.3")
        .from(".hero-fade", { opacity: 0, y: 20, duration: 0.6, stagger: 0.12 }, "-=0.5")
        .from(
          ".hero-preview",
          {
            opacity: 0,
            y: 80,
            rotateX: 25,
            transformPerspective: 1200,
            duration: 1.2,
          },
          "-=0.4"
        );

      gsap.from(".hero-scene", { opacity: 0, scale: 1.1, duration: 2, ease: "power2.out" });

      gsap.to(".hero-scene-scroll", {
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-parallax", {
        y: -80,
        rotateX: -8,
        transformPerspective: 1200,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.utils.toArray(".section-heading").forEach((heading) => {
        gsap.from(heading, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: heading, start: "top 85%" },
        });
      });

      gsap.set(".feature-card", { opacity: 0, y: 60, scale: 0.95 });

      ScrollTrigger.batch(".feature-card", {
        start: "top 88%",
        onEnter: (cards) =>
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.4)",
            stagger: 0.1,
          }),
        once: true,
      });

      gsap.from(".steps-line-fill", {
        scaleY: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".steps-list",
          start: "top 70%",
          end: "bottom 60%",
          scrub: true,
        },
      });

      gsap.utils.toArray(".step-item").forEach((step) => {
        gsap.from(step, {
          opacity: 0,
          x: -40,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 75%" },
        });
      });

      const statement = SplitText.create(".statement-text", { type: "words" });

      gsap.fromTo(
        statement.words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: ".statement-section",
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
          },
        }
      );

      gsap.from(".cta-card", {
        opacity: 0,
        scale: 0.9,
        y: 60,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".cta-card", start: "top 85%" },
      });
    },
    { scope: pageRef }
  );

  return (
    <div ref={pageRef} className="min-h-screen bg-slate-950 text-slate-300">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/welcome" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
              T
            </span>
            <span className="text-lg font-semibold text-white">TaskFlow</span>
          </Link>

          {user ? (
            <Link
              to="/"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
            >
              Open app
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200"
              >
                Get started
              </Link>
            </div>
          )}
        </nav>
      </header>

      <section className="hero-section relative overflow-hidden px-4 pb-24 pt-36 sm:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="hero-scene-scroll pointer-events-none absolute inset-x-0 top-0 h-screen"
        >
          <div className="hero-scene h-full w-full">
            <HeroScene />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="hero-badge inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
            Project management for small teams
          </span>

          <h1 className="hero-title mt-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Plan, track and ship work together
          </h1>

          <p className="hero-fade mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            TaskFlow brings your workspaces, projects and tasks into one clean
            board, so your team always knows what to do next.
          </p>

          <div className="hero-fade mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={user ? "/" : "/register"}
              className="rounded-xl bg-linear-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-shadow hover:shadow-indigo-500/50"
            >
              {user ? "Open your workspaces" : "Start for free"}
            </Link>
            {!user && (
              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
              >
                I already have an account
              </Link>
            )}
          </div>
        </div>

        <div className="hero-parallax relative mx-auto mt-20 max-w-5xl">
        <div className="hero-preview rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-indigo-950 backdrop-blur">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-slate-500">Website redesign</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {PREVIEW_COLUMNS.map((column) => (
              <div key={column.label} className="rounded-xl bg-slate-900/80 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                  <span className="text-xs font-semibold text-slate-300">
                    {column.label}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <div
                      key={task}
                      className="rounded-lg border border-white/5 bg-slate-800 px-3 py-2.5 text-sm text-slate-200"
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="section-heading mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-slate-400">
              Simple tools that stay out of your way and keep work moving.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="feature-card rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-indigo-400/40 hover:bg-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-lg text-white shadow-lg shadow-indigo-500/20">
                  {feature.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="section-heading text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-slate-400">Up and running in three steps.</p>
          </div>

          <div className="steps-list relative mt-16 space-y-12 pl-12">
            <div className="absolute bottom-2 left-4 top-2 w-0.5 bg-slate-800">
              <div className="steps-line-fill h-full w-full origin-top bg-linear-to-b from-indigo-500 to-violet-500" />
            </div>

            {STEPS.map((step, index) => (
              <div key={step.title} className="step-item relative">
                <span className="absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-indigo-300 ring-2 ring-indigo-500">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="statement-section px-4 py-32 sm:px-6">
        <p className="statement-text mx-auto max-w-4xl text-center text-3xl font-bold leading-tight text-white sm:text-5xl">
          Less time asking who is doing what. More time actually doing it.
        </p>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="cta-card relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 to-violet-600 px-6 py-16 text-center shadow-2xl shadow-indigo-900/50">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-100">
            Create your first workspace in under a minute.
          </p>
          <Link
            to={user ? "/" : "/register"}
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            {user ? "Open your workspaces" : "Create your account"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TaskFlow
      </footer>
    </div>
  );
}

export default LandingPage;
