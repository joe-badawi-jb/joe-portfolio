"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const StackIcon3D = dynamic(
    () => import("@/app/components/3dModels/StackIcon3D"),
    { ssr: false }
);
const ParticlesBackground = dynamic(
    () => import("@/app/components/background/ParticlesBackground"),
    { ssr: false }
);

type StackItem = { name: string; type: "3d" | "img"; src: string };

const STACK: StackItem[] = [
    { name: "HTML", type: "3d", src: "/assets/3d-models/html.glb" },
    { name: "CSS", type: "3d", src: "/assets/3d-models/css.glb" },
    { name: "SCSS", type: "img", src: "/assets/icons/scss.png" },
    { name: "Tailwind", type: "3d", src: "/assets/3d-models/tailwind.glb" },
    { name: "JavaScript", type: "3d", src: "/assets/3d-models/javascript.glb" },
    { name: "TypeScript", type: "3d", src: "/assets/3d-models/typescript.glb" },
    { name: "React", type: "3d", src: "/assets/3d-models/reactjs.glb" },
    { name: "Next.js", type: "img", src: "/assets/icons/nextjs.webp" },
    { name: "PHP", type: "3d", src: "/assets/3d-models/php.glb" },
    { name: "Laravel", type: "img", src: "/assets/icons/laravel.png" },
];

export default function TechStack() {
    const root = useRef<HTMLElement>(null);
    const [active, setActive] = useState(false);

    // Mount the canvases + particles once the section is near, then keep them.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setActive(true);
                    io.disconnect();
                }
            },
            { rootMargin: "20% 0px 20% 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Theme: light when this section covers the viewport, dark when scrolling
    // up into the (dark) projects section. Only acts near its own boundary.
    useEffect(() => {
        const el = root.current;
        if (!el) return;
        let light = false;
        let raf = 0;
        const update = () => {
            raf = 0;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            if (rect.top > vh * 1.5) return;
            const nextLight = rect.top <= vh * 0.5;
            if (nextLight !== light) {
                light = nextLight;
                document.documentElement.classList.toggle("theme-light", light);
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
            id="stack"
            ref={root}
            className="relative z-10 min-h-screen overflow-hidden bg-surface transition-colors"
        >
            {active && <ParticlesBackground className="absolute inset-0 z-0" />}

            <div className="container relative z-10 py-20 md:py-28">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-blue transition-colors md:text-base">
                    {"// stack"}
                </p>
                <h2 className="mt-6 text-5xl font-bold tracking-tight transition-colors md:text-7xl xl:text-8xl">
                    Tech stack
                </h2>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted transition-colors md:text-2xl">
                    The technologies I reach for most. Drag the{" "}
                    <span className="text-accent-blue">3D</span> ones to spin them.
                </p>

                <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                    {STACK.map((item) => (
                        <div
                            key={item.name}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-accent-blue/40 bg-surface-card transition-colors">
                                {item.type === "3d" ? (
                                    <>
                                        {active && <StackIcon3D path={item.src} />}
                                        <span className="pointer-events-none absolute right-2 top-2 rounded-md border border-accent-blue/50 bg-surface/70 px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-accent-blue">
                                            3D
                                        </span>
                                    </>
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.src}
                                        alt={item.name}
                                        className="h-full w-full object-contain p-6"
                                    />
                                )}
                            </div>
                            <span className="font-mono text-sm text-muted transition-colors">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
