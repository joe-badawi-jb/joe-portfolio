"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SpiralScene = dynamic(
    () => import("@/app/components/3dModels/SpiralScene"),
    { ssr: false }
);
const ParticlesBackground = dynamic(
    () => import("@/app/components/background/ParticlesBackground"),
    { ssr: false }
);

type Skill = { title: string; desc: string };

const SKILLS: Skill[] = [
    { title: "Team Leadership", desc: "Guiding teams to deliver with clarity and momentum." },
    { title: "Critical Thinking", desc: "Breaking complex problems into clean, simple solutions." },
    { title: "Problem Solving", desc: "Turning blockers into shipped, reliable features." },
    { title: "Communication", desc: "Bridging design, engineering, and stakeholders." },
    { title: "Adaptability", desc: "Thriving across new stacks, tools, and challenges." },
    { title: "Mentoring", desc: "Teaching and leveling up the people around me." },
];

// One card visible at a time; the rest are offset on Y + hidden so stepping
// reads as a slide-up transition. offset = index - activeIndex.
function cardClasses(offset: number): string {
    if (offset === 0) return "translate-y-0 opacity-100 z-10";
    return offset < 0
        ? "-translate-y-10 opacity-0 z-0 pointer-events-none"
        : "translate-y-10 opacity-0 z-0 pointer-events-none";
}

export default function SoftSkills() {
    const wrapRef = useRef<HTMLElement>(null);
    const activeRef = useRef(0); // source of truth (used by the spiral)
    const [activeIndex, setActiveIndex] = useState(0); // mirror, for the 2D deck
    const [active, setActive] = useState(false);
    const N = SKILLS.length;

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        // Mount the canvas once the section is near, then KEEP it mounted —
        // remounting the WebGL context on scroll garbles it on mobile.
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    io.disconnect();
                }
            },
            { rootMargin: "20% 0px 20% 0px" }
        );
        io.observe(wrap);

        // Scroll-driven: the active card is derived from how far the (tall)
        // section has scrolled under the sticky stage. This uses NATIVE scroll
        // — no preventDefault — so it works consistently on touch devices, and
        // the whole section responds to scrolling.
        let raf = 0;
        const update = () => {
            raf = 0;
            const total = wrap.offsetHeight - window.innerHeight;
            const scrolled = Math.min(
                Math.max(-wrap.getBoundingClientRect().top, 0),
                Math.max(total, 1)
            );
            const p = total > 0 ? scrolled / total : 0;
            const idx = Math.min(Math.floor(p * N), N - 1);
            if (idx !== activeRef.current) {
                activeRef.current = idx;
                setActiveIndex(idx);
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();

        return () => {
            io.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [N]);

    return (
        // Tall section; the deck is pinned in a sticky stage and the cards step
        // as you scroll through its height (~ one card per screenful).
        <section
            id="skills"
            ref={wrapRef}
            className="relative z-10 h-[340vh] bg-surface"
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                {active && (
                    <ParticlesBackground className="absolute inset-0 z-0" />
                )}
                {active && (
                    <div className="absolute inset-0 z-10">
                        <SpiralScene activeRef={activeRef} />
                    </div>
                )}

                {/* 2D stacked deck of skill cards */}
                <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                    <div className="relative h-56 w-full max-w-md">
                        {SKILLS.map((skill, i) => (
                            <div
                                key={skill.title}
                                className={`absolute inset-0 transition ${cardClasses(
                                    i - activeIndex
                                )}`}
                            >
                                <div className="flex h-full flex-col justify-center rounded-2xl border border-hairline bg-surface-card/90 p-8 shadow-xl backdrop-blur">
                                    <span className="font-mono text-sm text-accent-blue">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="mt-2 text-3xl font-bold md:text-4xl">
                                        {skill.title}
                                    </h3>
                                    <p className="mt-3 text-muted md:text-lg">
                                        {skill.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
