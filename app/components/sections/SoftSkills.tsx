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

const STEP_COOLDOWN = 650; // ms between slides — one slide per scroll gesture
const TOUCH_THRESHOLD = 24; // px of swipe before a step counts

// One slide at a time. Only the active card is visible; the others are hidden,
// offset on Y so stepping reads as a slide-up transition (next comes up from
// below, previous leaves upward). offset = index - activeIndex.
function cardClasses(offset: number): string {
    if (offset === 0) return "translate-y-0 opacity-100 z-10";
    return offset < 0
        ? "-translate-y-10 opacity-0 z-0 pointer-events-none"
        : "translate-y-10 opacity-0 z-0 pointer-events-none";
}

export default function SoftSkills() {
    const wrapRef = useRef<HTMLElement>(null);
    const activeRef = useRef(0); // source of truth (used by the spiral + handlers)
    const [activeIndex, setActiveIndex] = useState(0); // mirror, for the 2D deck
    const [active, setActive] = useState(false);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const N = SKILLS.length;

        // Mount the canvas once the section is near, then KEEP it mounted.
        // Repeatedly unmounting/remounting the WebGL canvas on scroll thrashes
        // the GL context (it breaks/garbles on mobile), so we latch it on.
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

        let cooldown = false;
        let engaged = false; // true while the section is locked + stepping
        const step = (dir: number) => {
            if (cooldown) return;
            const next = Math.min(Math.max(activeRef.current + dir, 0), N - 1);
            if (next === activeRef.current) return;
            activeRef.current = next;
            setActiveIndex(next);
            cooldown = true;
            setTimeout(() => {
                cooldown = false;
            }, STEP_COOLDOWN);
        };

        // Smoothly centre the section ONCE, when it first engages — no instant
        // jump, and crucially it never blocks stepping.
        const align = () => {
            const rect = wrap.getBoundingClientRect();
            if (Math.abs(rect.top) > 2) {
                window.scrollTo({
                    top: window.scrollY + rect.top,
                    behavior: "smooth",
                });
            }
        };

        const intent = (dir: number): "none" | "release" | "lock" => {
            const rect = wrap.getBoundingClientRect();
            const vh = window.innerHeight;
            const covering = rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5;
            if (!covering) return "none";
            const atTop = activeRef.current <= 0;
            const atEnd = activeRef.current >= N - 1;
            if ((dir > 0 && atEnd) || (dir < 0 && atTop)) return "release";
            return "lock";
        };

        const onWheel = (e: WheelEvent) => {
            const dir = Math.sign(e.deltaY);
            if (dir === 0) return;
            if (intent(dir) !== "lock") {
                engaged = false; // not covering / at edge -> let the page scroll
                return;
            }
            e.preventDefault();
            if (!engaged) {
                engaged = true;
                align(); // centre once on entry
            }
            step(dir); // and change a slide on the same scroll
        };

        let touchY = 0;
        const onTouchStart = (e: TouchEvent) => {
            touchY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            const dy = touchY - e.touches[0].clientY;
            const dir = Math.sign(dy);
            if (dir === 0) return;
            if (intent(dir) !== "lock") {
                engaged = false;
                return;
            }
            e.preventDefault();
            if (!engaged) {
                engaged = true;
                align();
            }
            if (Math.abs(dy) > TOUCH_THRESHOLD) {
                step(dir);
                touchY = e.touches[0].clientY;
            }
        };

        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });

        return () => {
            io.disconnect();
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
        };
    }, []);

    return (
        <section
            id="skills"
            ref={wrapRef}
            className="relative z-10 h-screen overflow-hidden bg-surface"
        >
            {active && <ParticlesBackground className="absolute inset-0 z-0" />}
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
        </section>
    );
}
