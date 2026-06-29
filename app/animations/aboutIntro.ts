import { createScope, createTimeline, stagger, set } from "animejs";
import type { RefObject } from "react";

/**
 * About section intro — a scoped anime.js timeline played once the section
 * scrolls into view (see About.tsx). Elements start hidden (Tailwind
 * `opacity-0` / `w-0`) and are revealed in sequence:
 *   eyebrow -> title (word stagger) -> accent line -> description.
 */
export function createAboutIntro(
    root: RefObject<HTMLElement | null>,
    reducedMotion = false
) {
    return createScope({ root }).add(() => {
        if (reducedMotion) {
            set([".about-eyebrow", ".about-desc"], { opacity: 1, translateY: 0 });
            set(".about-title .word", { opacity: 1, translateY: 0 });
            set(".about-accent", { width: "6rem" });
            return;
        }

        const tl = createTimeline({
            defaults: { ease: "out(4)", duration: 850 },
        });

        tl.add(".about-eyebrow", {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
        })
            .add(
                ".about-title .word",
                { opacity: [0, 1], translateY: [44, 0], delay: stagger(60) },
                "-=250"
            )
            .add(
                ".about-accent",
                { width: ["0rem", "6rem"], duration: 700 },
                "-=400"
            )
            .add(
                ".about-desc",
                { opacity: [0, 1], translateY: [26, 0] },
                "-=450"
            );
    });
}
