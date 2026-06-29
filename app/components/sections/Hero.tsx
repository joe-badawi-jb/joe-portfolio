"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { createHeroIntro } from "@/app/animations/heroIntro";
import { LOADER_DURATION_MS } from "@/app/components/loader/MatrixLoader";
import ContactButton from "@/app/components/buttons/ContactButton";

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
    const textColRef = useRef<HTMLDivElement>(null);
    const modelParallaxRef = useRef<HTMLDivElement>(null);
    const [showModel, setShowModel] = useState(false);

    // Text intro: starts once the loader has wiped away.
    useEffect(() => {
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const introTimer = setTimeout(
            () => {
                scope.current = createHeroIntro(root, {
                    reducedMotion: reduce,
                    // Load + mount the 3D model only after the intro ends.
                    onComplete: () => setShowModel(true),
                });
            },
            reduce ? 0 : LOADER_DURATION_MS
        );

        return () => {
            clearTimeout(introTimer);
            scope.current?.revert();
        };
    }, []);

    // Reveal the model once it has actually mounted.
    useEffect(() => {
        if (!showModel || !modelWrap.current) return;
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        animate(modelWrap.current, {
            opacity: [0, 1],
            scale: reduce ? [1, 1] : [0.94, 1],
            duration: reduce ? 1 : 1100,
            ease: "out(3)",
        });
    }, [showModel]);

    // Parallax: drift the text and model columns at different rates as the
    // hero scrolls, for a layered depth effect. (Transforms here sit on the
    // column wrappers, separate from the anime.js targets, so they don't clash.)
    useEffect(() => {
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (reduce) return;

        const textEl = textColRef.current;
        const modelEl = modelParallaxRef.current;
        if (!textEl || !modelEl) return;

        let raf = 0;
        const apply = () => {
            raf = 0;
            // Only meaningful while the hero is on screen.
            const y = Math.min(window.scrollY, window.innerHeight * 1.5);
            textEl.style.transform = `translateY(${y * 0.22}px)`;
            modelEl.style.transform = `translateY(${y * -0.12}px)`;
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(apply);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        apply();
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section
            ref={root}
            className="container grid grid-cols-1 items-center gap-12 py-20 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-2 lg:gap-10 lg:py-0"
        >
            {/* Left: text */}
            <div
                ref={textColRef}
                className="flex flex-col items-start gap-6 will-change-transform"
            >
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
                    I design and build fast, accessible web experiences with a focus
                    on clean architecture and details that feel alive.
                </p>

                <div className="hero-cta opacity-0">
                    <ContactButton />
                </div>
            </div>

            {/* Right: 3D model (outer wrapper handles parallax, inner the reveal) */}
            <div ref={modelParallaxRef} className="w-full will-change-transform">
                <div
                    ref={modelWrap}
                    className="hero-model h-[40vh] sm:h-[60vh] w-full opacity-0 lg:h-[80vh]"
                >
                    {showModel && <PCModel />}
                </div>
            </div>
        </section>
    );
}
