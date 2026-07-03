"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import ContactButton from "@/app/components/buttons/ContactButton";
import InView from "@/app/components/ui/InView";

const ParticlesBackground = dynamic(
    () => import("@/app/components/background/ParticlesBackground"),
    { ssr: false }
);

// Warm the hobbies intro assets on hover so the page opens fast.
const PREFETCH = [
    "/assets/videos/nimbus.mp4",
    "/assets/images/anime-crossover.webp",
    "/assets/3d-models/goku_nimbus.glb",
];

export default function HobbiesTeaser() {
    const prefetched = useRef(false);
    const prefetch = () => {
        if (prefetched.current) return;
        prefetched.current = true;
        PREFETCH.forEach((u) => {
            fetch(u, { cache: "force-cache" })
                .then((r) => r.arrayBuffer())
                .catch(() => {});
        });
    };

    return (
        <section className="relative z-10 overflow-hidden bg-surface transition-colors">
            {/* Drifting particles, mounted only when the section is near. */}
            <InView className="absolute inset-0 z-0">
                <ParticlesBackground />
            </InView>

            <div className="container relative z-10 py-20 md:py-28">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-blue md:text-base">
                    {"// beyond the code"}
                </p>
                <h2 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl xl:text-8xl">
                    There&apos;s a whole other side to me
                </h2>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted md:text-2xl">
                    Anime, powerlifting, sports, and gaming — with a few
                    interactive surprises. Take a look at my hobbies page.
                </p>
                <div
                    className="mt-12 inline-block"
                    onMouseEnter={prefetch}
                    onFocus={prefetch}
                >
                    <ContactButton
                        href="/hobbies"
                        label="Explore my hobbies"
                    />
                </div>
            </div>
        </section>
    );
}
