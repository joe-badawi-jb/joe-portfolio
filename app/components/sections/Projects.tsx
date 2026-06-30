"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import CodeBackdrop from "@/app/components/background/CodeBackdrop";

// Swiper clones slides for loop mode, which mismatches SSR — load client-only.
const ProjectsCarousel = dynamic(
    () => import("@/app/components/sections/ProjectsCarousel"),
    { ssr: false }
);
const CosmonautScene = dynamic(
    () => import("@/app/components/3dModels/CosmonautScene"),
    { ssr: false }
);

export default function Projects() {
    const root = useRef<HTMLElement>(null);
    const [showModel, setShowModel] = useState(false);

    // Mount the roaming background scene once the section is near, then keep it
    // mounted (avoids WebGL context churn / breakage on scroll).
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShowModel(true);
                    io.disconnect();
                }
            },
            { rootMargin: "20% 0px 20% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Switch back to the dark theme when this section takes over the viewport,
    // and back to light when scrolling up into the (light) sections above.
    // Only acts near its own boundary so it never fights the code-run section,
    // which owns the earlier dark -> light flip.
    useEffect(() => {
        const el = root.current;
        if (!el) return;

        let dark = false;
        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.top > vh * 1.5) return; // too far below to manage the theme
            const nextDark = rect.top <= vh * 0.5;
            if (nextDark !== dark) {
                dark = nextDark;
                document.documentElement.classList.toggle("theme-light", !dark);
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section
            id="projects"
            ref={root}
            className="relative overflow-x-hidden z-10 min-h-screen bg-surface transition-colors"
        >
            {/* Faint code wall, then the roaming cosmonaut, behind content. */}
            <CodeBackdrop className="z-0" />
            {showModel && (
                <div className="pointer-events-none absolute inset-0 z-[1]">
                    <CosmonautScene />
                </div>
            )}

            <div className="relative z-10">
                <div className="container py-20 md:py-28">
                    <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-blue transition-colors md:text-base">
                        {"// projects"}
                    </p>
                    <h2 className="mt-6 text-5xl font-bold tracking-tight transition-colors md:text-7xl xl:text-8xl">
                        Selected work
                    </h2>
                    <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted transition-colors md:text-2xl">
                        A selection of production websites I have contributed to as
                        part of the development team, spanning agritech,
                        hospitality, construction, healthcare, and more. Explore
                        each one live.
                    </p>
                </div>

                <div className="pb-24">
                    <ProjectsCarousel />
                </div>
            </div>
        </section>
    );
}
