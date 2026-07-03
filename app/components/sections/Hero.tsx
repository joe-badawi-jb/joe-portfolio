"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { createHeroIntro } from "@/app/animations/heroIntro";
import { LOADER_DURATION_MS } from "@/app/components/loader/MatrixLoader";
import ContactButton from "@/app/components/buttons/ContactButton";
import CodeBackdrop from "@/app/components/background/CodeBackdrop";

// Heavy 3D scene: loaded lazily and mounted after the intro loader so its
// GLB parse / WebGL init don't compete with the loader or the text intro.
const PCModel = dynamic(() => import("@/app/components/3dModels/PCModel"), {
  ssr: false,
});

// Placeholder copy — real content comes later.
const TITLE_WORDS = ["I", "build", "fast,", "clean", "web", "experiences."];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createHeroIntro> | null>(null);
  const modelWrap = useRef<HTMLDivElement>(null);
  const [showModel, setShowModel] = useState(false);

  // Text intro: starts once the loader has wiped away. The loader dispatches
  // "loader:done" when it lifts (it may wait on the first model to load), so we
  // start on that event — with a fallback timer in case it never fires.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      // Reveal the model right away — the loader already waited for it to load,
      // so it renders instantly and animates in alongside the text intro.
      setShowModel(true);
      scope.current = createHeroIntro(root, {
        reducedMotion: reduce,
        onComplete: () => setShowModel(true),
      });
    };

    if (reduce) {
      start();
      return () => scope.current?.revert();
    }

    window.addEventListener("loader:done", start);
    const fallback = setTimeout(start, LOADER_DURATION_MS + 10000);

    return () => {
      window.removeEventListener("loader:done", start);
      clearTimeout(fallback);
      scope.current?.revert();
    };
  }, []);

  // Reveal the model once it has actually mounted.
  useEffect(() => {
    if (!showModel || !modelWrap.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    animate(modelWrap.current, {
      opacity: [0, 1],
      scale: reduce ? [1, 1] : [0.94, 1],
      duration: reduce ? 1 : 1100,
      ease: "out(3)",
    });
  }, [showModel]);

  // The section is sticky and sits at z-0; the next section is opaque and
  // higher, so it scrolls up and overlaps this pinned hero before taking over.
  return (
    <section
      ref={root}
      className="sticky top-0 z-0 flex h-screen items-center overflow-hidden"
    >
      <CodeBackdrop className="z-0" />

      <div className="container relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
        {/* Left: text */}
        <div className="flex flex-col items-start gap-6">
          <p className="hero-eyebrow font-mono text-sm uppercase tracking-[0.3em] text-accent-blue opacity-0 md:text-base">
            {"// software engineer"}
          </p>

          <h1 className="hero-title text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl xl:text-8xl">
            {TITLE_WORDS.map((word, i) => (
              <span key={i} className="word inline-block opacity-0">
                {word}&nbsp;
              </span>
            ))}
          </h1>

          <span className="hero-accent block h-1 w-0 rounded-full bg-accent-pink" />

          <p className="hero-desc max-w-xl text-lg leading-relaxed text-muted opacity-0 md:text-2xl">
            I design and build fast, accessible web experiences with a focus on
            clean architecture and details that feel alive.
          </p>

          <div className="hero-cta opacity-0">
            <ContactButton />
          </div>
        </div>

        {/* Right: 3D model */}
        <div
          ref={modelWrap}
          className="hero-model h-[40vh] w-full opacity-0 sm:h-[60vh] lg:h-[80vh]"
        >
          {showModel && <PCModel />}
        </div>
      </div>
    </section>
  );
}
