"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createAboutIntro } from "@/app/animations/aboutIntro";

// Load the particles engine lazily, only when this section is reached.
const ParticlesBackground = dynamic(
    () => import("@/app/components/background/ParticlesBackground"),
    { ssr: false }
);

// Placeholder copy — real content comes later.
const TITLE_WORDS = ["A", "bit", "about", "me."];

export default function About() {
    const root = useRef<HTMLElement>(null);
    const scope = useRef<ReturnType<typeof createAboutIntro> | null>(null);
    const [showParticles, setShowParticles] = useState(false);

    // Play the intro (and mount the particles) once the section scrolls into
    // view — i.e. once the runner has crossed the finish line and the theme
    // has flipped to light.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    scope.current = createAboutIntro(root, reduce);
                    setShowParticles(true);
                    io.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        io.observe(el);

        return () => {
            io.disconnect();
            scope.current?.revert();
        };
    }, []);

    // Opaque + above the pinned hero so it covers it; bg follows the (now
    // light) theme.
    return (
        <section
            id="about"
            ref={root}
            className="relative z-10 flex min-h-screen items-center overflow-hidden bg-surface"
        >
            {showParticles && (
                <ParticlesBackground className="absolute inset-0 z-0" />
            )}

            <div className="container relative z-10 py-32">
                <p className="about-eyebrow font-mono text-sm uppercase tracking-[0.3em] text-accent-blue opacity-0 md:text-base">
                    {"// about"}
                </p>

                <h2 className="about-title mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl xl:text-8xl">
                    {TITLE_WORDS.map((word, i) => (
                        <span key={i} className="word inline-block opacity-0">
                            {word}&nbsp;
                        </span>
                    ))}
                </h2>

                <span className="about-accent mt-8 block h-1 w-0 rounded-full bg-accent-pink" />

                <p className="about-desc mt-8 max-w-2xl text-xl leading-relaxed text-muted opacity-0 md:text-2xl">
                    Placeholder description for the about section. This is where a
                    short, punchy bio will live — who you are, what you build, and
                    what you care about. Your real content goes here later.
                </p>
            </div>
        </section>
    );
}
